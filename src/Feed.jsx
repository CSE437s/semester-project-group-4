import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';

const Feed = () => {
    const [friends, setFriends] = useState([]);
    const [sharedSongs, setSharedSongs] = useState([]);
    const [comments, setComments] = useState({});
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [renderPage, setRenderPage] = useState(false);
    const [commentInput, setCommentInput] = useState("");
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
        const friendIds = friends.map(friend => friend.data.id);

        const sharedSongPromises = friendIds.map(async id => {
            const { data: songs, error } = await supabase
                .from('shared_songs')
                .select('id, song')
                .eq('id', id);

            if (error) {
                console.error('Error fetching shared songs for friend:', id, error);
                return [];
            }

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

    async function fetchCommentsForSongs() {
        const songIds = sharedSongs.map(song => song.id);

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
            // Retrieve the songUUID using songId
            const { data: songData, error: songError } = await supabase
                .from('shared_songs')
                .select('songUUID')
                .eq('id', songId)
                .single();

            if (songError) {
                console.error('Error fetching songUUID for song:', songId, songError);
                return;
            }

            if (!songData || !songData.songUUID) {
                console.error('SongUUID not found for song:', songId);
                return;
            }

            const songUUID = songData.songUUID;

            // Insert the comment with songUUID
            const { data, error } = await supabase
                .from('feedComments')
                .insert([{ songUUID: songUUID, comment: comment, userID: session.user.id }]);

            if (error) {
                console.error('Error adding comment:', error);
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



    if (loading || !renderPage) {
        return (<div className="app-container"> <Sidebar /><div className="main-content"><p>Loading...</p></div>
        </div>
        );
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
                    {sharedSongs.map(song => (
                        <div key={song.song.id} className="song-item">
                            <iframe
                                src={`https://open.spotify.com/embed/track/${song.song.id}`}
                                width="300"
                                height="80"
                                frameBorder="0"
                                allowtransparency="true"
                                allow="encrypted-media"
                            ></iframe>
                            <div>
                                <h3>Comments:</h3>
                                <ul>
                                    {comments[song.id] && comments[song.id].map((comment, index) => (
                                        <li key={index}>
                                            <strong>User: </strong>
                                            {friends.find(friend => friend.data.id === comment.userID)?.data.username || "Unknown"} -
                                            <span>{new Date(comment.created_at).toLocaleString()}</span>
                                            <br />
                                            {comment.comment}
                                        </li>
                                    ))}
                                </ul>
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={commentInput}
                                    onChange={e => setCommentInput(e.target.value)}
                                />
                                <button onClick={() => addComment(song.id, commentInput)}>Add Comment</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Feed;
