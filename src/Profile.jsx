import './css/Profile.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Import your Supabase client
import Sidebar from './components/Sidebar';

export default function Profile({ session }) {

    const [friendCount, setFriendCount] = useState(0);
    const [username, setUsername] = useState('');


    let client_id = "1892c29e22e44ec686fa22a8e891b0f9";
    let redirect = "http://localhost:5173/Share"; //takes us back here after agreeing to Spotify

    const AUTHORIZE = "https://accounts.spotify.com/authorize";

    // useEffect(() => {
    //     let ignore = false;
    //     async function getProfile() {
    //         const { user } = session;

    //         const { data, error } = await supabase
    //             .from('profiles')
    //             .select('friendCount')
    //             .eq('id', user.id)
    //             .single();

    //         if (!ignore) {
    //             if (error) {
    //                 console.warn(error);
    //             } else if (data) {
    //                 setFriendCount(data.friendCount);
    //             }
    //         }
    //     }

    //     getProfile();

    //     return () => {
    //         ignore = true;
    //     }
    // }, [session]);

    function authorize() {
        let url = AUTHORIZE;
        url += "?client_id=" + client_id;
        url += "&response_type=code";
        url += "&redirect_uri=" + encodeURI(redirect);
        url += "&show_dialog=true";
        url += "&scope=user-read-private user-read-email user-read-playback-state user-top-read";
        window.location.href = url;
    }

    const handleAddFriend = async () => {
        //find other users uuid
        const { data: friendData, error: friendError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

        if (friendError) {
            console.error('Error fetching friend UUID: ', friendError);
            alert("Could not find a friend with this username");
            return;
        }

        //add both your ids to list
        if (!friendData) {
            alert('No user found with this username');
            return;
        }

        // Check if they are already friends (buggy dont uncomment)
        // const { data: alreadyFriendsData, error: alreadyFriendsError } = await supabase
        //     .from('friends')
        //     .select('*')
        //     .eq('id', session.user.id)
        //     .eq('is_friends_with', friendData.id)
        //     .single();

        // if (alreadyFriendsError) {
        //     console.error('Error checking friendship status: ', alreadyFriendsError);
        //     alert("sorry there was an error");
        //     return;
        // }

        // if (alreadyFriendsData) {
        //     console.log('You are already friends with this user');
        //     alert("you are already friends");
        //     return;
        // }
        //end check if already friend
        const { data, error } = await supabase
            .from('friends')
            .insert([
                { id: session.user.id, is_friends_with: friendData.id },
            ]);

        if (error) {
            console.error('Error adding friend: ', error);
        } else {
            console.log('Friend added successfully: ', data);
            alert("friend added");
        }
    };


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
                        <p>Friends: {friendCount}</p>
                        <input type="text" placeholder="Enter friend's username" value={username} onChange={e => setUsername(e.target.value)} />
                        <button onClick={handleAddFriend}>Add Friend</button>
                        <button onClick={authorize}>Connect to Spotify</button>
                    </div>
                </div>
            </div>
        </div>
    );
};