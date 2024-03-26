import './css/feed.css';
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import SongsList from './components/SongsList'; // New import for SongsList component

const Feed = () => {
    const [friends, setFriends] = useState([]);
    const [sharedSongs, setSharedSongs] = useState([]);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    // New state variable to hold player instances
    const [players, setPlayers] = useState([]);

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

    useEffect(() => {
        if (!sharedSongs.length) return;
    }, [sharedSongs]);


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
            console.log(songs);
            return songs;

        });

        try {
            const friendSharedSongs = await Promise.all(sharedSongPromises);
            setSharedSongs(friendSharedSongs.flat());
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

    const renderSongs = () => {
        return sharedSongs.map((song, index) => (
            <div key={song.id} className="song-item">
                {/* Embed Spotify track using formatted URL */}
                <iframe
                    src={`https://open.spotify.com/embed/track/${song.id}?utm_source=generator`}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allowtransparency="true"
                    allow="encrypted-media"
                    // New attribute: id set dynamically using index
                    id={`player-${index}`}
                />
            </div>
        ));
    };

    // New useEffect to initialize Spotify players after sharedSongs update
    useEffect(() => {
        if (!sharedSongs.length) return;

        // Create a new player instance for each song in sharedSongs
        const newPlayers = sharedSongs.map((song, index) => {
            const player = new window.Spotify.Player({
                name: song.name, // Optional: Set player name
                // ... other player options
            });

            // Handle player events (optional)
            player.on('ready', data => {
                console.log('Player is ready:', data);
            });

            player.on('error', error => {
                console.error('Player error:', error);
            });

            return player;
        });

        // Update the players state with the new player instances
        setPlayers(newPlayers);
    }, [sharedSongs]);

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <div className="header">
                    <h2>Feed</h2>
                    <p className="headerText">View what your friends have been listening to</p>
                </div>
                <div className="song_list">
                    {sharedSongs.length ? (
                        <SongsList songs={sharedSongs} /> // Pass sharedSongs as a prop
                    ) : (
                        <p>No songs to display</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Feed;