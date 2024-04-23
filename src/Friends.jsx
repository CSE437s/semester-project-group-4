import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import FriendSearch from './components/FriendSearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';
import './css/Friends.css'

export default function Friends({ session }) {
    const [friendCount, setFriendCount] = useState(0);
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myusername, setmyUsername] = useState(null);

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
                    .select('username, id, picture')
                    .eq('id', id)
                    .single();
                if (userError) {
                    console.error(`Error fetching user data for user id ${id}:`, userError);
                    return null;
                }
                return userData ? { username: userData.username, id: userData.id, picture:userData.picture } : null;
            }));
            const validPendingUsers = pendingUsers.filter(user => user !== null);
            setPendingRequests(validPendingUsers);
            console.log("pendingRequests:", validPendingUsers);
        }
    }

    async function handleAcceptRequest(fromUserId) {
        await addFriend(fromUserId);
        await removeRequest(fromUserId);
    }

    async function handleRejectRequest(fromUserId) {
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


    async function handleRemoveFriend(friendId) {
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

                const friendData = friendProfilesArray.map(profile => ({
                    username: profile.data.username,
                    picture: profile.data.picture,
                    id: profile.data.id
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
        if (!uuid) {
            return
        }
        const currentDomain = window.location.origin;
        const targetUrl = `${currentDomain}/User?${uuid}`;
        window.location.href = targetUrl;
    }

    return (
        <div className="app-container">
            <Sidebar />
            <div id="page_content_id" className="main-content">
                <div className="header">
                    <h2>Friends</h2>
                </div>
                <div className="friendContent">
                    <FriendSearch />

                    <div className="friendsList mt-10">
                        <h3 className="profileText">My Friends</h3>

                        {friends.length === 0 ? (
                            <p className="noFriendsText">You have no friends 😞</p>
                        ) : (
                            <ul className="list-group mt-4">
                                {friends.map(friend => (
                                    <li key={friend.username} className="hoverBackground list-group-item d-flex justify-content-between align-items-center my-2">
                                        <div className="d-flex align-items-center">
                                            <img onClick={() => redirectToUser(friend.id)} className="pfp mr-3" src={friend.picture ? friend.picture : 'https://img.icons8.com/nolan/64/1A6DFF/C822FF/user-default.png'} alt={`${friend.username}'s Profile Picture`} />
                                            {friend.username}

                                        </div>
                                        <button title="delete user" id="trash_btn" onClick={() => handleRemoveFriend(friend.id)} className="btn btn-danger btn-sm">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </li>
                                ))}
                            </ul>)}
                    </div>

                    <div className="pending-requests mt-10">
                        <h3 className="profileText">Pending Friend Requests</h3>

                        {pendingRequests.length === 0 ? (
                            <p>You have no pending requests</p>
                        ) : (
                            <ul className="list-group">
                                {pendingRequests.map(requestUser => (
                                    <li
                                        key={requestUser.id}
                                        className="list-group-item d-flex justify-content-between align-items-center my-2"
                                        style={{
                                            border: '1px solid #555',
                                            borderRadius: '0.5rem',
                                            maxWidth: '390px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            height: '4.3rem'
                                        }}
                                    >
                                        <img
                                            className="pfp margin-image"
                                            onClick={() => redirectToUser(requestUser.id)}
                                            src={requestUser.picture ? requestUser.picture : 'https://img.icons8.com/nolan/64/1A6DFF/C822FF/user-default.png'}
                                        />
                                        <span className="li_content" style={{ flex: '1' }}> {requestUser.username}</span>

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
                            </ul>
                        )}
                    </div>

                </div>
            </div>
        </div >
    );
};

// export default Friends;