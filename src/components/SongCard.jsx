import React from "react";
import '../css/SongCard.css'

export default function SongCard({ element }) {
  return (
    <div key={element.id} className="cardContainer">
      <div className="centeredDiv">
        <div className="iframeContainer cardContent">
          <iframe
            src={`https://open.spotify.com/embed/track/${element.id}`}
            width="100%"
            height="100%"
            allowtransparency="true"
            allow="encrypted-media"
            title={element.name}
          ></iframe>
        </div>
        <div>
          <p>
            {new Date(element.album.release_date).toLocaleString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
