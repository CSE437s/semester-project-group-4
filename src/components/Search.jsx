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
      <nav className="navbar navbar-expand-lg bg-dark sticky-top">
        <div className="container-fluid">
          <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
            <input
              value={keyword}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              className="form-control me-2 w-75 rounded-md"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
            <button onClick={fetchMusicData} className="btn btn-outline-success">
              Search
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="d-none" x-show="isLoading">
          <div className="flex justify-center items-center h-24">
            <div className="w-8 h-8 animate-spin border-b-2 border-gray-700 rounded-full"></div>
            <span className="ml-2 invisible sm:visible">Loading...</span>
          </div>
        </div>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {tracks.map((element) => (
            <SongCard key={element.id} element={element} />
          ))}
        </div>
        <div className="row justify-content-between" x-show="tracks.length > 0">
          <button
            onClick={() => setResultOffset((previous) => previous - 20)}
            className="disabled:opacity-50 w-full py-2 text-center border border-gray-300 rounded-md hover:bg-gray-100"
            disabled={resultOffset === 0}
          >
            Prev: {resultOffset / 20}
          </button>
          <button
            onClick={() => setResultOffset((previous) => previous + 20)}
            className="disabled:opacity-50 w-full py-2 text-center border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Next: {resultOffset / 20 + 2}
          </button>
        </div>
        <div className="row">
          <div className="col">
            <h4 className="text-danger text-center py-2">{message}</h4>
          </div>
        </div>
      </div>

      <div
        className="modal fade position-absolute"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
      </div>


    </>
  );
}

export default Search;
