import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';


const ProfilePicture = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [renderPage, setRenderPage] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
            setTimeout(() => {
                setRenderPage(true);
            }, 1000);
        }).catch(error => {
            console.error('Error fetching session:', error);
            setLoading(false);
        });
        // console.log("myid"+session.user.id)
    }, []);

    useEffect(() => {
        const fetchProfilePic = async () => {
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
        };

        const timer = setTimeout(() => {
            fetchProfilePic();
        }, 5000); // 0.5 seconds

        return () => clearTimeout(timer); // Cleanup function to clear the timer if the component unmounts or the dependency array changes
    }, []);


    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const filePath = `profile_pictures/${file.name}`;

        let { error: uploadError } = await supabase.storage
            .from('profile_pictures')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            return;
        }

        let { error: updateError } = await supabase
            .from('profiles')
            .update({ picture: filePath })
            .eq('id', session.user.id);

        if (updateError) {
            console.error('Error updating profile picture:', updateError);
        } else {
            setProfilePic(filePath);
        }
    };

    if (loading || !renderPage) {
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
