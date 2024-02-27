import './css/share.css'
import './css/Profile.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function Profile({ session }) {

    const [friendCount, setFriendCount] = useState(0);
    const [username, setUsername] = useState('');

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

    const handleAddFriend = async () => {
        //find other users uuid
        const { data: friendData, error: friendError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();
    
        if (friendError) {
            console.error('Error fetching friend UUID: ', friendError);
            return;
        }
    
        //add both your ids to list
        if (!friendData) {
            console.error('No user found with this username');
            return;
        }
            const { data, error } = await supabase
            .from('friends')
            .insert([
                { id: session.user.id, is_friends_with: friendData.id },
            ]);
    
        if (error) {
            console.error('Error adding friend: ', error);
        } else {
            console.log('Friend added successfully: ', data);
        }
    };
    

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
                        <input type="text" placeholder="Enter friend's username" value={username} onChange={e => setUsername(e.target.value)} />
                        <button onClick={handleAddFriend}>Add Friend</button>
                        {/* <button>Connect to Spotify</button> */}
                    </div>
                </div>
            </div>
        </div>
    );
};