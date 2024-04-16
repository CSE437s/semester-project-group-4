import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 

const FriendSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);

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
    const fetchUsers = async () => {
      if (!searchTerm) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('Profiles')
        .select('id', 'username')
        .ilike('username', `%${searchTerm}%`)
        .ne('id', supabase.auth.user().id);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setSearchResults(
        data.filter((user) => !friends.includes(user.id))
      );
    };

    fetchUsers();
  }, [searchTerm, friends]);

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
