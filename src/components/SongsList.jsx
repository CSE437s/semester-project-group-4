import React from 'react';

const SongsList = ({ songs }) => {
  return (
    <div>
      {songs.map(song => (
        <div key={song.id} className="song-item">
          {/* Embed Spotify track using formatted URL */}
          <iframe
            src={`https://open.spotify.com/embed/track/${song.id}?utm_source=generator`}
            width="100%"
            height="80"
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
          ></iframe>
        </div>
      ))}
    </div>
  );
};

export default SongsList;
