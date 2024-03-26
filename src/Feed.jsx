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

    // useEffect(() => {
    //     if (!sharedSongs.length) return;

    //     const playerPromises = sharedSongs.map(async song => {
    //         const { uri } = song;

    //         // Create a new iframe element
    //         const iframe = document.createElement('iframe');
    //         iframe.id = `player-${uri}`; // Set unique id for each player

    //         // Load the Spotify iframe API script asynchronously
    //         const script = document.createElement('script');
    //         script.src = "https://open.spotify.com/embed/iframe-api"; // Update with Spotify iframe API URL
    //         document.body.appendChild(script);

    //         // Function to be called after the API loads (window.onSpotifyIframeAPIReady)
    //         window.onSpotifyIframeAPIReady = () => {
    //             const player = new Spotify.Player({
    //                 container: iframe, // Set container for the player
    //                 getOAuthToken: callback => {
    //                     // Handle OAuth token retrieval (optional, see documentation)
    //                     callback(null); // Assuming no OAuth needed in this example
    //                 },
    //                 styles: {
    //                     height: '80px', // Set player height
    //                     width: '100%', // Set player width
    //                 },
    //                 uris: [uri], // Set the Spotify track uri
    //             });

    //             player.on('ready', () => {
    //                 setPlayers(prevPlayers => [...prevPlayers, player]);
    //             });
    //         };

    //         return iframe;
    //     });

    //     Promise.all(playerPromises).then(iframes => {
    //         // Append iframes to the song_list element
    //         iframes.forEach(iframe => document.querySelector('.song_list').appendChild(iframe));
    //     });
    // }, [sharedSongs]);

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
        return songs.map(song => (
            <div key={song.id} className="song-item">
                {/* Embed Spotify track using formatted URL */}
                <iframe
                    src={`https://open.spotify.com/embed/track/${song.id}?utm_source=generator`}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allowtransparency="true"
                    allow="encrypted-media"
                ></iframe>
            </div>
        ));
    };

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
