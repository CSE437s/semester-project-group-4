import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 
import '../css/Sidebar.css';
import { FaSignOutAlt } from 'react-icons/fa'
function Sidebar() {
  // const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="sidebarMain border-right" id="sidebar-wrapper media-sidebar-wrapper">
      <div className="sidebarName sidebar-heading">groove</div>
      <div className="sideBarPages">
        {/* Other sidebar links */}
        <Link to="/Profile" className="sideBarPage">Profile</Link>
        <Link to="/Share" className="sideBarPage">Share</Link>
        <Link to="/Feed" className="sideBarPage">Feed</Link>
      </div>
      {/* Sign-out button at the bottom */}
      <div className="sideBarSignOut">
        <button title="Sign Out" onClick={handleLogout} className="sideBarPage signOutButton">
          {/* Sign out */}
          <FaSignOutAlt />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;