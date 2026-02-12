const MAX_ROUNDS = 5;
const SCORE_MAX = 5000;
const SCORE_SCALE_KM = 1492.7;
const EARTH_RADIUS_KM = 6371;

const roundPhoto = document.querySelector("#roundPhoto");
const guessrStage = document.querySelector("#guessrStage");
const resultSummary = document.querySelector("#resultSummary");
const roundCount = document.querySelector("#roundCount");
const totalScore = document.querySelector("#totalScore");
const mapSurface = document.querySelector("#mapSurface");
const mapDock = document.querySelector("#mapDock");
const statusText = document.querySelector("#statusText");
const guessButton = document.querySelector("#guessButton");
const nextButton = document.querySelector("#nextButton");
const totalResultsPanel = document.querySelector("#totalResultsPanel");
const finalTotalScore = document.querySelector("#finalTotalScore");
const finalSummaryLine = document.querySelector("#finalSummaryLine");
const roundReviewButtons = document.querySelector("#roundReviewButtons");
const playAgainButton = document.querySelector("#playAgainButton");

let map = null;
let guessMapMarker = null;
let answerMapMarker = null;

let mode = "playing";
let currentRoundNumber = 1;
let accumulatedScore = 0;
let currentPhoto = null;
let remainingPhotos = [];
let playablePhotos = [];
let sessionResults = [];
let guessLat = null;
let guessLng = null;

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const haversineDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const geoguessrScore = (distanceKm) => {
  const raw = SCORE_MAX * Math.exp(-distanceKm / SCORE_SCALE_KM);
  return Math.max(0, Math.min(SCORE_MAX, Math.round(raw)));
};

const markerIcon = (className) =>
  L.divIcon({
    className,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

const refreshMapSize = () => {
  if (!map) return;
  window.requestAnimationFrame(() => map.invalidateSize());
};

const clearRoundMarkers = () => {
  if (guessMapMarker) {
    map.removeLayer(guessMapMarker);
    guessMapMarker = null;
  }

  if (answerMapMarker) {
    map.removeLayer(answerMapMarker);
    answerMapMarker = null;
  }
};

const pickRandomPhoto = () => {
  if (!remainingPhotos.length) {
    remainingPhotos = [...playablePhotos];
  }

  const index = Math.floor(Math.random() * remainingPhotos.length);
  return remainingPhotos.splice(index, 1)[0];
};

const setDataError = (message) => {
  statusText.textContent = message;
  guessButton.disabled = true;
  nextButton.disabled = true;
};

const updateHud = () => {
  roundCount.textContent = `Round: ${currentRoundNumber}/${MAX_ROUNDS}`;
  totalScore.textContent = `Total: ${accumulatedScore}`;
};

const clearStageModes = () => {
  if (!guessrStage) return;
  guessrStage.classList.remove("is-result");
  guessrStage.classList.remove("is-summary");
};

const showTotalResults = () => {
  mode = "summary";
  clearStageModes();
  if (guessrStage) {
    guessrStage.classList.add("is-summary");
  }

  if (totalResultsPanel) {
    totalResultsPanel.hidden = false;
  }

  if (resultSummary) {
    resultSummary.textContent = "";
  }

  const totalDistance = sessionResults.reduce((sum, result) => sum + result.distanceKm, 0);
  const averageDistance = sessionResults.length ? Math.round(totalDistance / sessionResults.length) : 0;

  if (finalTotalScore) {
    finalTotalScore.textContent = `${accumulatedScore} / ${MAX_ROUNDS * SCORE_MAX}`;
  }

  if (finalSummaryLine) {
    finalSummaryLine.textContent = `Average distance: ${averageDistance} km`;
  }

  if (roundReviewButtons) {
    roundReviewButtons.innerHTML = "";
    sessionResults.forEach((result, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "guessr-round-review-btn";
      button.textContent = `Round ${result.round}: ${result.score} pts`;
      button.addEventListener("click", () => showRoundReview(index));
      roundReviewButtons.appendChild(button);
    });
  }

  statusText.textContent = "Game finished. Review any round below.";
  guessButton.disabled = true;
  nextButton.disabled = true;
};

const showRoundReview = (index) => {
  const result = sessionResults[index];
  if (!result) return;

  mode = "review";
  clearStageModes();
  if (guessrStage) {
    guessrStage.classList.add("is-result");
  }

  if (totalResultsPanel) {
    totalResultsPanel.hidden = true;
  }

  currentPhoto = result.photo;
  roundPhoto.src = result.photo.src;
  roundPhoto.alt = result.photo.label || "Guessr round photo";

  clearRoundMarkers();
  guessMapMarker = L.marker([result.guessLat, result.guessLng], { icon: markerIcon("guess-pin") }).addTo(map);
  answerMapMarker = L.marker([result.answerLat, result.answerLng], { icon: markerIcon("answer-pin") }).addTo(map);
  map.fitBounds(
    [
      [result.guessLat, result.guessLng],
      [result.answerLat, result.answerLng]
    ],
    { padding: [35, 35], maxZoom: 6 }
  );

  if (resultSummary) {
    resultSummary.textContent = `Points: ${result.score}/5000 · Distance: ${Math.round(result.distanceKm)} km`;
  }

  roundCount.textContent = `Round: ${result.round}/${MAX_ROUNDS} (Review)`;
  totalScore.textContent = `Total: ${accumulatedScore}`;
  statusText.textContent = `Reviewing round ${result.round}.`;

  guessButton.disabled = true;
  nextButton.disabled = false;
  nextButton.textContent = "Back to total results";

  setTimeout(refreshMapSize, 20);
  setTimeout(refreshMapSize, 260);
};

const startRound = () => {
  mode = "playing";
  clearStageModes();

  if (totalResultsPanel) {
    totalResultsPanel.hidden = true;
  }

  clearRoundMarkers();
  currentPhoto = pickRandomPhoto();
  roundPhoto.src = currentPhoto.src;
  roundPhoto.alt = currentPhoto.label || "Guessr round photo";

  guessLat = null;
  guessLng = null;

  if (resultSummary) {
    resultSummary.textContent = "";
  }

  statusText.textContent = "Click on the map to place your guess.";
  guessButton.disabled = true;
  nextButton.disabled = true;
  nextButton.textContent = currentRoundNumber < MAX_ROUNDS ? "Next round" : "View total results";
  updateHud();

  map.setView([20, 0], 2);
  setTimeout(refreshMapSize, 20);
};

const placeGuess = (lat, lng) => {
  if (mode !== "playing") return;

  guessLat = lat;
  guessLng = lng;

  if (guessMapMarker) {
    guessMapMarker.setLatLng([lat, lng]);
  } else {
    guessMapMarker = L.marker([lat, lng], { icon: markerIcon("guess-pin") }).addTo(map);
  }

  statusText.textContent = "Guess placed. Press Guess to score this round.";
  guessButton.disabled = false;
};

const submitGuess = () => {
  if (mode !== "playing" || !currentPhoto || !isNumber(guessLat) || !isNumber(guessLng)) return;

  const distanceKm = haversineDistanceKm(guessLat, guessLng, currentPhoto.lat, currentPhoto.lng);
  const roundScore = geoguessrScore(distanceKm);

  accumulatedScore += roundScore;
  mode = "result";

  if (guessrStage) {
    guessrStage.classList.add("is-result");
  }

  answerMapMarker = L.marker([currentPhoto.lat, currentPhoto.lng], { icon: markerIcon("answer-pin") }).addTo(map);
  map.fitBounds(
    [
      [guessLat, guessLng],
      [currentPhoto.lat, currentPhoto.lng]
    ],
    { padding: [35, 35], maxZoom: 6 }
  );

  const roundResult = {
    round: currentRoundNumber,
    photo: currentPhoto,
    guessLat,
    guessLng,
    answerLat: currentPhoto.lat,
    answerLng: currentPhoto.lng,
    distanceKm,
    score: roundScore
  };
  sessionResults[currentRoundNumber - 1] = roundResult;

  if (resultSummary) {
    resultSummary.textContent = `Points: ${roundScore}/5000 · Distance: ${Math.round(distanceKm)} km`;
  }
  statusText.textContent = `You were ${Math.round(distanceKm)} km away. Score: ${roundScore}/5000.`;

  totalScore.textContent = `Total: ${accumulatedScore}`;
  guessButton.disabled = true;

  if (currentRoundNumber < MAX_ROUNDS) {
    nextButton.textContent = "Next round";
    nextButton.disabled = false;
  } else {
    nextButton.textContent = "View total results";
    nextButton.disabled = true;
    setTimeout(showTotalResults, 900);
  }

  setTimeout(refreshMapSize, 20);
  setTimeout(refreshMapSize, 300);
};

const handleNextButton = () => {
  if (mode === "result") {
    currentRoundNumber += 1;
    startRound();
    return;
  }

  if (mode === "review") {
    showTotalResults();
  }
};

const restartGame = () => {
  currentRoundNumber = 1;
  accumulatedScore = 0;
  sessionResults = [];
  remainingPhotos = [...playablePhotos];
  startRound();
};

const setupMapDockBehavior = () => {
  if (!mapDock) return;

  const expandDock = () => {
    if (mode === "summary") return;
    mapDock.classList.add("is-expanded");
    setTimeout(refreshMapSize, 260);
  };

  const collapseDock = () => {
    mapDock.classList.remove("is-expanded");
    setTimeout(refreshMapSize, 260);
  };

  mapDock.addEventListener("mouseenter", expandDock);
  mapDock.addEventListener("mouseleave", collapseDock);
  mapDock.addEventListener("focusin", expandDock);
  mapDock.addEventListener("focusout", collapseDock);
  mapDock.addEventListener("transitionend", (event) => {
    if (event.propertyName === "width" || event.propertyName === "height") {
      refreshMapSize();
    }
  });
};

const initMap = () => {
  if (!window.L) {
    throw new Error("Leaflet library failed to load.");
  }

  map = L.map(mapSurface, {
    worldCopyJump: true,
    minZoom: 2,
    maxZoom: 6,
    zoomControl: true
  }).setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  map.on("click", (event) => {
    placeGuess(event.latlng.lat, event.latlng.lng);
  });

  setupMapDockBehavior();
  window.addEventListener("resize", refreshMapSize);
};

const init = () => {
  try {
    const data = window.PHOTO_LOCATIONS;
    if (!data || typeof data !== "object") {
      setDataError("Missing photo location data. Check photo-locations.js.");
      return;
    }

    const photos = Array.isArray(data.photos) ? data.photos : [];

    playablePhotos = photos.filter(
      (photo) =>
        photo &&
        typeof photo.src === "string" &&
        isNumber(photo.lat) &&
        isNumber(photo.lng)
    );

    if (!playablePhotos.length) {
      setDataError("Add coordinates in photo-locations.js (numbers only, no quotes) to start playing.");
      return;
    }

    initMap();
    restartGame();
  } catch (error) {
    setDataError("Could not initialize the map. Check internet access and photo-locations.js.");
    console.error(error);
  }
};

guessButton.addEventListener("click", submitGuess);
nextButton.addEventListener("click", handleNextButton);
playAgainButton.addEventListener("click", restartGame);

init();
