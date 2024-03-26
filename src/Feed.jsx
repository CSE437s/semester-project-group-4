import './css/feed.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Post from './components/Post'; // A new component for music posts

const Feed = () => {
    const [friends, setFriends] = useState([]);

    //added monday
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
            } catch (error) {
                console.error('Error fetching profiles for friends:', error);
            }
        }
    }

    //end added monday

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <div className="header">
                    <h2>Feed</h2>
                    <p className="headerText">View what your friends have been listening to</p>
                </div>
                <div className="song_list">

                </div>
            </div>
        </div>
    );
};

export default Feed;
