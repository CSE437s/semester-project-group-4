import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';

export default function Analysis({ session }) {
    const [uuid, setUUID] = useState(null);


    useEffect(() => {
        function fetchID() {
            // Get the URL
            const url = window.location.href;
            // Find the index of the question mark
            const questionMarkIndex = url.indexOf('?');
            // If there's a question mark in the URL
            if (questionMarkIndex !== -1) {
                // Extract everything after the question mark
                const queryString = url.slice(questionMarkIndex + 1);
                // Set everything after the question mark to the uuid variable
                setUUID(queryString);

                // Print the UUID
                console.log("the displayed song's Id", uuid);
            } else {
                console.log("No UUID found in the URL.");
            }
        }
        fetchID();
    }, []);

    return (
        <div className="app-container bg-light">
            <Sidebar />
            <div id="page_content_id" className="main-content">

            </div>
        </div >
    );
}