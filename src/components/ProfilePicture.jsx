import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

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
                <button onClick={() => document.getElementById('fileInput').click()}>Upload Image</button>
            )}
            <input id="fileInput" type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        </div>
    );
};

export default ProfilePicture;
