
import React, { useEffect, useState } from 'react';
import axios from 'axios';


function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ user_id: '', title: '', content: '' });
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);
  const [userIds, setUserIds] = useState([]);

  // Fetch posts
  const fetchPosts = () => {
    axios.get('http://localhost:4000/insecure/posts')
      .then(res => setPosts(res.data))
      .catch(() => setMessage('Error fetching posts'));
  };


  // Fetch user IDs for selection
  useEffect(() => {
    axios.get('http://localhost:4000/insecure/users')
      .then(res => setUserIds(res.data.map(u => u.id)))
      .catch(() => setUserIds([]));
    fetchPosts();
  }, []);

  // Handle form changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update post
  const handleSubmit = e => {
    e.preventDefault();
    if (editId) {
      axios.put(`http://localhost:4000/insecure/posts/${editId}`, form)
        .then(() => { setMessage('Post updated!'); setEditId(null); fetchPosts(); })
        .catch(() => setMessage('Error updating post'));
    } else {
      axios.post('http://localhost:4000/insecure/posts', form)
        .then(() => { setMessage('Post created!'); fetchPosts(); })
        .catch(() => setMessage('Error creating post'));
    }
  };

  // Edit post
  const handleEdit = post => {
    setEditId(post.id);
    setForm({ user_id: post.user_id, title: post.title, content: post.content });
  };

  // Delete post
  const handleDelete = id => {
    axios.delete(`http://localhost:4000/insecure/posts/${id}`)
      .then(() => { setMessage('Post deleted!'); fetchPosts(); })
      .catch(() => setMessage('Error deleting post'));
  };

  return (
    <div>
      <h2>Blog Posts (Insecure Demo)</h2>
      <form onSubmit={handleSubmit}>
        <select name="user_id" value={form.user_id} onChange={handleChange} required>
          <option value="">Select User ID</option>
          {userIds.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
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