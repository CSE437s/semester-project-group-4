import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/Sidebar.css'

function Sidebar() {
  return (
    <div className="sidebarMain border-right" id="sidebar-wrapper">
      <div className="sidebarName sidebar-heading">groove</div>
      <div className="sideBarPages">

        <Link to="/Profile" className="sideBarPage list-group-item list-group-item-action">Profile</Link>
        <Link to="/Share" className="sideBarPage list-group-item list-group-item-action">Share</Link>
        <Link to="/Feed" className="sideBarPage list-group-item list-group-item-action">Feed</Link>
      </div>
    </div>
  );
}

export default Sidebar