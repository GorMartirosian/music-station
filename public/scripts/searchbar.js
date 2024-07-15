export function musicSearchEvent() {
    const searchForm = document.getElementById("music-search-form");
    const searchResultsContainer = document.getElementById(
      "search-results-container"
    );
    searchForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const searchInput = document.getElementById("music-input");
      const searchQuery = searchInput.value;
      const response = await fetch(
        `/search-music?musicSearchText=${encodeURIComponent(searchQuery)}`
      );
      const searchResults = await response.json();
      searchResultsContainer.innerHTML = "";
      insertSearchResults(searchResultsContainer, searchResults);
    });
  }
  
  function insertSearchResults(container, songs) {
    songs.forEach((song) => {
      container.appendChild(makeSongElement(song));
    });
  }
  
  function makeSongElement(song) {
    let resultElement = document.createElement("div");
    resultElement.classList.add("song-row");
    const playButton = createPlayButton(song.id);
    const nameElement = createRowNameElement(song.name);
    let genreElement = createRowNameElement(song.genre);
    let downloadButton = createDownloadButton(song.name, song.id);
    resultElement.appendChild(playButton);
    resultElement.appendChild(nameElement);
    resultElement.appendChild(genreElement);
    resultElement.appendChild(downloadButton);
    return resultElement;
  }
  
  function createPlayButton(songId) {
    let playButton = document.createElement("button");
    playButton.innerHTML = "Play";
    playButton.classList.add("song-inner-elm");
    playButton.addEventListener("click", async function () {
      const response = await fetch(`/search-music/${songId}`);
      const audio = document.createElement("audio");
      const blob = await response.blob();
      audio.src = URL.createObjectURL(blob);
      document.getElementsByClassName("music-player")[0].innerHTML = "";
      audio.controls = true;
      document.getElementsByClassName("music-player")[0].appendChild(audio);
      audio.play();
    });
  
    return playButton;
  }
  
  function createRowNameElement(name) {
    let nameElement = document.createElement("div");
    nameElement.classList.add("song-inner-elm");
    nameElement.innerText = name;
    return nameElement;
  }
  
  function createDownloadButton(songName, songId) {
    let downloadLink = document.createElement("a");
    downloadLink.innerHTML = "Download";
    downloadLink.classList.add("song-inner-elm");
    downloadLink.download = songName + ".mp3";
    downloadLink.href = `/search-music/${songId}`;
    return downloadLink;
  }