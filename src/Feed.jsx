import './css/feed.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
// import axios from 'axios'; // for API requests


const Feed = () => {
    const [topSongs, setTopSongs] = useState([]);

    // useEffect(() => {
    //     // Fetch user's top 3 songs from Spotify API
    //     const fetchTopSongs = async () => {
    //         try {
    //             const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=3');
    //             setTopSongs(response.data.items);
    //         } catch (error) {
    //             console.error('Error fetching top songs:', error);
    //         }
    //     };

    //     fetchTopSongs();
    // }, []);


    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <div className="header">
                    <h2>Feed</h2>
                    <p className="headerText">View what your friend’s have been listening to</p>
                </div>
                <div className="feed-page">
                    <h2>Friend's Suggestion 1</h2>
                </div>
                <div className="feed-page">
                    <h2>Friend's Suggestion 2</h2>
                </div>
            </div>
        </div>
    );
};

export default Feed;

