import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faTrash } from '@fortawesome/free-solid-svg-icons';
import './css/Profile3.css';


export default function Profile({ session }) {
    const [friendCount, setFriendCount] = useState(0);
    const [username, setUsername] = useState('');
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);

    //SPOTIFY

    const clientId = "1892c29e22e44ec686fa22a8e891b0f9";
    //const clientId = process.env.REACT_APP_SPOTIFY_API_ID; // Your client id

    const redirectUri = "http://localhost:5173/Share"; //takes us back here after agreeing to Spotify
    // let redirectUri = "https://semester-project-group-4.vercel.app/Share" //use for vercel host

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
        getFriends();
        getPendingRequests();
    }, [session]);

    async function getPendingRequests() {
        const { data: pendingData, error } = await supabase
            .from('friend_requests')
            .select('from_user')
            .eq('to_user', session.user.id);

        if (error) {
            console.error('Error fetching pending requests:', error);
            return;
        }

        if (pendingData) {
            const pendingUserIds = pendingData.map(request => request.from_user);
            const pendingUsernames = await Promise.all(pendingUserIds.map(async id => {
                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', id)
                    .single();
                if (userError) {
                    console.error(`Error fetching username for user id ${id}:`, userError);
                    return null;
                }
                return userData ? userData.username : null;
            }));
            setPendingRequests(pendingUsernames.filter(username => username !== null));
            console.log("pendingRequests: " + pendingUsernames.filter(username => username !== null));
        }
    }


    async function handleAcceptRequest(fromUserId) {
        // Add the friendship
        await addFriend(fromUserId);
        // Remove the request
        await removeRequest(fromUserId);
    }

    async function handleRejectRequest(fromUserId) {
        // Remove the request
        await removeRequest(fromUserId);
    }

    async function removeRequest(fromUsername) {
        // Fetch fromUserId from the profiles table using fromUsername
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', fromUsername)
            .single();

        if (profilesError) {
            console.error('Error fetching fromUserId:', profilesError);
            return;
        }

        // If fromUserId is not found, handle the error
        if (!profilesData) {
            console.error('User not found with the given username:', fromUsername);
            return;
        }

        const fromUserId = profilesData.id;

        // Delete the request from the friend_requests table
        const { error } = await supabase
            .from('friend_requests')
            .delete()
            .eq('from_user', fromUserId)
            .eq('to_user', session.user.id);

        if (error) {
            console.error('Error removing request:', error);
        } else {
            console.log('Request removed successfully');
            getPendingRequests();
        }
    }

    async function addFriend(friendUsername) {
        // Fetch friendID from the profiles table using friendUsername
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', friendUsername)
            .single();

        if (profilesError) {
            console.error('Error fetching friendID:', profilesError);
            return;
        }

        // If friendID is not found, handle the error
        if (!profilesData) {
            console.error('Friend not found with the given username:', friendUsername);
            return;
        }

        const friendId = profilesData.id;

        // Insert records into the friends table
        const { data, error } = await supabase
            .from('friends')
            .insert([
                { id: session.user.id, is_friends_with: friendId },
                { id: friendId, is_friends_with: session.user.id }
            ]);

        if (error) {
            console.error('Error adding friend:', error);
        } else {
            console.log('Friend added successfully:', data);
            getFriends();
        }
    }


    async function handleRemoveFriend(friendUsername) {
        // Fetch friend's UUID from the friends table
        const { data: friendsData, error: friendError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', friendUsername)
            .single();

        if (friendError) {
            console.error('Error fetching friend UUID:', friendError);
            return;
        }

        if (!friendsData) {
            console.error('Friend not found.');
            return;
        }

        const friendId = friendsData.id;

        const { error } = await supabase
            .from('friends')
            .delete()
            .eq('id', session.user.id)
            .eq('is_friends_with', friendId);

        if (error) {
            console.error('Error removing friend:', error);
        } else {
            console.log('Friend removed successfully');
            // Remove the inverse relationship
            await supabase
                .from('friends')
                .delete()
                .eq('id', friendId)
                .eq('is_friends_with', session.user.id);
            getFriends();
        }
    }

    async function handleSendFriendRequest() {
        // Find the user by username
        const { data: friendData, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

        if (error) {
            console.error('Error fetching friend:', error);
            return;
        }

        if (!friendData) {
            alert('No user found with this username');
            return;
        }

        const friendId = friendData.id;

        // Check if friend request already sent
        const existingRequest = pendingRequests.includes(friendId);
        if (existingRequest) {
            alert('Friend request already sent');
            return;
        }

        // Send friend request
        const { data: requestData, error: requestError } = await supabase
            .from('friend_requests')
            .insert([{ from_user: session.user.id, to_user: friendId }]);

        if (requestError) {
            console.error('Error sending friend request:', requestError);
        } else {
            console.log('Friend request sent successfully:', requestData);
            getPendingRequests();
        }
    }

    async function getFriends() {
        const { data: friendDataList, error } = await supabase
            .from('friends')
            .select('is_friends_with')
            .eq('id', session.user.id);

        if (error) {
            console.error('Error fetching friends:', error);
        }

        if (friendDataList) {
            const friendIdsSet = new Set(friendDataList.map(friend => friend.is_friends_with));

            const friendProfilesPromises = Array.from(friendIdsSet).map(async id => {
                return await supabase.from('profiles').select('*').eq('id', id).single();
            });

            try {
                const friendProfilesArray = await Promise.all(friendProfilesPromises);
                friendProfilesArray.sort((a, b) => a.id - b.id);
                const friendUsernames = friendProfilesArray.map(profile => profile.data.username);
                console.log('friendProfilesArray:', friendProfilesArray);
                console.log(friendUsernames);
                setFriends(friendUsernames);
                setFriendCount(friendUsernames.length);
            } catch (error) {
                console.error('Error fetching profiles for friends:', error);
            }
        }
    }

    return (
        <div className="app-container bg-gradient-to-r from-indigo-500 to-blue-400">
            <Sidebar />
            <div className="container mx-auto px-4 py-8 main-content">
                <div className="header text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">Profile</h2>
                </div>
                <div className="flex justify-center">
                    <button type="button" className="btn bg-green-500 text-white hover:bg-green-700 focus:outline-none font-bold py-2 px-4 rounded-full">
                        Connect to Spotify
                        <i className="fas fa-spotify ml-2"></i>
                    </button>
                </div>
                <div className="profile-section text-center mt-8">
                    <input type="text" placeholder="Enter friend's username" value={username} onChange={e => setUsername(e.target.value)} className="form-control px-4 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 w-full mx-auto mb-4" />
                    <button type="button" className="btn bg-indigo-500 text-white hover:bg-indigo-700 focus:outline-none font-bold py-2 px-4 rounded-full">
                        Add Friend
                        <i className="fas fa-user-plus ml-2"></i>
                    </button>

                    <div className="friendsList mt-10">
                        <h3 className="text-center mt-4 text-xl font-bold text-white"> My Friends </h3>
                        <ul className="list-none mt-4">
                            {friends.map(friend => (
                                <li key={friend} className="flex items-center justify-between border shadow-sm rounded-md p-4 my-2 bg-gray-100">
                                    {friend}
                                    <button type="button" className="btn bg-red-500 text-white hover:bg-red-700 focus:outline-none px-3 py-1 rounded-full">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="pending-requests mt-10">
                        <h3 className="text-center mt-4 text-xl font-bold text-white">Pending Requests</h3>
                        <ul className="list-none mt-4">
                            {pendingRequests.map(requestUserId => (
                                <li key={requestUserId} className="flex items-center justify-between border shadow-sm rounded-md p-4 my-2 bg-gray-100">
                                    <span>Pending request from {requestUserId}</span>
                                    <div className="flex space-x-2">
                                        <button type="button" className="btn bg-green-500 text-white hover:bg-green-700 focus:outline-none px-3 py-1 rounded-full">
                                            <i className="fas fa-check"></i>
                                        </button>
                                        <button type="button" className="btn bg-red-500 text-white hover:bg-red-700 focus:outline-none px-3 py-1 rounded-full">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

    );
}
