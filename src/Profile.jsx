import './css/Profile.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Import your Supabase client
import Sidebar from './components/Sidebar';
import axios from 'axios'; // for API requests

export default function Profile({ session }) {

    const [friendCount, setFriendCount] = useState(0);
    const [username, setUsername] = useState('');
    
    // const axios = require('axios');
    // const qs = require('qs');

    //const client_id = process.env.REACT_APP_SPOTIFY_API_ID; // Your client id
    //const client_secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET; // Your secret
    //const auth_token = Buffer.from(`${client_id}:${client_secret}`, 'utf-8').toString('base64');


    let client_id = "1892c29e22e44ec686fa22a8e891b0f9";
    let redirect = "http://localhost:5173/Share"; //takes us back here after agreeing to Spotify
    // let redirect = "https://semester-project-group-4.vercel.app/Share" //use for vercel host
    const clientId = "1892c29e22e44ec686fa22a8e891b0f9";
    const redirectUri = "http://localhost:5173/Share";
    const scope = 'user-read-private user-read-email user-top-read';

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

    async function redirectToSpotifyAuthorize() {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomValues = crypto.getRandomValues(new Uint8Array(64));
        const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");
      
        const code_verifier = randomString;
        const data = new TextEncoder().encode(code_verifier);
        const hashed = await crypto.subtle.digest('SHA-256', data);
      
        const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
          .replace(/=/g, '')
          .replace(/\+/g, '-')
          .replace(/\//g, '_');
      
        window.localStorage.setItem('code_verifier', code_verifier);
        console.log(code_verifier);
      
        const authUrl = new URL("https://accounts.spotify.com/authorize");
        const params = {
          response_type: 'code',
          client_id: clientId,
          scope: scope,
          code_challenge_method: 'S256',
          code_challenge: code_challenge_base64,
          redirect_uri: redirectUri,
        };
      
        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
    }

    async function loginWithSpotifyClick() {
        await redirectToSpotifyAuthorize();
    }

    async function authorize() {
        const generateRandomString = (length) => {
            const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const values = crypto.getRandomValues(new Uint8Array(length));
            return values.reduce((acc, x) => acc + possible[x % possible.length], "");
        };
        
        const codeVerifier  = generateRandomString(64);
        console.log("in profile verif: " + codeVerifier);
        
        const sha256 = async (plain) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)
        return window.crypto.subtle.digest('SHA-256', data)
        };
        
        const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        };
    
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64encode(hashed);
        
        const scope = 'user-read-private user-read-email user-top-read';
        const authUrl = new URL("https://accounts.spotify.com/authorize")
        
        // generated in the previous step
        window.localStorage.setItem('code_verifier', codeVerifier);
        
        const params =  {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
        }
        
        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();





        // let redirect_uri = "http://localhost:8000/callback";

        // let url = AUTHORIZE;
        // url += "?client_id=" + client_id;
        // url += "&response_type=code";
        // url += "&redirect_uri=" + encodeURI(redirect);
        // url += "&show_dialog=true";
        // url += "&scope=user-read-private user-read-email user-read-playback-state user-top-read";
        // window.location.href = url;
        
        // const response = await axios.get('http://localhost:8000/login');
        // console.log(response.data);
        // window.location.href = response;

        // axios.get('http://localhost:8080/login')
        // .then(response => {
        //     // Handle response
        //     console.log(response);
        // })
        // .catch(error => {
        //     // Handle error
        //     console.error(error);
        // });
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
                        {/* <p>Friends: {friendCount}</p> */}
                        <input type="text" placeholder="Enter friend's username" value={username} onChange={e => setUsername(e.target.value)} />
                        <button onClick={handleAddFriend}>Add Friend</button>
                        <button onClick={loginWithSpotifyClick}>Connect to Spotify</button>
                    </div>
                </div>
            </div>
        </div>
    );
};