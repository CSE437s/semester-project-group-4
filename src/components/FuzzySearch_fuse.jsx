import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js'; // Assuming Fuse.js is installed

import { supabase } from '../supabaseClient'; // Replace with your Supabase client initialization

const FriendSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);

  const options = {
    keys: ['username'], // Search by username
    threshold: 0.4, // Adjust the minimum match score (0-1)
  };

  const fuse = React.useMemo(() => {
    return searchTerm ? new Fuse(profiles, options) : null;
  }, [searchTerm, profiles]); // Rebuild fuse on searchTerm or profiles change

  useEffect(() => {
    const fetchFriends = async () => {
      const { data, error } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', supabase.auth.user().id);

      if (error) {
        console.error('Error fetching friends:', error);
        return;
      }

      setFriends(data.map((friend) => friend.friend_id));
    };

    fetchFriends();
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('Profiles')
        .select('id', 'username');

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      const profiles = data.filter((user) => user.id !== supabase.auth.user().id);
      setSearchResults(profiles); // Store all profiles for Fuse search
    };

    fetchProfiles();
  }, []);

  const handleSearch = () => {
    if (!fuse) return;

    const results = fuse.search(searchTerm);
    setSearchResults(results.map((result) => result.item));
  };

  const handleAddFriend = async (userId) => {
    const { error } = await supabase
      .from('friends')
      .insert([{ user_id: supabase.auth.user().id, friend_id: userId }]);

    if (error) {
      console.error('Error adding friend:', error);
      return;
    }

    setFriends([...friends, userId]);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search for users"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      {searchResults.length > 0 && (
        <ul>
          {searchResults.map((user) => (
            <li key={user.id}>
              {user.username}
              {!friends.includes(user.id) && (
                <button onClick={() => handleAddFriend(user.id)}>
                  Add Friend
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendSearch;
