import "../css/Search.css";
import { useEffect, useState } from "react";
import SongCard from "./SongCard";

function Search() {
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");
  const [tracks, setTracks] = useState([]);
  const [token, setToken] = useState(null);
  const [resultOffset, setResultOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(null);

  //citation: logic and design inspired by https://github.com/Vishesh-Pandey/v-music/tree/master/src/components

  const handleChange = (event) => {
    setKeyword(event.target.value);
  };

  const fetchMusicData = async () => {
    setTracks([]);
    window.scrollTo(0, 0);
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${keyword}&type=track&offset=${resultOffset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not find songs");
      }

      const jsonData = await response.json();

      setTracks(jsonData.tracks.items);
      setMessage(""); // Reset error message when songs are found
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setResultOffset(0);
      fetchMusicData();
    }
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          // CHANGE THIS TO JAY'S CREDENTIALS
          body: "grant_type=client_credentials&client_id=ed193d4352d04a51a7129faa920e5db1&client_secret=b6b6bbe6f2834ff18eff636ac202eb84",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch token");
        }

        const jsonData = await response.json();
        setToken(jsonData.access_token);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchToken();
  }, [setIsLoading]);


  return (
    <>
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for songs"
          className="border border-gray-300 rounded-l px-3 py-2 w-full"
        />
        <button
          onClick={fetchMusicData}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
        >
          Search
        </button>
      </div>

      <div className="container mx-auto">
        {isLoading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tracks.map((element) => (
            <SongCard key={element.id} element={element} />
          ))}
        </div>
        {tracks.length > 0 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setResultOffset((prev) => Math.max(0, prev - 20))}
              disabled={resultOffset === 0}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              Previous
            </button>
            <button
              onClick={() => setResultOffset((prev) => prev + 20)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Next
            </button>
          </div>
        )}
        {message && <div className="text-center text-red-500 mt-4">{message}</div>}
      </div>
    </>
  )


}

export default Search;
