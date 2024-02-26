import './css/share.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Import your Supabase client


export default function Profile({ session }) {

    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);

    useEffect(() => {
        let ignore = false;
        async function getProfile() {
            const { user } = session;

            const { data, error } = await supabase
                .from('profiles')
                .select(`followingCount, followerCount`)
                .eq('id', user.id)
                .single();

            if (!ignore) {
                if (error) {
                    console.warn(error);
                } else if (data) {
                    setFollowers(data.followerCount);
                    setFollowing(data.followingCount);
                }
            }
        }

        getProfile();

        return () => {
            ignore = true;
        }
    }, [session]);

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