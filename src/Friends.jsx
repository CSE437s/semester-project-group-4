import React, { useState, useEffect, useRef } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import FriendSearch from './components/FriendSearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faTrash } from '@fortawesome/free-solid-svg-icons';
// import ProfilePicture from './components/ProfilePicture';
// import './css/Profile3.css';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';
import './css/Friends.css'

const Friends = () => {
    const [session, setSession] = useState(null);
    const [friendCount, setFriendCount] = useState(0);
    const [username, setUsername] = useState('');
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myusername, setmyUsername] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })
    }, [])

    useEffect(() => {
        getFriends();
        getPendingRequests();
        fetchUsername();
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
            const pendingUsers = await Promise.all(pendingUserIds.map(async id => {
                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('username, id')
                    .eq('id', id)
                    .single();
                if (userError) {
                    console.error(`Error fetching user data for user id ${id}:`, userError);
                    return null;
                }
                return userData ? { username: userData.username, id: userData.id } : null;
            }));
            // Filter out any null values and set the state
            const validPendingUsers = pendingUsers.filter(user => user !== null);
            setPendingRequests(validPendingUsers);
            console.log("pendingRequests:", validPendingUsers);
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

    async function removeRequest(fromUserId) {
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

    async function addFriend(friendId) {
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
                // Modify to include both username and picture
                const friendData = friendProfilesArray.map(profile => ({
                    username: profile.data.username,
                    picture: profile.data.picture // Assuming you have 'picture' field in your profile data
                }));
                console.log('friendProfilesArray:', friendData);
                setFriends(friendData); // Update state with friend data including pictures
                setFriendCount(friendData.length);
            } catch (error) {
                console.error('Error fetching profiles for friends:', error);
            }
        }
    }


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
    }

    function redirectToUser(uuid) {
        // Get the current domain
        const currentDomain = window.location.origin;

        // Build the target URL
        const targetUrl = `${currentDomain}/User/${uuid}`;

        // Redirect the user
        window.location.href = targetUrl;
    }


    return (
        <div className="app-container">
            <Sidebar />
            <div id="page_content_id" className="main-content">
                <div className="header">
                    <h2>My Friends</h2>
                </div>
                <div className="friendContent">
                    <FriendSearch />


                    <div className="friendsList mt-10">
                        <h3 className="profileText">My Friends</h3>
                        <ul className="list-group mt-4">
                            {friends.map(friend => (
                                <li key={friend.username} className="list-group-item d-flex justify-content-between align-items-center my-2">
                                    <img
                                        className="pfp"
                                        src={friend.picture ? friend.picture : 'https://img.icons8.com/nolan/64/1A6DFF/C822FF/user-default.png'}
                                        alt={`${friend.username}'s Profile Picture`}
                                    />
                                    {friend.username}
                                    <button onClick={() => handleRemoveFriend(friend.username)} className="btn btn-danger btn-sm">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </li>
                            ))}

                        </ul>
                    </div>


                    <div className="pending-requests mt-10">
                        <h3 className="profileText">Pending Requests</h3>

                        {pendingRequests.map(requestUser => (
                            <li
                                key={requestUser.id}
                                className="list-group-item d-flex justify-content-between align-items-center my-2"
                                style={{
                                    border: '1px solid #555',
                                    borderRadius: '0.5rem',
                                    maxWidth: '500px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '3rem'
                                }}
                            >
                                <span className="li_content" style={{ flex: '1' }}>Pending request from {requestUser.username}</span>

                                <div style={{ margin: '4px' }}>
                                    <button
                                        onClick={() => handleAcceptRequest(requestUser.id)}
                                        className="rounded-full bg-purple-500 text-white px-6 py-2 thicker-icon-button"
                                    >
                                        <RiCheckLine />
                                    </button>

                                    <button
                                        onClick={() => handleRejectRequest(requestUser.id)}
                                        className="rounded-full bg-gray-500 text-white px-6 py-2 thicker-icon-button"
                                    >
                                        <RiCloseLine />
                                    </button>
                                </div>
                            </li>
                        ))}



                    </div>
                </div>
            </div>
        </div >
    );
};

export default Friends;