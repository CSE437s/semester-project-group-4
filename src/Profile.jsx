import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import ProfilePicture from './components/ProfilePicture';
import './css/Profile3.css';


export default function Profile({ session }) {
    const [friendCount, setFriendCount] = useState(0);
    const [myusername, setmyUsername] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(null);
    const [editedSoulArtist, setEditedSoulArtist] = useState('');
    const [editedBio, setEditedBio] = useState('');
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingSoulArtist, setIsEditingSoulArtist] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);

    //SPOTIFY

    const clientId = "1892c29e22e44ec686fa22a8e891b0f9";
    //const clientId = process.env.REACT_APP_SPOTIFY_API_ID; // Your client id


    const currentDomain = window.location.origin;
    const redirectUri = `${currentDomain}/Share`;

    const scope = 'user-read-private user-read-email user-top-read';

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

    //END SPOTIFY

    useEffect(() => {
        fetchUsername();
    }, [session]);





    async function fetchUsername() {
        const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single();
        if (error) {
            console.error('Error fetching username profile.jsx:', error);
        }
        setmyUsername(data.username);
        console.log("data", data)
        console.log("muuseraname", myusername);
        console.log("data.user", data.username);
        setIsEditing(false);
    }


    const updateUsername = async () => {
        try {

            const { error } = await supabase
                .from('profiles')
                .update({ username: newUsername })
                .eq('id', session.user.id);

            if (error) {
                throw error;
            }

            setmyUsername(newUsername);
            setIsEditing(false);

        } catch (error) {
            console.error('Error updating username:', error.message);
        }
    };

    useEffect(() => {
        const fetchOnboarded = async () => {
            try {
                if (session !== null) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('hasOnboarded')
                        .eq('id', session.user.id)
                        .single();
                    if (error) {
                        console.error('Error fetching onboarding boolean:', error);
                        return;
                    } else {
                        if (session !== null && !data.hasOnboarded) {
                            const currentDomain = window.location.origin;
                            const targetUrl = `${currentDomain}/Onboarding`;
                            window.location.href = targetUrl;
                        }
                    }
                }
            } catch (error) {
                console.error('Unexpected error fetching onboarding status:', error);
            }
        };

        fetchOnboarded();
    }, [session]);


    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();
                if (error) {
                    console.error("Error fetching user profile:", error.message);
                    return null;
                }
                if (data) {
                    setProfile(data);
                    setEditedSoulArtist(data.soulArtist || '');
                    setEditedBio(data.bio || '');
                    setNewUsername(data.username || ''); 
                    console.log("profile: ", data)
                } else {
                    console.error("User profile not found");
                    return null;
                }
            } catch (error) {
                console.error("Error fetching user profile:", error.message);
                return null;
            }
        }

        async function fetchFriendCount() {
            try {
                const { data, error } = await supabase
                    .from('friends')
                    .select('id', { count: 'exact' }) // Count the number of friends
                    .eq('id', session.user.id);
                if (error) {
                    console.error('Error fetching friend count:', error.message);
                    return;
                }
                if (data) {
                    setFriendCount(data.length);
                } else {
                    console.error('No friend count data found');
                }
            } catch (error) {
                console.error('Error fetching friend count:', error.message);
            }
        }


        fetchFriendCount();
        fetchUserProfile();
    }, [session]);

    const updateSoulArtist = async () => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ soulArtist: editedSoulArtist })
                .eq('id', session.user.id);
            if (error) {
                throw error;
            }
            setIsEditingSoulArtist(false);
            setProfile({ ...profile, soulArtist: editedSoulArtist });
        } catch (error) {
            console.error('Error updating soul artist:', error.message);
        }
    };

    const updateBio = async () => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ bio: editedBio })
                .eq('id', session.user.id);
            if (error) {
                throw error;
            }
            setIsEditingBio(false);
            setProfile({ ...profile, bio: editedBio });
        } catch (error) {
            console.error('Error updating bio:', error.message);
        }
    };

    return (
        <div className="app-container bg-light">
            <Sidebar />
            <div id="page_content_id" className="main-content">
                <div className="header">
                    <h2>Profile</h2>
                </div>
                <div className="profile-section">
                    <div className="profile-info">
                        <ProfilePicture />

                        <div id="nameChange" className="flex justify-center items-center">
                            {isEditing ? (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        onClick={updateUsername}
                                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setNewUsername(""); // Reset input field
                                        }}
                                        className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <p className="text-gray-700">Username: {myusername}</p>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="text-center mt-2 button-container">
                            <button onClick={loginWithSpotifyClick} className="profileButton text-white py-2 px-4">Connect to Spotify</button>
                            <Link to="/Friends" className="purple-button text-white py-2 px-4">My Friends</Link>
                        </div>


                    </div>
                    <div className="text-center mt-2">
                        <div className="section-container">
                            <div id="friendCount" className="text-center mt-2">
                                <p>{friendCount} Friends</p>
                            </div>
                        </div>




                        {profile && (
                            <div>
                                <div className="section-container">
                                    <p className="section-header">Soul Artist:</p>
                                    {isEditingSoulArtist ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editedSoulArtist}
                                                onChange={(e) => setEditedSoulArtist(e.target.value)}
                                                className="border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:border-blue-500"
                                            />
                                            <button
                                                onClick={updateSoulArtist}
                                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    fetchUsername();
                                                    setIsEditingSoulArtist(false);
                                                }}
                                                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="section-content">{profile.soulArtist ? profile.soulArtist : "None selected"}</p>
                                            <button
                                                onClick={() => setIsEditingSoulArtist(true)}
                                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </div>
                                <div className="section-container">
                                    <p className="section-header">Bio:</p>
                                    {isEditingBio ? (
                                        <>
                                            <textarea
                                                value={editedBio}
                                                onChange={(e) => setEditedBio(e.target.value)}
                                                className="border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:border-blue-500"
                                                rows={4}
                                            />
                                            <button
                                                onClick={updateBio}
                                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    fetchUsername();
                                                    setIsEditingBio(false);
                                                }}
                                                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="section-content">{profile.bio}</p>
                                            <button
                                                onClick={() => setIsEditingBio(true)}
                                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}


                    </div>
                </div>
            </div>
        </div>
    );
}