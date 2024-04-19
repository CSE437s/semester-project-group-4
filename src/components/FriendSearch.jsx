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


      <form className="max-w-md mx-auto">
        <label for="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
          </div>
          <input type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Mockups, Logos..." required />
          <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
        </div>
      </form>


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