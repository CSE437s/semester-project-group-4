import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
    return (
        <div className="sidebar">
            <div className="sidebar-title">Groove</div>
            <div className="sidebar-buttons">
                <Link to="/Profile" className="sidebar-button">Profile</Link>
                <Link to="/Share" className="sidebar-button">Share</Link>
                <Link to="/Feed" className="sidebar-button">Feed</Link>
            </div>
        </div>
    );
};
