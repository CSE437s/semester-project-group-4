import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import './css/User.css'

export default function Profile({ session }) {
    const [profile, setProfile] = useState(null);
    const [uuid, setUUID] = useState(null);
    const [friendCount, setFriendCount] = useState(0); // State for friend count
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

        async function fetchFriendCount() {
            try {
                const { data, error } = await supabase
                    .from('friends')
                    .select('id', { count: 'exact' }) // Count the number of friends
                    .eq('id', uuid);
                if (error) {
                    console.error('Error fetching friend count:', error.message);
                    return;
                }
                if (data) {
                    setFriendCount(data.length);
                } else {
                    console.error('No friend count data found');
                }
            } catch (error) {
                console.error('Error fetching friend count:', error.message);
            }
        }


        fetchFriendCount();

        fetchUserProfile();
    }, [session, uuid]);

    let cover_image_url = ""
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
                    <div id="profile-container" className="max-w-2xl mx-auto mt-16 bg-white shadow-xl rounded-lg text-gray-900">
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
                                    src={profile.picture ? profile.picture : 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'}
                                    alt="Profile"
                                />
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <h2 id="username" className="font-semibold">{profile.username}</h2>
                            <div id="friendCount" className="text-center mt-2">
                                <p>{friendCount} Friends</p>
                            </div>
                            <span id="soul">
                                <p id="soulTag"> Soul Artist:</p>
                                <p id="artist" className="">{profile.soulArtist ? profile.soulArtist : "None selected"}</p>
                            </span>

                            <div id="Bio">
                                {profile.bio}
                            </div>
                        </div>

                        <div id="dateJoined" className="text-center mt-2">
                            <p id="joined">Joined {new Date(profile.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>


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
