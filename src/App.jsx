import './App.css';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import Account from './Account';
import Share from './Share';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

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

      <div className="container" style={{ padding: '50px 0 100px 0' }}>
        {!session ? (
          <Auth />
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/Auth" />} />
            <Route path="/Share" element={<Share key={session.user.id} session={session} />} />
            <Route path="/Account" element={<Account key={session.user.id} session={session} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}


/*
<div className="container" style={{ padding: '50px 0 100px 0' }}>
        {!session ? (
          <Auth />
        ) : (
          <Routes>
            <Route path="./Account" element={<Account key={session.user.id} session={session} />} />
            <Route path="./Share" element={<Share key={session.user.id} session={session} />} />
            
            </Routes>
            )}
          </div>



*/

// const rootElement = document.getElementById("root");
// if (rootElement.hasChildNodes()) {
//   createRoot(rootElement, { hydrate: true }).render(<App />);
// } else {
//   createRoot(rootElement).render(<App />);
// }

export default App;

