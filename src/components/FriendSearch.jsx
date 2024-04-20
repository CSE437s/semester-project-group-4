import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/FriendSearch.css'
import { FaUserPlus } from 'react-icons/fa';
import { FaSearch } from "react-icons/fa";


const FriendSearch = () => {
  const [session, setSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendsList, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);


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
        .select('id, username, picture')
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

  useEffect(() => {
    getPendingRequests();
  }, [session]);

  async function getPendingRequests() {
    const { data: pendingData, error } = await supabase
      .from('friend_requests')
      .select('from_user')
      .eq('to_user', session.user.id);

    if (error) {
      console.error('Error fetching pending requests:', error);
      return;
    }

    if (pendingData) {
      const pendingUserIds = pendingData.map(request => request.from_user);
      const pendingUsernames = await Promise.all(pendingUserIds.map(async id => {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', id)
          .single();
        if (userError) {
          console.error(`Error fetching username for user id ${id}:`, userError);
          return null;
        }
        return userData ? userData.username : null;
      }));
      setPendingRequests(pendingUsernames.filter(username => username !== null));
      console.log("pendingRequests: " + pendingUsernames.filter(username => username !== null));
    }
  }

  async function handleSendFriendRequest(friendId) {
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

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          style={{ width: '300px' }}
          id="input_friend_search"
          className="bg-white border border-gray-700 text-black font-bold text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 placeholder-black placeholder:font-bold"
          placeholder="Search for users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch />

      </div>

      {searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map((user) => (
            <li key={user.id} className="user-item">
              <img
                className="pfp"
                src={user.picture ? user.picture : 'https://img.icons8.com/nolan/64/1A6DFF/C822FF/user-default.png'}
              />

              {user.username}
              {!friendsList.includes(user.id) && (
                <button className="add-friend-button" onClick={() => handleSendFriendRequest(user.id)}>
                  <FaUserPlus /> Add Friend
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


/*<a  href="https://icons8.com/icon/tZuAOUGm9AuS/user-default">User Default</a> icon by <a href="https://icons8.com">Icons8</a>*/

