import { supabase } from './supabaseClient';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/Onboarding.css'
import HaloComponent from './components/HaloComponent';

export default function Onboarding({ session }) {
    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [isValidUsername, setIsValidUsername] = useState(true);
    const [songBio, setSongBio] = useState('');
    const [soulArtist, setsoulArtist] = useState('');

    const handleUsernameChange = (e) => {
        let username = e.target.value;
        const regex = /^[a-zA-Z0-9]+$/;

        let isValid = username.length <= 10 && regex.test(username);

        setIsValidUsername(isValid);

        // Use a callback function with setUsername to allow removing the first character
        setUsername(prevUsername => {
            if (isValid || username === '') {
                return username;
            } else if (prevUsername.length > username.length) {
                // If user is deleting a character, allow it regardless of validity
                return username;
            } else {
                return prevUsername;
            }
        });
    };

    const handleProfilePictureChange = async (e) => {
        // You can handle image upload logic here
        const file = e.target.files[0];
        const resizedFile = await resizeImage(file);

        // Generate a random string for filename
        const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 5);
        const filePath = `${randomString}.${resizedFile.name.split('.').pop()}`; // Add original extension

        let { error: uploadError } = await supabase.storage
            .from('profile_pictures')
            .upload(filePath, resizedFile);

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            alert("Sorry, there was an error updating your image");
            return;
        }

        let publicURL = "https://ykpzemmokoonptpzqths.supabase.co/storage/v1/object/public/profile_pictures/" + filePath;
        publicURL = publicURL.replace(/\s/g, "%20");
        let { error: updateError } = await supabase
            .from('profiles')
            .update({ picture: publicURL })
            .eq('id', session.user.id);

        if (updateError) {
            console.error('Error updating profile picture:', updateError);
            alert("Sorry, there was an error updating your image");
        } else {
            setProfilePicture(publicURL);
        }
    };

    const resizeImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const MAX_WIDTH = 100;
                    const MAX_HEIGHT = 100;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const resizedFile = new File([blob], file.name, { type: file.type });
                        resolve(resizedFile);
                    }, file.type);
                };
            };
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Username:", username);
        console.log("Profile Picture:", profilePicture);
        const { data, error } = await supabase
            .from('profiles')
            .update({ hasOnboarded: 'true', username: username, soulArtist: soulArtist, bio: songBio })
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

    const handleSoul = (e) => {
        let soul = e.target.value;
        setsoulArtist(soul);
    };

    const handleBio = (e) => {
        let bio = e.target.value;
        // Ensure bio length does not exceed 800 characters
        if (bio.length > 100) {
            bio = bio.slice(0, 100);
        }
        setSongBio(bio);
    };


    return (
        <div id="parent" className="relative overflow-hidden h-screen">
            <div id="not_background" className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl relative z-10">
                <div id="foreground">
                    <h1 id="groove1">groove</h1>
                    <h2 id="title1" className="">You haven't finished your profile yet</h2>
                    {!isValidUsername && <p id="warning" className="">Must be 10 characters or less and contain only letters and numbers</p>}
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
                            <label htmlFor="soul" className="block text-sm font-medium text-gray-700">
                                Soul Artist
                            </label>
                            <input
                                type="text"
                                id="soul"
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                placeholder="My soul artist is..."
                                value={soulArtist}
                                onChange={handleSoul}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="Bio" className="block text-sm font-medium text-gray-700">
                                Song Bio
                            </label>
                            <textarea
                                type="text"
                                id="Bio"
                                className="mt-1 p-4 block w-full border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                placeholder="My tastes in music are..."
                                value={songBio}
                                onChange={handleBio}
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
            </div>
            <div className="fixed top-0 left-0 w-screen h-screen z-0">
                <div className="absolute top-0 left-0 w-full h-full">
                    <HaloComponent />
                </div>
            </div>
        </div>



    );
};
