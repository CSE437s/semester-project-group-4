import './css/share.css'
import './css/Profile.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function Profile({ session }) {

    const [friendCount, setFriendCount] = useState(0);
    // const [following, setFollowing] = useState(0);


    useEffect(() => {
        let ignore = false;
        async function getProfile() {
            const { user } = session;

            const { data, error } = await supabase
                .from('profiles')
                .select('friendCount')
                .eq('id', user.id)
                .single();

            if (!ignore) {
                if (error) {
                    console.warn(error);
                } else if (data) {
                    setFriendCount(data.friendCount);
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
                <div className="sidebar-title">groove</div>
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
                        <p>Friends: {friendCount}</p>
                        {/* <p>Following: {following}</p> */}
                        <button>Add Friend</button>
                        <button>Connect to Spotify</button>
                    </div>
                </div>
            </div>
        </div>
    );
};