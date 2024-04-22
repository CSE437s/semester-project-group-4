import { supabase } from '../supabaseClient'; // Ensure this path is correct for your project
import React, { useState, useEffect } from 'react';

const SongCard = ({ element }) => {
  const [isShared, setIsShared] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // console.log(session);
      setLoading(false);
      checkIfShared()
    }).catch(error => {
      console.error('Error fetching session:', error);
      setLoading(false);
    });
  }, []);

  // Function to check if the song is already shared
  const checkIfShared = async () => {
    const { data, error } = await supabase
      .from('shared_songs')
      .select('spotifySongId')
      .eq('id', session.user.id)
      .eq('spotifySongId', element.id);

    if (error) {
      console.error('Error fetching shared songs:', error.message);
      return;
    }

    setIsShared(data && data.length > 0);
  };

  // useEffect(() => {
  //   checkIfShared(); // Check on component mount
  // }, [session]); // Run only once on mount

  // Function to handle sharing the song
  const handleShare = async () => {
    // Share the song here
    // For now, let's just console log
    console.log('Sharing song...');
    // Assuming you have a function to update the shared songs in your supabase database
    // await shareSong(); 

    // After sharing, update the state to indicate it's shared
    setIsShared(true);
  };

  if (loading) {
    return (<div className="app-container"><div className="main-content"><p>Loading...</p></div>
    </div>
    );
  }

  return (
    <div key={element.id} className="cardContainer">
      <div className="centeredDiv">
        <div className="iframeContainer cardContent">
          <iframe
            src={`https://open.spotify.com/embed/track/${element.id}`}
            width="100%"
            height="100%"
            allowtransparency="true"
            allow="encrypted-media"
            title={element.name}
          ></iframe>
        </div>
        <div>
          <p>
            {new Date(element.album.release_date).toLocaleString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
          {isShared ? (
            <button disabled>Shared</button>
          ) : (
            <button onClick={handleShare}>Share</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongCard;
