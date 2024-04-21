import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import './css/feed.css';
import { MdDeleteForever } from "react-icons/md";

const Feed = () => {
    const [friends, setFriends] = useState([]);
    const [sharedSongs, setSharedSongs] = useState([]);
    const [comments, setComments] = useState({});
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [renderPage, setRenderPage] = useState(false);
    const [commentInputs, setCommentInputs] = useState({});
    const [expandedComments, setExpandedComments] = useState({});

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
            setTimeout(() => {
                setRenderPage(true);
            }, 500);
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
        const friendIds = friends.map(friend => friend.data.id);

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
                .select('comment, created_at, userID, rownum')
                .eq('songUUID', id);

            if (error) {
                console.error('Error fetching comments for song:', id, error);
                return [];
            }

            const commentsWithUsers = await Promise.all(comments.map(async comment => {
                // Fetch user information for each comment
                const { data: user, error: userError } = await supabase
                    .from('profiles')
                    .select('username, picture')
                    .eq('id', comment.userID)
                    .single();

                if (userError) {
                    console.error('Error fetching user information for comment:', comment.rownum, userError);
                    return { ...comment, user: null }; // Return comment without user information
                }

                return { ...comment, user }; // Merge comment and user information
            }));

            return commentsWithUsers;
        });

        try {
            const songComments = await Promise.all(commentsPromises);
            const commentsObject = {};
            songIds.forEach((id, index) => {
                commentsObject[id] = songComments[index];
            });
            setComments(commentsObject);
            console.log("THE COMMENT OBJHECT", commentsObject)
        } catch (error) {
            console.error('Error fetching comments for songs:', error);
        }
    }


    async function addComment(songId, comment) {
        try {
            const currentDate = new Date(); // Get the current date

            // Insert the new comment
            const { data, error: insertError } = await supabase
                .from('feedComments')
                .insert([{ songUUID: songId, comment: comment, userID: session.user.id }]);

            if (insertError) {
                console.error('Error adding comment:', insertError);
            } else {
                // Fetch updated comments for the song
                const newComments = await fetchCommentsForSong(songId);

                // Add the new comment to the existing comments
                setComments(prevComments => {
                    const updatedComments = { ...prevComments };
                    updatedComments[songId] = [...newComments];
                    return updatedComments;
                });

                setCommentInputs("");
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }



    async function fetchCommentsForSong(songId) {
        const { data: comments, error } = await supabase
            .from('feedComments')
            .select('comment, created_at, userID, rownum')
            .eq('songUUID', songId);

        if (error) {
            console.error('Error fetching comments for song:', songId, error);
            return [];
        }

        const commentsWithUsers = await Promise.all(comments.map(async comment => {
            // Fetch user information for each comment
            const { data: user, error: userError } = await supabase
                .from('profiles')
                .select('username, picture')
                .eq('id', comment.userID)
                .single();

            if (userError) {
                console.error('Error fetching user information for comment:', comment.rownum, userError);
                return { ...comment, user: null }; // Return comment without user information
            }

            return { ...comment, user }; // Merge comment and user information
        }));

        return commentsWithUsers;
    }


    async function deleteComment(rownum, songUUID) {
        try {
            const { error } = await supabase
                .from('feedComments')
                .delete()
                .eq('rownum', rownum)
            if (error) {
                console.error('Error deleting comment:', error);
            } else {
                setComments(prevComments => ({
                    ...prevComments,
                    [songUUID]: prevComments[songUUID].filter(comment => comment.rownum !== rownum)
                }));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    }

    const handleInputChange = (e, songId) => {
        const { value } = e.target;
        setCommentInputs(prevInputs => ({
            ...prevInputs,
            [songId]: value
        }));
    };

    const toggleComments = (songId) => {
        setExpandedComments(prevState => ({
            ...prevState,
            [songId]: !prevState[songId]
        }));
    };

    if (loading || !renderPage) {
        return (
            <div className="app-container">
                <Sidebar />
                <div className="main-content">
                    <div className="header">
                        <h2>Feed</h2>
                        <p className="headerText">View what your friends have been listening to</p>
                    </div>
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
                        <div key={song.songUUID} className="song-item">
                            <div className="shiftRight">

                                <div className="shiftRight" style={{ display: 'flex' }}>
                                    <img
                                        src={song.profile.picture ? song.profile.picture : 'https://img.icons8.com/nolan/64/1A6DFF/C822FF/user-default.png'}
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
                                            {song.profile.username}
                                        </p>
                                        <p>
                                            {new Date(song.created_at).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div id="iframe" className="shiftRight" style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', minHeight: '150px' }}> {/* Center content vertically and horizontally */}
                                    <iframe
                                        src={`https://open.spotify.com/embed/track/${song.spotifySongId}`}
                                        width="600"
                                        height="360"
                                        frameBorder="0"
                                        allowtransparency="true"
                                        allow="encrypted-media"
                                    />
                                </div>

                                <button className="viewBtn"
                                    onClick={() => toggleComments(song.songUUID)}
                                >
                                    {expandedComments[song.songUUID] ? "Hide Comments" : "View Comments"}
                                </button>

                                <div id="commentInputDiv" style={{ display: 'flex' }}>
                                    <textarea
                                        className='inputBox'
                                        type="text"
                                        placeholder="What do you think?"
                                        value={commentInputs[song.songUUID] || ''}
                                        onChange={e => handleInputChange(e, song.songUUID)}

                                    />
                                    <button className="commentBtn"
                                        onClick={() => addComment(song.songUUID, commentInputs[song.songUUID])}
                                    >
                                        Post
                                    </button>
                                </div>


                                {expandedComments[song.songUUID] && (
                                    <div id="commentContainer" style={{ marginTop: 10 }}>
                                        <ul>
                                            {comments[song.songUUID] &&
                                                comments[song.songUUID].map((comment, index) => (
                                                    <li className="individualComment" key={index}>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <img
                                                                src={comment.user.picture ? comment.user.picture : 'https://img.icons8.com/nolan/64/1A6DFF/C822FF/user-default.png'}
                                                                alt=""
                                                                style={{
                                                                    width: 30,
                                                                    height: 30,
                                                                    borderRadius: '50%',
                                                                    marginRight: 5
                                                                }}
                                                            />
                                                            <p className="besideImage" style={{ fontWeight: 'bold', marginRight: 5 }}>{comment.user.username}</p>
                                                            <p className="besideImage dateText">{new Date(comment.created_at).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })
                                                            }</p>
                                                            {session && session.user.id === comment.userID && (
                                                                <button className='deleteBtn' onClick={() => deleteComment(comment.rownum, song.songUUID)}>
                                                                    <MdDeleteForever />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="commentText">{comment.comment}</p>

                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default Feed;
