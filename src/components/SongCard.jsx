import React from "react";

export default function SongCard({ element }) {
  return (
    <div key={element.id} className="col-lg-3 col-md-6 py-2">
      <div className="card">
        <div className="ratio ratio-1x1 bg-secondary bg-opacity-25">
          <img
            src={element.album.images[0].url}
            className="card-img-top"
            alt="..."
          />
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
          <audio src={element.preview_url} controls className="w-100"></audio>
        </div>
      </div>
    </div>
  );
}

