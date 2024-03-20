import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Profile({ session }) {
    const [friendCount, setFriendCount] = useState(0);
    const [username, setUsername] = useState('');
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);

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
            setPendingRequests(pendingUserIds);
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

    async function addFriend(friendId) {
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
    
    async function removeRequest(friendId) {
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
    

    async function handleAddFriend() {
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
        <div className="app-container bg-light">
            <Sidebar />
            <div className="container main-content py-5">
                <div className="header text-center mb-5">
                    <h2 className="display-3 text-primary">Profile</h2>
                    <div className="row">
                        <div className="col">
                            <Link to="/Account" className="btn btn-link text-decoration-none">
                                <FontAwesomeIcon icon={faCog} className="mr-1 text-secondary" /> Account Settings
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="profile-section text-center">
                    <img src="profile.jpg" alt="Profile Image Alt Text (Either you don't have a PFP or there was an error loading it)" className="profile-picture rounded-circle mx-auto d-block img-fluid mb-4" />
                    <input type="text" placeholder="Enter friend's username" value={username} onChange={e => setUsername(e.target.value)} className="form-control my-3" />
                    <button onClick={handleAddFriend} className="btn btn-success mb-4">Add Friend</button>

                    <div className="friendsList mt-5">
                        <h3 className="text-center mt-4">🎵 My Friends 🎵</h3>
                        <ul className="list-group mt-4">
                            {friends.map(friend => (
                                <li key={friend} className="list-group-item d-flex justify-content-between align-items-center my-2">
                                    {friend}
                                    <button onClick={() => handleRemoveFriend(friend)} className="btn btn-danger btn-sm">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pending-requests mt-5">
                        <h3 className="text-center mt-4">Pending Requests</h3>
                        <ul className="list-group mt-4">
                            {pendingRequests.map(requestUserId => (
                                <li key={requestUserId} className="list-group-item d-flex justify-content-between align-items-center my-2">
                                    <span>Pending request from {requestUserId}</span>
                                    <div>
                                        <button onClick={() => handleAcceptRequest(requestUserId)} className="btn btn-success btn-sm mx-2">Accept</button>
                                        <button onClick={() => handleRejectRequest(requestUserId)} className="btn btn-danger btn-sm">Reject</button>
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
