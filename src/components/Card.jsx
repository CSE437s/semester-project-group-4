import React, { useContext, useEffect } from "react";
import { MusicContext } from "../Context";

function Card({ element }) {
  const musicContext = useContext(MusicContext);
  const likedMusic = musicContext.likedMusic;
  const setLikedMusic = musicContext.setLikedMusic;
  const pinnedMusic = musicContext.pinnedMusic;
  const setPinnedMusic = musicContext.setPinnedMusic;

  const handlePin = () => {
    let pinnedMusicList = localStorage.getItem("pinnedMusic");
    pinnedMusicList = JSON.parse(pinnedMusicList);
    let updatedPinnedMusic;
    if (pinnedMusicList.some((item) => item.id === element.id)) {
      updatedPinnedMusic = pinnedMusicList.filter((item) => item.id !== element.id);
    } else {
      updatedPinnedMusic = [...pinnedMusicList, element];
    }
    setPinnedMusic(updatedPinnedMusic);
    localStorage.setItem("pinnedMusic", JSON.stringify(updatedPinnedMusic));
  };

  const handleLike = () => {
    let likedMusicList = localStorage.getItem("likedMusic");
    likedMusicList = JSON.parse(likedMusicList);
    let updatedLikedMusic;
    if (likedMusicList.some((item) => item.id === element.id)) {
      updatedLikedMusic = likedMusicList.filter((item) => item.id !== element.id);
    } else {
      updatedLikedMusic = [...likedMusicList, element];
    }
    setLikedMusic(updatedLikedMusic);
    localStorage.setItem("likedMusic", JSON.stringify(updatedLikedMusic));
  };

  useEffect(() => {
    const localLikedMusic = JSON.parse(localStorage.getItem("likedMusic"));
    setLikedMusic(localLikedMusic);
  }, [setLikedMusic]);

  return (
    <div key={element.id} className="col-lg-3 col-md-6 py-2">
      <div className="card">
        <div className="ratio ratio-1x1 bg-secondary bg-opacity-25">
          <img src={element.album.images[0].url} className="card-img-top" alt="..." />
        </div>

        <div className="card-body">
          <h5 className="card-title d-flex justify-content-between">
            {element.name}
            <div className="add-options d-flex align-items-start">
              {pinnedMusic.some((item) => item.id === element.id) ? (
                <button onClick={handlePin} className="btn btn-outline-dark mx-1">
                  <i className="bi bi-pin-angle-fill"></i>
                </button>
              ) : (
                <button onClick={handlePin} className="btn btn-outline-dark mx-1">
                  <i className="bi bi-pin-angle"></i>
                </button>
              )}
              {likedMusic.some((item) => item.id === element.id) ? (
                <button onClick={handleLike} className="btn btn-outline-dark">
                  <i className="bi bi-heart-fill text-danger"></i>
                </button>
              ) : (
                <button onClick={handleLike} className="btn btn-outline-dark">
                  <i className="bi bi-heart"></i>
                </button>
              )}
            </div>
          </h5>
          <p className="card-text">Artist: {element.album.artists[0].name}</p>
          <p className="card-text">Release date: {element.album.release_date}</p>
          <audio src={element.preview_url} controls className="w-100"></audio>
        </div>
      </div>
    </div>
  );
}

export default Card;