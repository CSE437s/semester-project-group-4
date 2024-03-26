import './css/feed.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import Post from './components/Post'; // A new component for music posts

const Feed = () => {
    const [friends, setFriends] = useState([]);
    const [sharedSongs, setSharedSongs] = useState([]); // New state for shared songs
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    // useEffect(() => {
    //     supabase.auth.getSession().then(({ data: { session } }) => {
    //         setSession(session)
    //     })
    // }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false); // Set loading to false once session is set
        }).catch(error => {
            console.error('Error fetching session:', error);
            setLoading(false); // Set loading to false if there's an error fetching session
        });
    }, []);

    useEffect(() => {
        if (!session) return; // Don't fetch data if session is null

        async function fetchData() {
            await getFriends();
            fetchSharedSongs();
        }

        fetchData();
    }, [session])

    async function fetchSharedSongs() {
        const friendIds = friendProfilesArray.map(profile => profile.data.id);

        const sharedSongPromises = friendIds.map(async id => {
            const { data: songs, error } = await supabase
                .from('shared_songs')
                .select('song')
                .eq('id', id);

            if (error) {
                console.error('Error fetching shared songs for friend:', id, error);
                return []; // Return an empty array if there's an error
            }

            return songs;
        });

        try {
            const friendSharedSongs = await Promise.all(sharedSongPromises);
            setSharedSongs(friendSharedSongs);
        } catch (error) {
            console.error('Error fetching shared songs:', error);
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
            } catch (error) {
                console.error('Error fetching profiles for friends:', error);
            }
        }
    }

    if (loading) {
        return <p>Loading...</p>; // Display loading message while waiting for session to be fetched
    }
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <div className="header">
                    <h2>Feed</h2>
                    <p className="headerText">View what your friends have been listening to</p>
                </div>
                <div className="song_list">
                    {sharedSongs.map((songs, index) => (
                        <Post key={index} songs={songs} friendName={friends[index]} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Feed;
