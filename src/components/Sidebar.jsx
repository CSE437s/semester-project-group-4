import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Ensure this path is correct for your project
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login'); // Adjust this if your login route differs
  };

  return (
    <div className="sidebarMain border-right" id="sidebar-wrapper">
      <div className="sidebarName sidebar-heading">groove</div>
      <div className="sideBarPages">
        {/* Other sidebar links */}
        <Link to="/Profile" className="sideBarPage">Profile</Link>
        <Link to="/Share" className="sideBarPage">Share</Link>
        <Link to="/Feed" className="sideBarPage">Feed</Link>
      </div>
      {/* Sign-out button at the bottom */}
      <div className="sideBarSignOut">
        <button onClick={handleLogout} className="sideBarPage signOutButton">
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
