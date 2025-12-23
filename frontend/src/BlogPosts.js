// Blog posts UI (insecure branch)
// Purpose: demonstrate CRUD that is intentionally missing auth/CSRF and is vulnerable to XSS.
// Security notes:
// - Calls /posts without JWT.
// - Sends user-controlled content that backend stores unsafely (SQLi in backend) and returns raw.
// - Renders `post.content` as HTML (dangerouslySetInnerHTML) to demonstrate XSS.
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { maybeGetCsrfToken } from './csrf';



function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);

  const buildHeaders = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const csrfToken = await maybeGetCsrfToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
    return headers;
  };



  // Fetch posts (insecure: no auth).
  const fetchPosts = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    axios.get('/posts', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
      .then(res => setPosts(res.data))
      .catch(err => {
        if (err?.response?.status === 401) {
          setMessage('Not authenticated. Please log in again.');
          return;
        }
        setMessage('Error fetching posts');
      });
  };



  // Fetch posts on mount.
  useEffect(() => {
    fetchPosts();
  }, []);


  // Controlled inputs.
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // Create or update post (insecure: no CSRF/auth).
  const handleSubmit = async e => {
    e.preventDefault();
    const headers = await buildHeaders();
    if (editId) {
      axios.put(`/posts/${editId}`, form, { headers })
        .then(() => { setMessage('Post updated!'); setEditId(null); fetchPosts(); })
        .catch(() => setMessage('Error updating post'));
    } else {
      axios.post('/posts', form, { headers })
        .then(() => { setMessage('Post created!'); fetchPosts(); })
        .catch(() => setMessage('Error creating post'));
    }
  };


  // Enter edit mode.
  const handleEdit = post => {
    setEditId(post.id);
    setForm({ title: post.title, content: post.content });
  };


  // Delete post (insecure: no CSRF/auth).
  const handleDelete = async id => {
    const headers = await buildHeaders();
    axios.delete(`/posts/${id}`, { headers })
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
            {/* Intentionally unsafe rendering for XSS demonstration. */}
            <b>{post.title}</b>: <span dangerouslySetInnerHTML={{ __html: post.content }} />
            <button onClick={() => handleEdit(post)}>Edit</button>
            <button onClick={() => handleDelete(post.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BlogPosts;