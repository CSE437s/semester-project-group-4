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
                    setProfilePic(data.picture);
                }
            }
        };

        fetchProfilePic();
    }, [session]); // Add session as a dependency

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const filePath = `${file.name}`;

        let { error: uploadError } = await supabase.storage
            .from('profile_pictures')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            return;
        }

        let { publicURL, error: urlError } = supabase.storage
            .from('profile_pictures')
            .getPublicUrl(filePath);

        if (urlError) {
            console.error('Error getting public URL:', urlError);
            return;
        }
        
        let { error: updateError } = await supabase
            .from('profiles')
            .update({ picture: publicURL })
            .eq('id', session.user.id);

        if (updateError) {
            console.error('Error updating profile picture:', updateError);
        } else {
            setProfilePic(publicURL);
            // alert(publicURL)
        }
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
