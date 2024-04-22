import './css/App.css';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import Account from './Account';
import Share from './Share';
import Profile from './Profile';
import Feed from './Feed';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Friends from './Friends'
import User from './User';
import FriendSearch from './components/FriendSearch';
import Onboarding from './Onboarding';
import Analysis from './Analysis';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <Router>

      <div className="container_main">
        {!session ? (
          <Auth />
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/Profile" />} />
            <Route path="/Auth" element={<Auth />} />
            <Route path="/Share" element={<Share key={session.user.id} session={session} />} />
            <Route path="/Account" element={<Account key={session.user.id} session={session} />} />
            <Route path="/Profile" element={<Profile key={session.user.id} session={session} />} />
            <Route path="/Feed" element={<Feed key={session.user.id} session={session} />} />
            <Route path="/Friends" element={<Friends key={session.user.id} session={session} />} />
            <Route path="/User" element={<User key={session.user.id} session={session} />} />
            <Route path="/FriendSearch" element={<FriendSearch key={session.user.id} session={session} />} />
            <Route path="/Onboarding" element={<Onboarding key={session.user.id} session={session} />} />
            <Route path="/Analysis" element={<Analysis key={session.user.id} session={session} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;