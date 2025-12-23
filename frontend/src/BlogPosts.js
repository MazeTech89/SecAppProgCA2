// Blog post UI (CRUD)
// Security notes:
// - Uses JWT (Authorization: Bearer) for authentication.
// - Uses CSRF token for state-changing requests (cookie-based CSRF protection on backend).
// - Renders post content via dangerouslySetInnerHTML for demo purposes; backend output-encodes content to reduce XSS risk.
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCsrfToken } from './csrf';

// Ensure cookies are sent with all requests (needed for CSRF cookie).
axios.defaults.withCredentials = true;

function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);

  // Read posts (GET /posts) and populate list.
  const fetchPosts = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    axios.get('/posts', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setPosts(res.data))
      .catch(() => setMessage('Error fetching posts'));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Controlled inputs.
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update post (POST/PUT) with CSRF + JWT.
  const handleSubmit = async e => {
    e.preventDefault();
    const csrfToken = await getCsrfToken();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (editId) {
      axios.put(`/posts/${editId}`, form, {
        headers: { 'X-CSRF-Token': csrfToken, Authorization: `Bearer ${token}` }
      })
        .then(() => { setMessage('Post updated!'); setEditId(null); setForm({ title: '', content: '' }); fetchPosts(); })
        .catch(() => setMessage('Error updating post'));
    } else {
      axios.post('/posts', form, {
        headers: { 'X-CSRF-Token': csrfToken, Authorization: `Bearer ${token}` }
      })
        .then(() => { setMessage('Post created!'); setForm({ title: '', content: '' }); fetchPosts(); })
        .catch(() => setMessage('Error creating post'));
    }
  };

  // Enter edit mode by copying fields into the form.
  const handleEdit = post => {
    setEditId(post.id);
    setForm({ title: post.title, content: post.content });
  };

  // Delete post (DELETE) with CSRF + JWT.
  const handleDelete = async id => {
    const csrfToken = await getCsrfToken();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    axios.delete(`/posts/${id}`, {
      headers: { 'X-CSRF-Token': csrfToken, Authorization: `Bearer ${token}` }
    })
      .then(() => { setMessage('Post deleted!'); fetchPosts(); })
      .catch(() => setMessage('Error deleting post'));
  };

  return (
    <div>
      <h2>Blog Posts</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input name="content" placeholder="Content" value={form.content} onChange={handleChange} required />
        <button type="submit">{editId ? 'Update' : 'Create'} Post</button>
      </form>
      {message && <div>{message}</div>}
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            {/* Content is inserted as HTML for demonstration; backend returns encoded strings to prevent script execution. */}
            <b>{post.title}</b> by User {post.user_id}: <span dangerouslySetInnerHTML={{ __html: post.content }} />
            <button onClick={() => handleEdit(post)}>Edit</button>
            <button onClick={() => handleDelete(post.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BlogPosts;