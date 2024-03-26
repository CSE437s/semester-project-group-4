import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ensure this path is correct for your project
import 'bootstrap/dist/css/bootstrap.min.css';
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
                { id: session.user.id, song: json, spotifySongId: song.song.id }
            ]);

        if (error) {
            console.error('Error: ', error);
        } else {
            console.log('Song added successfully:', data);
        }
    }


    //for these methods, also store the song data in database
    function shareSong1() {
        console.log("share");
        var song = document.getElementById("songShareButton1");
        song.innerHTML = "Shared";
        song.disabled = true;
        shareWithFriends(props.songs[0])
    }

    function shareSong2() {
        console.log("share");
        var song = document.getElementById("songShareButton2");
        song.innerHTML = "Shared";
        song.disabled = true;
        shareWithFriends(props.songs[1])
    }

    function shareSong3() {
        console.log("share");
        var song = document.getElementById("songShareButton3");
        song.innerHTML = "Shared";
        song.disabled = true;
        shareWithFriends(props.songs[2])
    }

    function shareSong4() {
        console.log("share");
        var song = document.getElementById("songShareButton4");
        song.innerHTML = "Shared";
        song.disabled = true;
        shareWithFriends(props.songs[3])
    }

    return (
        <div className="container text-center">
            <script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
            <div className="row row-cols-2">
                <div className="col">
                    <div className="card" id="card1" style={{ width: "18rem" }}>
                        {props.songs.length > 0 && <iframe style={{ borderRadius: "12px" }} src={"https://open.spotify.com/embed/track/" + props.songs[0].id + "?utm_source=generator"} width="100%" height="152" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>}
                        <div className="card-body">
                            <h5 className="card-title">{props.songs.length > 0 ? props.songs[0].name : ""}</h5>
                            <p className="card-text">{props.songs.length > 0 ? props.songs[0].artists[0].name : ""}</p>
                            <button onClick={shareSong1} id="songShareButton1" className="btn btn-primary shareButton">Share This Song</button>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card" id="card2" style={{ width: "18rem" }}>
                        {props.songs.length > 0 && <iframe style={{ borderRadius: "12px" }} src={"https://open.spotify.com/embed/track/" + props.songs[1].id + "?utm_source=generator"} width="100%" height="152" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>}
                        <div className="card-body">
                            <h5 className="card-title">{props.songs.length > 0 ? props.songs[1].name : ""}</h5>
                            <p className="card-text">{props.songs.length > 0 ? props.songs[1].artists[0].name : ""}</p>
                            <button onClick={shareSong2} id="songShareButton2" className="btn btn-primary shareButton">Share This Song</button>
                        </div>
                    </div>
                </div>
                <div className="w-100"></div>
                <div className="col">
                    <div className="card" id="card3" style={{ width: "18rem" }}>
                        {props.songs.length > 0 && <iframe style={{ borderRadius: "12px" }} src={"https://open.spotify.com/embed/track/" + props.songs[2].id + "?utm_source=generator"} width="100%" height="152" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>}
                        <div className="card-body">
                            <h5 className="card-title">{props.songs.length > 0 ? props.songs[2].name : ""}</h5>
                            <p className="card-text">{props.songs.length > 0 ? props.songs[2].artists[0].name : ""}</p>
                            <button onClick={shareSong3} id="songShareButton3" className="btn btn-primary shareButton">Share This Song</button>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card" id="card4" style={{ width: "18rem" }}>
                        {props.songs.length > 0 && <iframe style={{ borderRadius: "12px" }} src={"https://open.spotify.com/embed/track/" + props.songs[3].id + "?utm_source=generator"} width="100%" height="152" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>}
                        <div className="card-body">
                            <h5 className="card-title">{props.songs.length > 0 ? props.songs[3].name : ""}</h5>
                            <p className="card-text">{props.songs.length > 0 ? props.songs[3].artists[0].name : ""}</p>
                            <button onClick={shareSong4} id="songShareButton4" className="btn btn-primary shareButton">Share This Song</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default SongLayout;