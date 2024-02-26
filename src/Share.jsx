import './css/share.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { Link } from 'react-router-dom';
// import axios from 'axios'; // for API requests
// import ImageCarousel from './ImageCarousel'; //must make this component !!!! or add it to this page

const Share = () => {
  const [topSongs, setTopSongs] = useState([]);

  useEffect(() => {
    // Fetch user's top 3 songs from Spotify API
    const fetchTopSongs = async () => {
      try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=3');
        setTopSongs(response.data.items);
      } catch (error) {
        console.error('Error fetching top songs:', error);
      }
    };

    fetchTopSongs();
  }, []);


  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-title">Groove</div>
        <div className="sidebar-buttons">
          <Link to="/Profile" className="sidebar-button">Profile</Link>
          <Link to="/Share" className="sidebar-button">Share</Link>
          <Link to="/Feed" className="sidebar-button">Feed</Link>
        </div>
      </div>
      <div className="main-content">
        {/* Share Page */}
        <div className="share-page">
          <h2>Your Top 3 Songs</h2>
          {/* <ImageCarousel songs={topSongs} /> */}
        </div>
      </div>
    </div>
  );
};

export default Share;

// chatgpt made the html and css for this page
//install react-router-dom npm