import './css/share.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SongLayout from './components/SongLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
// import { Link } from 'react-router-dom';
 import axios from 'axios'; // for API requests
 import qs from 'qs';
 import {Buffer} from 'buffer';
// import ImageCarousel from './ImageCarousel'; //must make this component !!!! or add it to this page

const Share = () => {
  const [topSongs, setTopSongs] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

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
  const TRACKS = 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=4&offset=0';

  useEffect(() => {
    Promise.all([getToken()])
    .then((response) => {
      console.log("PROMISED RESPONSE: ");
      console.log(response);
      getUserTopSongs();
    });
  }, []);

  const args = new URLSearchParams(window.location.search);
  const code = args.get('code');

  const getToken = async () => {
    // stored in the previous step
    let codeVerifier = localStorage.getItem('code_verifier');


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
      form: {
        grant_type: 'client_credentials'
      },
    });

    const data = await response.json();

    if(data.access_token != undefined) {
      // Store tokens in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      console.log("Access token stored:", localStorage.getItem('access_token'));
      console.log("Refresh token stored:", localStorage.getItem('refresh_token'));
    }

    return data.access_token; // Return the access token for further use if needed
  }

  const getRefreshToken = async (refreshToken) => {
    // refresh token that has been previously stored
    //const refreshToken = localStorage.getItem('refresh_token');
    const url = "https://accounts.spotify.com/api/token";
    console.log(refreshToken);
 
     const payload = {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': 'Basic ' + btoa(clientId + ':' + client_secret)
       },
       body: new URLSearchParams({
         grant_type: 'refresh_token',
         refresh_token: refreshToken,
         client_id: clientId
       }),
     }
     const body = await fetch(url, payload);
     const response = await body.json();
     console.log("response: ");
    console.log(response);
 
     localStorage.setItem('access_token', response.accessToken);
     localStorage.setItem('refresh_token', response.refreshToken);
   }

  async function getUserTopSongs() {
    let accessToken = localStorage.getItem('access_token');
    console.log("accesss token: " + accessToken);
  
    const response = await fetch(TRACKS, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    });

    // if (!response.ok) {
    //   if (response.status === 401) {
    //     console.log('Access token is invalid. Attempting to refresh...');
    //     // Call a function to refresh the access token if you have a refresh token
    //     const refreshToken = localStorage.getItem('refresh_token');
    //     getRefreshToken(refreshToken);
    //     // Otherwise, prompt the user to log in again
    //   } else {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }
    // }

    console.log("top songs repsonse: " );
    console.log(response);
  
    const data = await response.json();
    console.log("Data: ");
    console.log(data);
  }

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

  const getTracks = async () => {
    //request token using getAuth() function
    const access_token = await getAuth();
    //console.log(access_token);
  
    const api_url = 'https://api.spotify.com/v1/tracks?ids=2VjXGuPVVxyhMgER3Uz2Fe%2C7eqoqGkKwgOaWNNHx90uEZ%2C2LlOeW5rVcvl3QcPNPcDus%2C68ZngF8g3iLiUhOqwutNgW';

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

  const storeTracks = async () => {
    const trackResponse = await getTracks();
    setTopSongs(trackResponse.tracks);
    //console.log(topSongs);
  }

  //calling API to get general song data and storing it to variable
  storeTracks();

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
          <h2>Your Top 4 Songs</h2>
          {/* <ImageCarousel songs={topSongs} /> */}

          {/* list below is just current placeholder for top songs (will move to ImageCarousel later) */}
          <SongLayout songs={topSongs} />
        </div>
      </div>
    </div>
  );
};

export default Share;

// chatgpt made the html and css for this page
//install react-router-dom npm