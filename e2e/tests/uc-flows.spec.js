const { test, expect } = require('@playwright/test');

function uniq(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

async function register(page, username, password) {
  await page.goto('/register');
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByText('Registration successful!')).toBeVisible();
}

async function login(page, username, password) {
  await page.goto('/login');
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/users');
  await expect(page.getByRole('heading', { name: 'User List' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Blog Posts' })).toBeVisible();
}

async function logout(page) {
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.waitForURL('**/login');
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
}

test('UC1 + UC2 normal: register then login', async ({ page }) => {
  const username = uniq('user');
  const password = 'P@ssw0rd123';

  await register(page, username, password);
  await login(page, username, password);
});

test('UC3/UC4 normal: after login, user list and posts load', async ({ page }) => {
  const username = uniq('user');
  const password = 'P@ssw0rd123';

  await register(page, username, password);
  await login(page, username, password);

  // At least the logged-in user should appear in the User List (not the nav menu).
  const userListSection = page.getByRole('heading', { name: 'User List' }).locator('..');
  await expect(userListSection.locator('ul')).toContainText(username);
});

test('UC5 normal + XSS regression: create post and verify script is not interpreted as HTML', async ({ page }) => {
  const username = uniq('xss');
  const password = 'P@ssw0rd123';

  await register(page, username, password);
  await login(page, username, password);

  const title = 'Hello';
  const content = '<script>alert(1)</script>';

  await page.getByPlaceholder('Title').fill(title);
  await page.getByPlaceholder('Content').fill(content);
  await page.getByRole('button', { name: 'Create Post' }).click();

  await expect(page.getByText('Post created!')).toBeVisible();

  // Backend encodes output, so the UI should show the literal script tag text.
  await expect(page.getByText('<script>alert(1)</script>')).toBeVisible();
});

test('UC6 alternate: other user cannot edit/delete another user\'s post (ownership enforced)', async ({ page, browser }) => {
  const password = 'P@ssw0rd123';

  const userA = uniq('A');
  const userB = uniq('B');

  // User A registers, logs in, creates a post.
  await register(page, userA, password);
  await login(page, userA, password);

  await page.getByPlaceholder('Title').fill('Owned by A');
  await page.getByPlaceholder('Content').fill('A content');
  await page.getByRole('button', { name: 'Create Post' }).click();
  await expect(page.getByText('Post created!')).toBeVisible();

  const blogSection = page.getByRole('heading', { name: 'Blog Posts' }).locator('..');
  const postA = blogSection.locator('li', { hasText: 'Owned by A' });
  await expect(postA).toBeVisible();

  // Log out A.
  await logout(page);

  // New browser context for user B (avoid token leakage).
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();

  await register(pageB, userB, password);
  await login(pageB, userB, password);

  const blogSectionB = pageB.getByRole('heading', { name: 'Blog Posts' }).locator('..');
  const postAB = blogSectionB.locator('li', { hasText: 'Owned by A' });
  await expect(postAB).toBeVisible();

  // Try to delete A's post; should fail (backend returns 404, UI shows error).
  await postAB.getByRole('button', { name: 'Delete' }).click();
  await expect(pageB.getByText('Error deleting post')).toBeVisible();

  // Try to edit A's post; should fail (backend returns 404, UI shows error).
  await postAB.getByRole('button', { name: 'Edit' }).click();
  await pageB.getByPlaceholder('Title').fill('Hacked');
  await pageB.getByPlaceholder('Content').fill('Nope');
  await pageB.getByRole('button', { name: 'Update Post' }).click();
  await expect(pageB.getByText('Error updating post')).toBeVisible();

  await ctxB.close();
});

test('UC7 normal: logout removes access to protected route', async ({ page }) => {
  const username = uniq('logout');
  const password = 'P@ssw0rd123';

  await register(page, username, password);
  await login(page, username, password);

  await logout(page);

  // Attempt to navigate to protected route: should redirect to login.
  await page.goto('/users');
  await page.waitForURL('**/login');
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});
