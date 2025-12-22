

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCsrfToken } from './csrf';

// Ensure cookies are sent with all requests (needed for CSRF cookie)
axios.defaults.withCredentials = true;

function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);

  // Fetch posts
  const fetchPosts = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    axios.get('http://localhost:4000/posts', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setPosts(res.data))
      .catch(() => setMessage('Error fetching posts'));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle form changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update post
  const handleSubmit = async e => {
    e.preventDefault();
    const csrfToken = await getCsrfToken();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (editId) {
      axios.put(`http://localhost:4000/posts/${editId}`, form, {
        headers: { 'X-CSRF-Token': csrfToken, Authorization: `Bearer ${token}` }
      })
        .then(() => { setMessage('Post updated!'); setEditId(null); setForm({ title: '', content: '' }); fetchPosts(); })
        .catch(() => setMessage('Error updating post'));
    } else {
      axios.post('http://localhost:4000/posts', form, {
        headers: { 'X-CSRF-Token': csrfToken, Authorization: `Bearer ${token}` }
      })
        .then(() => { setMessage('Post created!'); setForm({ title: '', content: '' }); fetchPosts(); })
        .catch(() => setMessage('Error creating post'));
    }
  };

  // Edit post
  const handleEdit = post => {
    setEditId(post.id);
    setForm({ title: post.title, content: post.content });
  };

  // Delete post
  const handleDelete = async id => {
    const csrfToken = await getCsrfToken();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    axios.delete(`http://localhost:4000/posts/${id}`, {
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