import './css/share.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
// import { Link } from 'react-router-dom';
 import axios from 'axios'; // for API requests
 import qs from 'qs';
 import {Buffer} from 'buffer';
// import ImageCarousel from './ImageCarousel'; //must make this component !!!! or add it to this page

const Share = () => {
  const [topSongs, setTopSongs] = useState([]);

  //const axios = require('axios');
 //const qs = require('qs');

  //const client_id = process.env.REACT_APP_SPOTIFY_API_ID; // Your client id
  //const client_secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET; // Your secret
  let client_id= "1892c29e22e44ec686fa22a8e891b0f9";
  let client_secret = "011fa442dd504a46b6bd4d89aeab4036";
  const clientId = "1892c29e22e44ec686fa22a8e891b0f9";
  const redirectUri = "http://localhost:5173/Share";
  let tokenEndpoint = "https://accounts.spotify.com/api/token";
  const auth_token = Buffer.from(`${client_id}:${client_secret}`, 'utf-8').toString('base64');
  let redirect = "http://localhost:5173/Share"; //takes us back here after agreeing to Spotify

  const AUTHORIZE = "https://accounts.spotify.com/authorize";
  const TOKEN = "https://accounts.spotify.com/api/token";
  //const TRACKS = "/api/v1/me/top/tracks?offset=0&limit=5&time_range=short_term"; //getting top 5 tracks from last 4 weeks
  const TRACKS = "https://accounts.spotify.com/api/v1/me/top/tracks?offset=0&limit=5&time_range=short_term";

  // Data structure that manages the current active token, caching it in localStorage
  // const currentToken = {
  //   get access_token() { return localStorage.getItem('access_token') || null; },
  //   get refresh_token() { return localStorage.getItem('refresh_token') || null; },
  //   get expires_in() { return localStorage.getItem('refresh_in') || null },
  //   get expires() { return localStorage.getItem('expires') || null },

  //   save: function (response) {
  //     const { access_token, refresh_token, expires_in } = response;
  //     localStorage.setItem('access_token', access_token);
  //     localStorage.setItem('refresh_token', refresh_token);
  //     localStorage.setItem('expires_in', expires_in);

  //     const now = new Date();
  //     const expiry = new Date(now.getTime() + (expires_in * 1000));
  //     localStorage.setItem('expires', expiry);
  //   }
  // };

  // // On page load, try to fetch auth code from current browser search URL
  // const args = new URLSearchParams(window.location.search);
  // const code = args.get('code');

  // // If we find a code, we're in a callback, do a token exchange
  // if (code) {
  //   const token = await getToken(code);
  //   currentToken.save(token);

  //   // Remove code from URL so we can refresh correctly.
  //   const url = new URL(window.location.href);
  //   url.searchParams.delete("code");

  //   const updatedUrl = url.search ? url.href : url.href.replace('?', '');
  //   window.history.replaceState({}, document.title, updatedUrl);
  // }

  useEffect(() => {
    //onPageLoad();
    // Fetch user's top 3 songs from Spotify API
    // const fetchTopSongs = async () => {
    //   try {
    //     const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=3');
    //     setTopSongs(response.data.items);
    //   } catch (error) {
    //     console.error('Error fetching top songs:', error);
    //   }
    // };

    // fetchTopSongs();

    //getProfile();
    getToken(code);
    
    
    //getUserTopSongs();
  }, []);

  const args = new URLSearchParams(window.location.search);
  const code = args.get('code');

  const getToken = async code => {

    // stored in the previous step
    let codeVerifier = localStorage.getItem('code_verifier');
    // console.log("code inside token: " + code);
    // console.log("Verifier, " + codeVerifier);
    // console.log("redirect uri: " + redirectUri);
    // console.log("clientid: " + clientId);
    // const payload = {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    //   body: new URLSearchParams({
    //     client_id: clientId,
    //     grant_type: 'authorization_code',
    //     code,
    //     redirect_uri: redirectUri,
    //     code_verifier: codeVerifier,
    //   }),
    // }
  
    // //const body = await fetch(url, payload);
    // const body = await fetch("https://accounts.spotify.com/api/token", payload);
    // console.log(body);
    
    // const response = await body.json();

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    // if(response.status === 400) {
    //   getRefreshToken();
    // }
    console.log("response: ");
    console.log(response);
    const r = await response.json();
    
    console.log("r: ");
    console.log(r);
  
    localStorage.setItem('access_token', r.access_token);
    localStorage.setItem('refresh_token', r.refresh_token);
    console.log("access token store: " + localStorage.getItem('access_token'));
    console.log("refresh token store: " + localStorage.getItem('refresh_token'));

    if(localStorage.getItem('access_token') !== undefined){
      getUserTopSongs();
    }
  }

  const getRefreshToken = async () => {
    // refresh token that has been previously stored
    const refreshToken = localStorage.getItem('refresh_token');
    const url = "https://accounts.spotify.com/api/token";
 
     const payload = {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
       },
       body: new URLSearchParams({
         grant_type: 'refresh_token',
         refresh_token: refreshToken,
         client_id: clientId
       }),
     }
     const body = await fetch(url, payload);
     const response = await body.json();
 
     localStorage.setItem('access_token', response.accessToken);
     localStorage.setItem('refresh_token', response.refreshToken);
   }

  async function getProfile(access_Token) {
    let accessToken = localStorage.getItem('access_token');
  
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });
  
    const data = await response.json();
  }

  async function getUserTopSongs() {
    let accessToken = localStorage.getItem('access_token');
    console.log("accesss token: " + accessToken);
  
    const response = await fetch(TRACKS, {
      headers: {
        Authorization: 'Bearer ' + accessToken
      },
      mode: "no-cors",
    });

    console.log("top songs repsonse: " );
    console.log(response);
  
    const data = await response.json();
    console.log("Data: " + data);
  }
  
  


  // function onPageLoad() {
  //   console.log("Pagelaod");
  //   if(window.location.search.length > 0) {
  //     console.log("redirect");
  //     handleRedirect();
  //   } else {
  //     console.log("songs");
  //     getSongs();
  //   }
  // }

  async function getAuth() {
    try{
      //make post request to SPOTIFY API for access token, sending relavent info
      const token_url = 'https://accounts.spotify.com/api/token';
      const data = qs.stringify({'grant_type':'client_credentials'});
  
      const response = await axios.post(token_url, data, {
        headers: { 
          'Authorization': `Basic ${auth_token}`,
          'Content-Type': 'application/x-www-form-urlencoded' 
        }
      })
      //return access token
      return response.data.access_token;
      //console.log(response.data.access_token);   
    }catch(error){
      //on fail, log the error in console
      console.log(error);
    }
  }

  const getAudioFeatures_Track = async (track_id) => {
    //request token using getAuth() function
    const access_token = await getAuth();
    //console.log(access_token);
  
    const api_url = `https://api.spotify.com/v1/audio-features/${track_id}`;
    //console.log(api_url);
    try{
      const response = await axios.get(api_url, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      //console.log(response.data);
      return response.data;
    }catch(error){
      console.log(error);
    }  
  };

  const getTopSongs = async () => {
    //request token using getAuth() function
    const access_token = await getAuth();
    //console.log(access_token);

    const api_url = TRACKS;
    //console.log(api_url);
    try{
      const response = await axios.get(api_url, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      //console.log(response.data);
      return response.data;
    }catch(error){
      console.log(error);
    }  
  }
  
  // console.log(getAudioFeatures_Track('07A0whlnYwfWfLQy4qh3Tq'));
  // console.log(getTopSongs());
  

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
        songList(data);
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        console.log("Response text:", this.responseText); // Log the response text
        alert("Error parsing response. Check console for details.");
      }
    } else if (this.status === 401) {
      // Handle token expiration or invalid token
      refreshAccessToken();
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
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <h2>Share</h2>
          <p className="headerText">Select one of your top songs from the past week to share</p>
        </div>
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
      {/* <div className="spotify-login">
        <button className="spotify-login-button" onClick={authorize}>Login to Spotify</button>
      </div> */}
    </div>
  );
};

export default Share;

// chatgpt made the html and css for this page
//install react-router-dom npm