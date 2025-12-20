
import React, { useEffect, useState } from 'react';
import axios from 'axios';



function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);


  // Get JWT token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Fetch posts (secure)
  const fetchPosts = () => {
    axios.get('http://localhost:4000/posts', {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => setPosts(res.data))
      .catch(() => setMessage('Error fetching posts'));
  };



  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);


  // Handle form changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // Create or update post (secure)
  const handleSubmit = e => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };
    if (editId) {
      axios.put(`http://localhost:4000/posts/${editId}`, form, config)
        .then(() => { setMessage('Post updated!'); setEditId(null); fetchPosts(); })
        .catch(() => setMessage('Error updating post'));
    } else {
      axios.post('http://localhost:4000/posts', form, config)
        .then(() => { setMessage('Post created!'); fetchPosts(); })
        .catch(() => setMessage('Error creating post'));
    }
  };


  // Edit post
  const handleEdit = post => {
    setEditId(post.id);
    setForm({ title: post.title, content: post.content });
  };


  // Delete post (secure)
  const handleDelete = id => {
    axios.delete(`http://localhost:4000/posts/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
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
            <b>{post.title}</b>: <span>{post.content}</span>
            <button onClick={() => handleEdit(post)}>Edit</button>
            <button onClick={() => handleDelete(post.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BlogPosts;