import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import './index.css'
import './css/feed2.css'

const Feed = () => {
    const [friends, setFriends] = useState([]);
    const [sharedSongs, setSharedSongs] = useState([]);
    const [comments, setComments] = useState({});
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [renderPage, setRenderPage] = useState(false);
    const [commentInputs, setCommentInputs] = useState({}); // Track inputs for each song
    const [songUUID, setSongUUID] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
            setTimeout(() => {
                setRenderPage(true);
            }, 1000);
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
        if (sharedSongs.length > 0) {
            fetchCommentsForSongs();
        }
    }, [sharedSongs]);

    async function fetchSharedSongs(friends) {
        const friendIds = friends.map(friend => friend.data.id); // Modify to access friend id correctly


        const sharedSongPromises = friendIds.map(async id => {
            const { data: songs, error: songsError } = await supabase
                .from('shared_songs')
                .select('songUUID, spotifySongId, created_at')
                .eq('id', id);

            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, picture, username')
                .eq('id', id);

            if (songsError || profilesError) {
                console.error('Error fetching data for friend:', id, songsError || profilesError);
                return [];
            }

            // Combine the data from shared songs and profiles
            const combinedData = songs.map(song => ({
                ...song,
                profile: profiles.find(profile => profile.id === id)
            }));

            return combinedData;
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

    async function fetchCommentsForSongs() {
        const songIds = sharedSongs.map(song => song.songUUID);

        const commentsPromises = songIds.map(async id => {
            const { data: comments, error } = await supabase
                .from('feedComments')
                .select('comment')
                .eq('songUUID', id);

            if (error) {
                console.error('Error fetching comments for song:', id, error);
                return [];
            }

            return comments;
        });

        try {
            const songComments = await Promise.all(commentsPromises);
            const commentsObject = {};
            songIds.forEach((id, index) => {
                commentsObject[id] = songComments[index];
            });
            setComments(commentsObject);
        } catch (error) {
            console.error('Error fetching comments for songs:', error);
        }
    }

    async function addComment(songId, comment) {
        try {
            const { data, error: insertError } = await supabase
                .from('feedComments')
                .insert([{ songUUID: songId, comment: comment, userID: session.user.id }]);

            if (insertError) {
                console.error('Error adding comment:', insertError);
            } else {
                // Update the comments state only for the specific song that the comment is for
                setComments(prevComments => ({
                    ...prevComments,
                    [songId]: [...(prevComments[songId] || []), { comment, userID: session.user.id }]
                }));
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }

    const handleInputChange = (e, songId) => {
        const { value } = e.target;
        setCommentInputs(prevInputs => ({
            ...prevInputs,
            [songId]: value
        }));
    };

    if (loading || !renderPage) {
        return (
            <div className="app-container">
                <Sidebar />
                <div className="main-content">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Sidebar />
            <div id="page_content_id" className="main-content">
                <div className="header">
                    <h2>Feed</h2>
                    <p className="headerText">View what your friends have been listening to</p>
                </div>
                <div className="song_list">
                    {sharedSongs.map(song => (
                        <div key={song.songUUID} className="song-item" style={{ backgroundColor: '#f4f4f4', borderRadius: '15px', padding: '10px', marginBottom: '10px' }}>
                            <div className="shiftRight">

                                <div className="shiftRight" style={{ display: 'flex' }}>
                                    <img
                                        src={song.profile.picture}
                                        alt=""
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: '50%',
                                            border: '1px solid black',
                                            marginRight: 10,
                                        }}
                                    />
                                    <div>
                                        <p style={{ fontWeight: 'bold', color: '#292926' }}>
                                            Shared by {song.profile.username}
                                        </p>
                                        <p>
                                            {new Date(song.created_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })} {''}
                                            {new Date(song.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="shiftRight" style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', minHeight: '150px' }}> {/* Center content vertically and horizontally */}
                                    <iframe
                                        src={`https://open.spotify.com/embed/track/${song.spotifySongId}`}
                                        width="300"
                                        height="80"
                                        frameBorder="0"
                                        allowtransparency="true"
                                        allow="encrypted-media"
                                    />
                                </div>
                                <div className="shiftRight" style={{ marginTop: 10 }}>
                                    <h3 id="CommentTitle">Comments:</h3>
                                    <ul>
                                        {comments[song.songUUID] &&
                                            comments[song.songUUID].map((comment, index) => (
                                                <li className="individualComment" key={index}>{comment.comment}</li>
                                            ))}
                                    </ul>
                                    <div style={{ display: 'flex' }}>
                                        <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            value={commentInputs[song.songUUID] || ''}
                                            onChange={e => handleInputChange(e, song.songUUID)}
                                            style={{ borderRadius: '4px', padding: '5px', flexGrow: 1 }}
                                        />
                                        <button className="commentBtn"
                                            onClick={() => addComment(song.songUUID, commentInputs[song.songUUID])}
                                        >
                                            Add Comment
                                        </button>

                                    </div>
                                </div>


                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default Feed;