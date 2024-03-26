import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Replace with your Supabase client import

const FriendsSongs = () => {
  const [friends, setFriends] = useState([]);
  const [songs, setSongs] = useState([]);
  const user = supabase.auth.user(); // Check user here

  useEffect(() => {
    const getFriendsSongs = async () => {
      if (!user) return;

      // Get friend IDs
      const { data, error } = await supabase
        .from('friends')
        .select('is_friends_with')
        .eq('id', user.id);

      if (error) throw error;

      const friendIds = data.map((friend) => friend.is_friends_with);

      // Get songs from friends
      const { data: songData, error: songError } = await supabase
        .from('shared_songs')
        .select('song')
        .in('id', friendIds);

      if (songError) throw songError;

      const songIds = songData.map((song) => song.song);
      setSongs(songIds);
    };

    getFriendsSongs();
  }, []);

  return (
    <div>
      <h2>Friends' Songs</h2>
      {user && ( // Check if user exists before accessing session data
        songs.length > 0 ? (
          songs.map((songId) => (
            <iframe
              key={songId}
              src={`https://open.spotify.com/embed/track/${songId}`}
              width="100%"
              height="80"
              frameBorder="0"
              allowtransparency="true"
              allow="encrypted-media"
            ></iframe>
          ))
        ) : (
          <p>No songs shared by friends yet.</p>
        )
      )}
      {!user && <p>Loading...</p>}  // Display loading message if user not available
    </div>
  );
};

export default FriendsSongs;
