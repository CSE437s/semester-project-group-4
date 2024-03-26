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
     
    </div>
  );
};

export default FriendsSongs;
