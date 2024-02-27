import './css/share.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { Link } from 'react-router-dom';
// import axios from 'axios'; // for API requests
// import ImageCarousel from './ImageCarousel'; //must make this component !!!! or add it to this page

const Share = () => {
  const [topSongs, setTopSongs] = useState([]);

  let [access_token, setAccessToken] = useState('');
  let [refresh_token, setRefreshToken] = useState('');
  let client_id= "1892c29e22e44ec686fa22a8e891b0f9";
  let client_secret = "011fa442dd504a46b6bd4d89aeab4036";
  let redirect = "http://localhost:5173/Share"; //takes us back here after agreeing to Spotify

  const AUTHORIZE = "https://accounts.spotify.com/authorize";
  const TOKEN = "https://accounts.spotify.com/api/token";
  //const TRACKS = "/api/v1/me/top/tracks?offset=0&limit=5&time_range=short_term"; //getting top 5 tracks from last 4 weeks
  const TRACKS = "https://accounts.spotify.com/api/v1/me/top/tracks?offset=0&limit=5&time_range=short_term";
  // useEffect(() => {
  //   onPageLoad();
  //   // Fetch user's top 3 songs from Spotify API
  //   // const fetchTopSongs = async () => {
  //   //   try {
  //   //     const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=3');
  //   //     setTopSongs(response.data.items);
  //   //   } catch (error) {
  //   //     console.error('Error fetching top songs:', error);
  //   //   }
  //   // };

  //   // fetchTopSongs();
  // }, []);

  function authorize() {
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-read-playback-state user-top-read";
    window.location.href = url;
  }

  function onPageLoad() {
    console.log("Pagelaod");
    if(window.location.search.length > 0) {
      console.log("redirect");
      handleRedirect();
    } else {
      console.log("songs");
      getSongs();
    }
  }

  function handleRedirect() {
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect);
  }

  function getCode() {
    let code = null;
    const queryString = window.location.search;
    if (queryString.length > 0) {
      const urlParams = new URLSearchParams(queryString);
      code = urlParams.get('code');
    }
    return code;
  }

  function fetchAccessToken(code) {
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthApi(body);
  }

  function callAuthApi(body) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = function() {
      handleAuthResponse(xhr);
    }
  }

  function refreshAccessToken() {
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthApi(body);
  }

  function handleAuthResponse(xhr) {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      if (data.access_token) {
        setAccessToken(data.access_token);
        localStorage.setItem("access_token", data.access_token);
        getSongs(data.access_token);
      }
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
        localStorage.setItem("refresh_token", data.refresh_token);
      }
    } else {
      console.error("Error fetching access token:", xhr.status, xhr.responseText);
      alert("Error fetching access token. Please try again.");
    }
  }

  function getSongs() {
    console.log("getSongs");
    callApi("GET", TRACKS, null, handleSongResponse);
  }

  function callApi(method, url, body, callback) {
    console.log("callApi");
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("access_token"));
    xhr.send(body);
    xhr.onload = callback;
  }

  function handleSongResponse() {
    if (this.status === 200) {
      try {
        var data = JSON.parse(this.responseText);
        setTopSongs(data.items);
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        console.log("Response text:", this.responseText); // Log the response text
        alert("Error parsing response. Check console for details.");
      }
    } else if (this.status === 401) {
      // Handle token expiration or invalid token
      alert("Token expired or invalid. Please login again.");
    } else {
      // Check if the response is HTML error page
      if (this.getResponseHeader('content-type').indexOf('text/html') !== -1) {
        console.error("HTML Error response:", this.responseText);
        alert("Error fetching songs. Check console for details.");
      } else {
        console.error("Non-JSON error response:", this.responseText);
        alert("Error fetching songs. Check console for details.");
      }
    }
  }
  

  //functions below to display song data rn; we could change later
  const list = document.getElementById('list');
  function removeItem() {
    list.innerHTML = '';
  }

  function songList(data) {
    removeItem();
    for(i=0; i < data.items.length; i++) {
      const list_item = document.createElement('div');
      const list_text = document.createElement('div');
      const song = document.createElement('div');
      const artist = document.createElement('div');
      const img = document.createElement('img');
      const span = document.createElement('span');
      const ref = document.createElement('a');
      const link = document.TextNode('Link');
      ref.appendChild(link);
      ref.title = "Link";
      ref.href = data.items[i].external_urls.spotify;

      list_item.classList.add("list-item");
      list_text.classList.add("list-text");
      song.classList.add("song");
      artist.classList.add("artist");
      ref.classList.add("links");
      ref.setAttribute('target', 'blank');
      img.classList.add('resize');

      var li = document.createElement('li');
      img.src = data.items[i].album.images[1].url;

      span.innerHTML = data.items[i].name;
      artist.innerHTML = data.items[i].artists[0].name;

      song.appendChild(span);

      list_text.appendChild(song);
      list_text.appendChild(artist);
      list_text.appendChild(ref);
      list_item.appendChild(list_text);
      list_item.appendChild(img);
      li.appendChild(list_item);

      list.appendChild(li);
    }
  }

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

          {/* list below is just current placeholder for top songs (will move to ImageCarousel later) */}
          <div className="list">
            <ol id="list" className="results">

            </ol>
          </div>
        </div>
      </div>
      <div className="spotify-login">
        <button className="spotify-login-button" onClick={authorize}>Login to Spotify</button>
      </div>
    </div>
  );
};

export default Share;

// chatgpt made the html and css for this page
//install react-router-dom npm