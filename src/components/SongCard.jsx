import React from "react";

export default function SongCard({ element }) {
  return (
    <div key={element.id} className="col-lg-3 col-md-6 py-2">
      <div className="card">
        <div className="ratio ratio-1x1 bg-secondary bg-opacity-25">
          <iframe
            src={`https://open.spotify.com/embed/track/${element.id}`}
            width="100%"
            height="100%"
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
            title={element.name}
          ></iframe>
        </div>
        <div className="card-body">
          <h5 className="card-title d-flex justify-content-between">
            {element.name}
            <div className="add-options d-flex align-items-start">
            </div>
          </h5>
          <p className="card-text">{element.album.artists[0].name}</p>
          <p className="card-text">
            {element.album.release_date}
          </p>
        </div>
      </div>
    </div>
  );
}
