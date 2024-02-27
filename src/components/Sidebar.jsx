import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/Sidebar.css'

function Sidebar() {
  return (
    <div className="sidebarMain border-right" id="sidebar-wrapper">
      <div className="sidebarName sidebar-heading">groove</div>
      <div className="sideBarPages">

        {/* <Link to="/Profile" className="sideBarPage list-group-item list-group-item-action">Profile</Link> */}
        <div className="sideBarDiv">
        <Link to="/Profile" className="sideBarPage">Profile</Link>
        </div>
        <div className="sideBarDiv">
        <Link to="/Share" className="sideBarPage">Share</Link>
        </div>
        <div className="sideBarDiv">
        <Link to="/Feed" className="sideBarPage">Feed</Link>
        </div>
      </div>
    </div>
  );
}

export default Sidebar