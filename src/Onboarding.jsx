import { supabase } from './supabaseClient';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/Onboarding.css'

export default function Onboarding({ session }) {
    //type in your username and add your PFP here
    //or you can choose skip

    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [isValidUsername, setIsValidUsername] = useState(true); 

    const handleUsernameChange = (e) => {
        let username = e.target.value;
        const regex = /^[a-zA-Z0-9]+$/;

        // Check if the username length is under 10 characters and matches the regex
        let isValid = username.length <= 10 && regex.test(username);
        setIsValidUsername(isValid);

        if (isValid) {
            setUsername(username)
        } else {
            console.log("username must be 10 or less")
        }

    };

    const handleProfilePictureChange = async (e) => {
        // You can handle image upload logic here
        const file = e.target.files[0];
        setProfilePicture(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Username:", username);
        console.log("Profile Picture:", profilePicture);
        const { data, error } = await supabase
            .from('profiles')
            .update({ hasOnboarded: 'true', username: username })
            .eq('id', session.user.id)
        if (error) {
            console.error('Error updating onboarding boolean:', error);
            return;
        } else {
            const currentDomain = window.location.origin;
            const targetUrl = `${currentDomain}/Profile`;
            window.location.href = targetUrl;
        }
    };

    const handleSkip = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ hasOnboarded: 'true' })
                .eq('id', session.user.id)
            if (error) {
                console.error('Error updating onboarding boolean:', error);
                return;
            } else {
                const currentDomain = window.location.origin;
                const targetUrl = `${currentDomain}/Profile`;
                window.location.href = targetUrl;
            }
        } catch (error) {
            console.error('Unexpected error updating onboarding status:', error);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            <h1 id="groove1">groove</h1>
            <h2 id="title1" className="">You haven't finished your profile yet</h2>
            {!isValidUsername  && <p className="text-red-500">Username must be 10 characters or less and contain only letters and numbers.</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        placeholder="Create your username"
                        value={username}
                        onChange={handleUsernameChange}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
                        Profile Picture
                    </label>
                    <input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        onChange={handleProfilePictureChange}
                    />
                </div>
                <div className="flex justify-between">
                    <button
                        id="sb"
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
                    >
                        Skip
                    </button>
                </div>
            </form>
        </div>
    );
};
