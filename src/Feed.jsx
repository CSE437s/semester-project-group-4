import './css/feed.css';
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';

const Feed = () => {
    const [friends, setFriends] = useState([]);
    const [sharedSongs, setSharedSongs] = useState([]);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        }).catch(error => {
            console.error('Error fetching session:', error);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!session) return;

        async function fetchData() {
            await getFriends(session);
        }

        fetchData();
    }, [session]);

    useEffect(() => {
        if (friends.length > 0) {
            fetchSharedSongs(friends);
        }
    }, [friends]);

    async function fetchSharedSongs(friends) {
        const friendIds = friends.map(friend => friend.data.id);

        const sharedSongPromises = friendIds.map(async id => {
            const { data: songs, error } = await supabase
                .from('shared_songs')
                .select('song')
                .eq('id', id);

            if (error) {
                console.error('Error fetching shared songs for friend:', id, error);
                return [];
            }

            return songs;
        });

        try {
            const friendSharedSongs = await Promise.all(sharedSongPromises);
            setSharedSongs(friendSharedSongs.flat()); // Flatten the array
        } catch (error) {
            console.error('Error fetching shared songs:', error);
        }
    }

    async function getFriends(session) {
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
                setFriends(friendProfilesArray);
            } catch (error) {
                console.error('Error fetching profiles for friends:', error);
            }
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    console.log("sharedSongs: " + sharedSongs)
    // console.log(sharedSongs[0])
    // console.log(sharedSongs[0].id);

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                {sharedSongs.map(song => (
                    <div key={song.id} className="song-item">
                        <img src={song.album.images[0].url} alt={song.name} />
                        <div>
                            <h3>{song.name}</h3>
                            <p>Artist: {song.artists[0].name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feed;