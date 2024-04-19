import React, { useContext, useState } from 'react';
import Card from './components/Card';
import { MusicContext } from './Context';
import './css/Search.css'; // Assuming you have or will have specific CSS for this component

const Search = () => {
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [tracks, setTracks] = useState([]);
  const { token, isLoading, setIsLoading, setResultOffset, resultOffset } = useContext(MusicContext);

  const fetchMusicData = async () => {
    if (!keyword.trim()) return; // Prevent empty queries
    setTracks([]);
    window.scrollTo(0, 0);
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(keyword)}&type=track&offset=${resultOffset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch music data');
      }
      const jsonData = await response.json();
      setTracks(jsonData.tracks.items);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      setResultOffset(0);
      fetchMusicData();
    }
  };

  return (
    <>
      <div className="search-bar">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for songs"
        />
        <button onClick={fetchMusicData}>Search</button>
      </div>

      <div className="container">
        {isLoading && (
          <div className="loading">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        <div className="tracks">
          {tracks.map((element) => (
            <Card key={element.id} element={element} />
          ))}
        </div>
        {tracks.length > 0 && (
          <div className="pagination">
            <button onClick={() => setResultOffset((prev) => Math.max(0, prev - 20))} disabled={resultOffset === 0}>
              Previous
            </button>
            <button onClick={() => setResultOffset((prev) => prev + 20)}>
              Next
            </button>
          </div>
        )}
        {message && <div className="message">{message}</div>}
      </div>
    </>
  );
};

export default Search;