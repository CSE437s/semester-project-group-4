import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const FriendSearch = () => {
  const [session, setSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendsList, setFriends] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    const fetchFriends = async () => {
      const { data, error } = await supabase
        .from('friends')
        .select('is_friends_with')
        .eq('id', session.user.id);
      if (error) {
        console.error('Error fetching friends:', error);
        return;
      }
      setFriends(data.map((friend) => friend.friend_id));
      console.log("friendsList", friendsList);
    };
    fetchFriends();
  }, [session]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchTerm) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', `%${searchTerm}%`)
        .neq('id', session.user.id);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      console.log("raw usernames data", data);

      setSearchResults(
        data.filter((user) => !friendsList.includes(user.id))
      );
      console.log("search results", searchResults)
    };

    fetchUsers();
  }, [searchTerm, friendsList]);

  async function handleSendFriendRequest() {
    // Find the recipient friend's UUID from their username
    const { data: friendData, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error fetching friend:', error);
      return;
    }

    if (!friendData) {
      alert('No user found with this username');
      return;
    }

    const friendId = friendData.id;

    // Check if friend request already sent
    const existingRequest = pendingRequests.includes(friendId);
    if (existingRequest) {
      alert('Friend request already sent');
      return;
    }

    // Send friend request
    const { data: requestData, error: requestError } = await supabase
      .from('friend_requests')
      .insert([{ from_user: session.user.id, to_user: friendId }]);

    if (requestError) {
      console.error('Error sending friend request:', requestError);
    } else {
      console.log('Friend request sent successfully:', requestData);
      getPendingRequests();
    }
  }

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
              {!friendsList.includes(user.id) && (
                <button onClick={() => handleSendFriendRequest(user.id)}>
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