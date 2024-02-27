import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/Sidebar.css'

function Sidebar() {
    return (
        <div className="sidebarMain border-right" id="sidebar-wrapper">
          <div className="sidebarName sidebar-heading">groove</div>
          <div className="sideBarPages">
            <a href="../Profile" className="sideBarPage list-group-item list-group-item-action">Profile</a>
            <a href="../Share" className="sideBarPage list-group-item list-group-item-action">Share</a>
            <a href="../Feed" className="sideBarPage list-group-item list-group-item-action">Feed</a>
          </div>
        </div>
      );
}

export default Sidebar