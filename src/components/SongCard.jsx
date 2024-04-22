import React from "react";
import '../css/SongCard.css'

export default function SongCard({ element }) {
  return (
    <div key={element.id}>
      <div>
        <div>
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
          <h5>
            {element.name}
            <div>
            </div>
          </h5>
          <p>{element.album.artists[0].name}</p>
          <p>
            {element.album.release_date}
          </p>
        </div>
      </div>
    </div>
  );
}
