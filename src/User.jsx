import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';

export default function Profile({ session }) {
    const [profile, setProfile] = useState(null);
    const [uuid, setUUID] = useState(null);
    //use get url to encode uuid of user into url 
    //read url to get uuid
    //then call supabase to select data for that uuid
    console.log(session.user.id)


    useEffect(() => {
        function fetchUserID() {

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
                console.log("the displayed user's Id", uuid);
            } else {
                console.log("No UUID found in the URL.");
            }

        }

        fetchUserID();
    }, [session]);

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", uuid)
                    .single();
                if (error) {
                    console.error("Error fetching user profile:", error.message);
                    return null;
                }
                if (data) {
                    setProfile(data);
                    console.log("data: ", data)
                } else {
                    console.error("User profile not found");
                    return null;
                }
            } catch (error) {
                console.error("Error fetching user profile:", error.message);
                return null;
            }
        }
        fetchUserProfile();
    }, [session, uuid]);

    let cover_image_url=""
    //  cover_image_url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVul-mhuS68NxbT3BhIBcg0HClx0Vkwk7NRq60FkuEEg&s"
    cover_image_url = "https://static.vecteezy.com/system/resources/previews/006/464/063/non_2x/abstract-equalizer-wave-design-music-sound-wave-element-waveform-with-neon-color-gradient-wavy-line-background-free-photo.jpg"

    // cover_image_url="https://img.freepik.com/premium-vector/blue-golden-sound-waves-background_23-2148486089.jpg"
    // cover_image_url="https://img.freepik.com/free-vector/colorful-equalizer-wave-background_23-2148435447.jpg"

    // cover_image_url="https://t3.ftcdn.net/jpg/06/22/37/62/360_F_622376283_EqrL1mYAkZujPYy8SscBr4SZAKWDK5mX.jpg"
    // cover_image_url="https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAyL3Jhd3BpeGVsb2ZmaWNlMTJfYWJzdHJhY3RfMTk4MHNfZHJlYW15X3JldHJvd2F2ZV9zb3VuZF93YXZlX2dyYV82NGEyYmE4MC0zYmVlLTQ3NDEtYmFlMS0xYTIxNTVlY2U4ODdfMS5qcGc.jpg"



    //component from tailwindflex.com
    return (
        <div className="app-container">
            <Sidebar />
            <div id="page_content_id" className="main-content">


                {profile && (
                    <div className="max-w-2xl mx-auto mt-16 bg-white shadow-xl rounded-lg text-gray-900">
                        <div className="rounded-t-lg h-48 overflow-hidden">
                            <img
                                className="object-cover object-top w-full h-full" 
                                src={cover_image_url}
                                alt="Cover"
                            />
                        </div>
                        <div className="flex justify-center items-center -mt-16">
                            <div className="w-32 h-32 border-4 border-white rounded-full overflow-hidden">
                                <img
                                    className="object-cover object-center h-32 w-full"
                                    src={profile.picture}
                                    alt="Profile"
                                />
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <h2 className="font-semibold">{profile.username}</h2>
                            <p className="text-gray-500">{profile.soulartist}</p>
                        </div>
                        <ul className="py-4 mt-2 text-gray-700 flex items-center justify-around">
                            <li className="flex flex-col items-center justify-around">
                                <svg
                                    className="w-4 fill-current text-blue-900"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                                <div>{profile.followers_count}</div>
                            </li>
                            <li className="flex flex-col items-center justify-between">
                                <svg
                                    className="w-4 fill-current text-blue-900"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M7 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 1c2.15 0 4.2.4 6.1 1.09L12 16h-1.25L10 20H4l-.75-4H2L.9 10.09A17.93 17.93 0 0 1 7 9zm8.31.17c1.32.18 2.59.48 3.8.92L18 16h-1.25L16 20h-3.96l.37-2h1.25l1.65-8.83zM13 0a4 4 0 1 1-1.33 7.76 5.96 5.96 0 0 0 0-7.52C12.1.1 12.53 0 13 0z" />
                                </svg>
                                <div>{profile.posts_count}</div>
                            </li>
                            <li className="flex flex-col items-center justify-around">
                                <svg
                                    className="w-4 fill-current text-blue-900"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9 12H1v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-8v2H9v-2zm0-1H0V5c0-1.1.9-2 2-2h4V2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v6h-9V9H9v2zm3-8V2H8v1h4z" />
                                </svg>
                                <div>{profile.likes_count}</div>
                            </li>
                        </ul>
                        {/* <div className="p-4 border-t mx-8 mt-2">
            <button className="w-1/2 block mx-auto rounded-full bg-gray-900 hover:shadow-lg font-semibold text-white px-6 py-2">
                Friend Request
            </button>
        </div> */}
                    </div>
                )}





            </div>
        </div>
    );
}
