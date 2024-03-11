import './css/Profile2.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Import your Supabase client
import Sidebar from './components/Sidebar';

//for icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';




export default function Profile({ session }) {

    const [friendCount, setFriendCount] = useState(0);
    const [username, setUsername] = useState('');
    const [friends, setFriends] = useState([]);


    let client_id = "1892c29e22e44ec686fa22a8e891b0f9";
    let redirect = "https://semester-project-group-4.vercel.app/Share"; //takes us back here after agreeing to Spotify

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
            getFriends()
            // alert("friend added");
        }
    };


    const handleRemoveFriend = async (friendUsername) => {
        // Find the friend's profile based on the username
        const { data: friendData, error: friendError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', friendUsername)
            .single();

        if (friendError) {
            console.error('Error fetching friend UUID: ', friendError);
            alert("Error removing friend");
            return;
        }

        // Remove the friend relationship from the database
        const { error } = await supabase
            .from('friends')
            .delete()
            .eq('id', session.user.id)
            .eq('is_friends_with', friendData.id);

        if (error) {
            console.error('Error removing friend: ', error);
            alert("Error removing friend");
        } else {
            console.log('Friend removed successfully');
            // alert("Friend removed");
            // Refresh the friend list
            getFriends();
        }
    };



    //displaying current friends:


    async function getFriends() {
        const { data: friendDataList, error } = await supabase
            .from('friends')
            .select('is_friends_with')
            .eq('id', session.user.id);

        if (error) {
            console.error('Error fetching friends: ', error);
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
                console.log("friendProfilesArray:", friendProfilesArray);
                console.log(friendUsernames);
                setFriends(friendUsernames);
                setFriendCount(friendUsernames.length);
            } catch (error) {
                console.error("Error fetching profiles for friends:", error)
            }
        }
    }


    useEffect(() => {
        getFriends();
    }, [session]);
    //end display current friends

    // return (
    //     <div className="app-container">
    //         <Sidebar />
    //         <div className="container main-content">
    //             <div className="header text-center">
    //                 <h2 className="display-3">Profile</h2>
    //             </div>
    //             <div className="mb-3">
    //                 <Link to="/Account" className="">
    //                     <FontAwesomeIcon icon={faCog} className="mr-1" /> Account Settings
    //                 </Link>
    //             </div>
    //             <div className="profile-section">
    //                 <img src="profile.jpg" alt="Profile" className="profile-picture rounded-circle mx-auto d-block" />
    //                 <input type="text" placeholder="Enter friend's username" value={username} onChange={e => setUsername(e.target.value)} className="form-control mb-2" />
    //                 <button onClick={handleAddFriend} className="btn btn-primary mb-2">Add Friend</button>
    //                 <button onClick={authorize} className="btn btn-secondary mb-2">Connect to Spotify</button>

    //                 <div className="friendsList">
    //                     <h3 className="text-center mt-4">🎵 My Friends 🎵</h3>
    //                     <ul className="list-group">
    //                         {friends.map((friend) => (
    //                             <li key={friend} className="list-group-item d-flex justify-content-between align-items-center">
    //                                 {friend}
    //                                 <button onClick={() => handleRemoveFriend(friend)} className="btn btn-danger btn-sm">Remove</button>
    //                             </li>
    //                         ))}
    //                     </ul>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // );

    return (
        <div className="app-container">
            <Sidebar />
            <div className="container main-content">
                <div className="header text-center my-4">
                    <h2 className="display-4">Profile</h2>
                </div>
                <div className="mb-3">
                    <Link to="/Account" className="btn btn-link">
                        <FontAwesomeIcon icon={faCog} className="mr-1" /> Account Settings
                    </Link>
                </div>
                <div className="profile-section">
                    <img src="profile.jpg" alt="Profile" className="profile-picture rounded-circle mx-auto d-block mb-3" />
                    <input type="text" placeholder="Enter friend's username" value={username} onChange={e => setUsername(e.target.value)} className="form-control mb-3" />
                    <button onClick={handleAddFriend} className="btn btn-primary mr-2">Add Friend</button>
                    <button onClick={authorize} className="btn btn-secondary">Connect to Spotify</button>

                    <div className="friendsList mt-4">
                        <h3 className="text-center mb-3">🎵 My Friends 🎵</h3>
                        <ul className="list-group">
                            {friends.map((friend) => (
                                <li key={friend} className="list-group-item d-flex justify-content-between align-items-center">
                                    {friend}
                                    <button onClick={() => handleRemoveFriend(friend)} className="btn btn-danger btn-sm">Remove</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );


};