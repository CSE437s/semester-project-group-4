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
// import Sidebar from './components/Sidebar';
// import SongLayout from './components/SongLayout';
// import { createRoot } from 'react-dom/client';

function App() {
  const [session, setSession] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])



  useEffect(() => {
    if (session != null) {
      const fetchOnboarded = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('hasOnboarded')
            .eq('id', session.user.id)
            .single();
          if (error) {
            console.error('Error fetching onboarding boolean:', error);
            return;
          }
          setHasOnboarded(data.hasOnboarded);
        } catch (error) {
          console.error('Unexpected error fetching onboarding status:', error);
        }
      };
    } else {
      setTimeout(function () {
        fetchOnboarded();
      }, 1000);

    }

    fetchOnboarded();
  }, [session]);


  return (
    <Router>
      <div className="container_main">
        {!session ? (
          <Auth />
        ) : hasOnboarded !== null ? (
          hasOnboarded ? (
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
            </Routes>
          ) : (
            <Routes>
              <Route path="/Onboarding" element={<Onboarding key={session.user.id} session={session} />} />
            </Routes>
          )
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </Router>
  );
}

export default App;