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
      <nav className="navbar navbar-dark navbar-expand-lg bg-dark sticky-top">
        <div className="container-fluid">
          <div
            className="collapse navbar-collapse d-flex justify-content-center"
            id="navbarSupportedContent"
          >
            <input
              value={keyword}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              className="form-control me-2 w-75"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
            <button
              onClick={fetchMusicData}
              className="btn btn-outline-success"
            >
              Search
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className={`row ${isLoading ? "" : "d-none"}`}>
          <div className="col-12 py-5 text-center">
            <div
              className="spinner-border"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <div className="row">
          {tracks.map((element) => {
            return <SongCard key={element.id} element={element} />;
          })}
        </div>
        <div className="row" hidden={tracks.length === 0}>
          <div className="col">
            <button
              onClick={() => {
                setResultOffset((previous) => previous - 20);
                fetchMusicData();
              }}
              className="btn btn-outline-success w-100"
              disabled={resultOffset === 0}
            >
              Prev: {resultOffset / 20}
            </button>
          </div>
          <div className="col">
            <button
              onClick={() => {
                setResultOffset((previous) => previous + 20);
                fetchMusicData();
              }}
              className="btn btn-outline-success w-100"
            >
              Next: {resultOffset / 20 + 2}
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <h4 className="text-center text-danger py-2">{message}</h4>
          </div>
        </div>
      </div>
      <div
        className="modal fade position-absolute"
        id="exampleModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
      </div>
    </>
  );
}

export default Search;
