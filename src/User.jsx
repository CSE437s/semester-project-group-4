import React, { useState, useEffect, useRef } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import FriendSearch from './components/FriendSearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faTrash } from '@fortawesome/free-solid-svg-icons';
// import ProfilePicture from './components/ProfilePicture';
// import './css/Profile3.css';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';
import './css/Friends.css'

export default function Profile({ session }) {


    //use get url to encode uuid of user into url 
    //read url to get uuid
    //then call supabase to select data for that uuid
    console.log(session.user.id)

    // Get the URL
    const url = window.location.href;

    // Find the index of the question mark
    const questionMarkIndex = url.indexOf('?');

    // If there's a question mark in the URL
    if (questionMarkIndex !== -1) {
        // Extract everything after the question mark
        const queryString = url.slice(questionMarkIndex + 1);

        // Set everything after the question mark to the uuid variable
        const uuid = queryString;

        // Print the UUID
        console.log("the displayed user's Id",uuid);
    } else {
        console.log("No UUID found in the URL.");
    }


    return (
        <div className="app-container">
            <Sidebar />
            <div id="page_content_id" className="main-content">
                
            </div>
        </div >
    );
}
