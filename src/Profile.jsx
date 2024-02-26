import './css/share.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Import your Supabase client

const Profile = () => {
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);

    useEffect(() => {
        // Fetch followers and following counts from the users list
        const fetchCounts = async (userId) => {
            let user = users.find(user => user.id === userId);
            if (user) {
                setFollowers(user.followerCount);
                setFollowing(user.followingCount);
            }
        };

        fetchCounts('session.user.id');
    }, [users]);

    return (
        <div className="app-container">
            <div className="sidebar">
                <div className="sidebar-title">Groove</div>
                <div className="sidebar-buttons">
                    <Link to="/Profile" className="sidebar-button">Profile</Link>
                    <Link to="/Share" className="sidebar-button">Share</Link>
                    <Link to="/Feed" className="sidebar-button">Feed</Link>
                </div>
            </div>
            <div className="main-content">
                <div className="profile-page">
                    <div className="profile-section">
                        <img src="profile.jpg" alt="Profile" className="profile-picture" />
                        <p>Followers: {followers}</p>
                        <p>Following: {following}</p>
                        <button>Add Friend</button>
                        <button>Connect to Spotify</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
