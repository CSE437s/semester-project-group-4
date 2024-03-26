import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';

const Feed = () => {
    const [friends, setFriends] = useState([]);
    const [sharedSongs, setSharedSongs] = useState([]);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [renderPage, setRenderPage] = useState(false);
    const [comments, setComments] = useState({});

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
            setTimeout(() => {
                setRenderPage(true); // Set renderPage to true after 1 second
            }, 1000); // 1000 milliseconds = 1 second
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
        async function fetchComments() {
            const songIds = sharedSongs.map(song => song.song.id);

            const commentPromises = songIds.map(async id => {
                const { data: comments, error } = await supabase
                    .from('feedComments')
                    .select('comment')
                    .eq('id', id);

                if (error) {
                    console.error('Error fetching comments for song:', id, error);
                    return [];
                }

                return { id, comments };
            });

            try {
                const commentsData = await Promise.all(commentPromises);
                const commentsObj = {};
                commentsData.forEach(item => {
                    commentsObj[item.id] = item.comments;
                });
                setComments(commentsObj);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        }

        fetchComments();
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

    if (loading || !renderPage) {
        return <p>Loading...</p>;
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
                            <div className="spotify-song">
                                <iframe
                                    src={`https://open.spotify.com/embed/track/${song.song.id}`}
                                    width="300"
                                    height="80"
                                    frameBorder="0"
                                    allowtransparency="true"
                                    allow="encrypted-media"
                                ></iframe>
                                <div className="comments">
                                    {comments[song.song.id] &&
                                        comments[song.song.id].map((comment, index) => (
                                            <div key={index} className="comment">
                                                {comment.comment}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Feed;
