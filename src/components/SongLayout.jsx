import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ensure this path is correct for your project
import '../css/SongLayout.css';
const SongLayout = (props) => { //props.songs

    //console.log(props.songs);
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })
    }, [])


    async function shareWithFriends(json) {
        const { data, error } = await supabase
            .from('shared_songs')
            .insert([
                { id: session.user.id, song: json, spotifySongId: json.id }
            ]);

        if (error) {
            console.error('Error: ', error);
        } else {
            console.log('Song added successfully:', data);
        }
    }


    //for these methods, also store the song data in database
    let shareSong = (int) => {
        console.log("songShareButton" + int);
        var id = "songShareButton" + int
        var song = document.getElementById(id);
        song.innerHTML = "Shared";
        song.disabled = true;
        shareWithFriends(props.songs[int])
    }

    // function shareSong0() {
    //     console.log("share");
    //     var song = document.getElementById("songShareButton0");
    //     song.innerHTML = "Shared";
    //     song.disabled = true;
    //     shareWithFriends(props.songs[0])
    // }

    if (props.songs.length == 0) {
        return (
            <div className="centered" id="noSongsContainer">
                <div>
                    <h3>You don't have 10 top songs. Why not try searching for songs below?</h3>
                </div>
                <div>
                    <iframe id="dog" src="https://lottie.host/embed/60b5c34c-47f0-40e4-a5e0-3259e78ede3f/3RQ0wYJeIX.json"></iframe>
                </div>
            </div>
        );
    }

    return (
        <div className="centered container mx-auto text-center">
            <script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
            <div className="grid md:grid-cols-2 gap-4">
                {props.songs.length > 0 && props.songs.map((x, i) => {
                    return <div className="card max-w-sm rounded overflow-hidden shadow-lg" id={"card" + i}>
                        {props.songs.length > 0 && (
                            <iframe
                                className="rounded-lg"
                                src={"https://open.spotify.com/embed/track/" + x.id + "?utm_source=generator"}
                                width="100%"
                                height="175px"
                                allowFullScreen=""
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            ></iframe>
                        )}
                        <button onClick={() => shareSong(i)} id={"songShareButton" + i} className=" text-white py-2 px-4 shareButton">Share This Song</button>
                    </div>
                })}
            </div>
        </div>
    );
};


export default SongLayout;