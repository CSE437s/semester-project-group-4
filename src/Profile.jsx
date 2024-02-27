import './css/profile.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Import your Supabase client
import Sidebar from './components/Sidebar';

export default function Profile({ session }) {

    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);


    let client_id= "1892c29e22e44ec686fa22a8e891b0f9";
    let redirect = "http://localhost:5173/Share"; //takes us back here after agreeing to Spotify
  
    const AUTHORIZE = "https://accounts.spotify.com/authorize";

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

    function authorize() {
        let url = AUTHORIZE;
        url += "?client_id=" + client_id;
        url += "&response_type=code";
        url += "&redirect_uri=" + encodeURI(redirect);
        url += "&show_dialog=true";
        url += "&scope=user-read-private user-read-email user-read-playback-state user-top-read";
        window.location.href = url;
      }

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <div className="profile-page">
                    <div className="header">
                        <h2>Profile</h2>
                    </div>
                    <div className="profile-section">
                        <img src="profile.jpg" alt="Profile" className="profile-picture" />
                        <p>Followers: {followers}</p>
                        <p>Following: {following}</p>
                        <button>Add Friend</button>
                        <button onClick={authorize}>Connect to Spotify</button>
                    </div>
                </div>
            </div>
        </div>
    );
};