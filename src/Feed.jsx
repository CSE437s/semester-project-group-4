import './css/feed.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Post from './components/Post'; // A new component for music posts

// Mock data for demonstration
const mockPosts = [
    {
        id: 1,
        user: 'Friend 1',
        songTitle: 'Song Title 1',
        artist: 'Artist 1',
        likes: 10,
        comments: [
            { user: 'User A', comment: 'Great song!' },
            { user: 'User B', comment: 'Love this!' },
        ],
    },
    {
        id: 2,
        user: 'Friend 2',
        songTitle: 'Song Title 2',
        artist: 'Artist 2',
        likes: 20,
        comments: [
            { user: 'User C', comment: 'My favorite.' },
        ],
    },
];

const Feed = () => {
    const [posts, setPosts] = useState(mockPosts);

    useEffect(() => {
        setPosts(mockPosts); // In a real app, you would fetch this data
    }, []);

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <div className="header">
                    <h2>Feed</h2>
                    <p className="headerText">View what your friends have been listening to</p>
                </div>
                {posts.map(post => (
                    <Post key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
};

export default Feed;
