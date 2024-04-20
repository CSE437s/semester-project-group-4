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
    console.log(session)
    return (
        <div>
    
         
    
        </div>
      );
}
