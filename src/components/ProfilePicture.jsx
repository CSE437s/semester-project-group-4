import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../index.css'

const ProfilePicture = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        }).catch(error => {
            console.error('Error fetching session:', error);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        const fetchProfilePic = async () => {
            if (session) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('picture')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching profile picture:', error);
                } else {
                    console.log(data.picture)
                    // let publicURL = "https://ykpzemmokoonptpzqths.supabase.co/storage/v1/object/public/profile_pictures/" + data.picture
                    // publicURL = publicURL.replace(/\s/g, "%20");
                    setProfilePic(data.picture);
                }
            }
        };

        fetchProfilePic();
    }, [session]); // Add session as a dependency

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];

        // Resize image if necessary
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
            setProfilePic(publicURL);
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



    if (loading) {
        return (<div className="app-container"><div className="main-content"><p>Loading...</p></div>
        </div>
        );
    }
    return (
        <div className="profile-picture">
            {profilePic ? (
                <img src={profilePic} onClick={() => document.getElementById('fileInput').click()} />
            ) : (
                // <button onClick={() => document.getElementById('fileInput').click()}>Upload Image</button>
                <div className="mb-3 w-96">
                    <label
                        htmlFor="fileInput"
                        className="mb-2 inline-block text-neutral-700"
                    >
                        Upload a Profile Pic
                    </label>
                    <input
                        className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none"
                        type="file"
                        id="fileInput"
                        onChange={handleFileUpload}
                    />
                </div>



            )}
            <input id="fileInput" type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        </div>
    );
};

export default ProfilePicture;


//placeholder='Upload a Profile Pic'
/*

<label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="file_input">Upload file</label>
<input class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file">

*/