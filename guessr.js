const MAX_ROUNDS = 5;
const SCORE_MAX = 5000;
const SCORE_SCALE_KM = 1492.7;
const EARTH_RADIUS_KM = 6371;
const LANGUAGE_STORAGE_KEY = "wedding_lang";
const switchButtons = document.querySelectorAll(".lang-switch__btn");
const translatable = document.querySelectorAll("[data-i18n]");
const photoControls = document.querySelector("#photoControls");

const translations = {
  en: {
    page_title: "SandraOgBenjaminGuessr",
    back_to_gallery: "← Back to gallery",
    tagline: "Guess where each photo was taken.",
    button_guess: "Guess",
    button_next_round: "Next round",
    button_view_total_results: "View total results",
    button_back_to_total_results: "Back to total results",
    summary_title: "Your Total Score",
    back_to_homepage: "Back to homepage",
    play_again: "Play again",
    hud_round: "Round: {current}/{max}",
    hud_round_review: "Round: {current}/{max} (Review)",
    hud_total: "Total: {score}",
    summary_avg_distance: "Average distance: {distance}",
    round_review_button: "Round {round}: {score} pts",
    result_points_distance: "Points: {score}/5000 · Distance: {distance}",
    status_place_guess: "Click on the map to place your guess.",
    status_guess_placed: "Guess placed. Press Guess to score this round.",
    status_you_were_away: "You were {distance} away. Score: {score}/5000.",
    status_game_finished: "Game finished. Review any round below.",
    status_reviewing_round: "Reviewing round {round}.",
    photo_alt: "Guessr round photo",
    map_aria: "World map for placing guess",
    photo_zoom_controls: "Photo zoom controls",
    zoom_out: "Zoom out",
    zoom_reset: "Reset zoom",
    zoom_in: "Zoom in",
    data_error_missing_data: "Missing photo location data. Check photo-locations.js.",
    data_error_no_photos: "Add coordinates in photo-locations.js (numbers only, no quotes) to start playing.",
    data_error_init_fail: "Could not initialize the map. Check internet access and photo-locations.js."
  },
  no: {
    page_title: "SandraOgBenjaminGuessr",
    back_to_gallery: "← Tilbake til galleri",
    tagline: "Gjett hvor hvert bilde ble tatt.",
    button_guess: "Gjett",
    button_next_round: "Neste runde",
    button_view_total_results: "Se totalresultat",
    button_back_to_total_results: "Tilbake til totalresultat",
    summary_title: "Din totalscore",
    back_to_homepage: "Tilbake til forsiden",
    play_again: "Spill igjen",
    hud_round: "Runde: {current}/{max}",
    hud_round_review: "Runde: {current}/{max} (Gjennomgang)",
    hud_total: "Totalt: {score}",
    summary_avg_distance: "Gjennomsnittlig avstand: {distance}",
    round_review_button: "Runde {round}: {score} poeng",
    result_points_distance: "Poeng: {score}/5000 · Avstand: {distance}",
    status_place_guess: "Klikk på kartet for å plassere gjetningen din.",
    status_guess_placed: "Gjetning plassert. Trykk Gjett for å få poeng for runden.",
    status_you_were_away: "Du var {distance} unna. Poeng: {score}/5000.",
    status_game_finished: "Spillet er ferdig. Se gjennom rundene under.",
    status_reviewing_round: "Viser runde {round}.",
    photo_alt: "Guessr-rundebilde",
    map_aria: "Verdenskart for å plassere gjetning",
    photo_zoom_controls: "Kontroller for bildezoom",
    zoom_out: "Zoom ut",
    zoom_reset: "Tilbakestill zoom",
    zoom_in: "Zoom inn",
    data_error_missing_data: "Mangler bildelokasjoner. Sjekk photo-locations.js.",
    data_error_no_photos: "Legg til koordinater i photo-locations.js (kun tall, uten anførselstegn) for å starte.",
    data_error_init_fail: "Kunne ikke initialisere kartet. Sjekk internettilgang og photo-locations.js."
  }
};

const roundPhoto = document.querySelector("#roundPhoto");
const photoPanel = document.querySelector(".guessr-photo-panel");
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
const photoZoomOutButton = document.querySelector("#photoZoomOutButton");
const photoZoomResetButton = document.querySelector("#photoZoomResetButton");
const photoZoomInButton = document.querySelector("#photoZoomInButton");

const PHOTO_ZOOM_MIN = 1;
const PHOTO_ZOOM_MAX = 4;
const PHOTO_ZOOM_STEP = 0.25;

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
let photoZoom = PHOTO_ZOOM_MIN;
let photoPanX = 0;
let photoPanY = 0;
let isPhotoDragging = false;
let photoDragPointerId = null;
let photoDragStartX = 0;
let photoDragStartY = 0;
let photoPanStartX = 0;
let photoPanStartY = 0;
let photoDragMoved = false;
let currentLang = "en";

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const getStoredLanguage = () => {
  try {
    const value = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return value === "en" || value === "no" ? value : null;
  } catch (_error) {
    return null;
  }
};

const setStoredLanguage = (lang) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (_error) {
    // Ignore storage errors.
  }
};

const interpolate = (template, values = {}) =>
  template.replace(/\{(\w+)\}/g, (_match, key) =>
    values[key] !== undefined ? String(values[key]) : ""
  );

const t = (key, values = {}) => {
  const fallback = translations.en[key] || key;
  const message = (translations[currentLang] && translations[currentLang][key]) || fallback;
  return interpolate(message, values);
};

const getNextButtonLabel = () => {
  if (mode === "review") return t("button_back_to_total_results");
  return currentRoundNumber < MAX_ROUNDS ? t("button_next_round") : t("button_view_total_results");
};

const applyStaticTranslations = () => {
  const dict = translations[currentLang] || translations.en;
  translatable.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (key && dict[key]) {
      element.textContent = dict[key];
    }
  });
  document.documentElement.setAttribute("lang", currentLang === "no" ? "no" : "en");
  switchButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.lang === currentLang));
  if (mapDock) mapDock.setAttribute("aria-label", t("map_aria"));
  if (photoControls) photoControls.setAttribute("aria-label", t("photo_zoom_controls"));
  if (photoZoomOutButton) photoZoomOutButton.setAttribute("aria-label", t("zoom_out"));
  if (photoZoomResetButton) photoZoomResetButton.setAttribute("aria-label", t("zoom_reset"));
  if (photoZoomInButton) photoZoomInButton.setAttribute("aria-label", t("zoom_in"));
};

const refreshLocalizedUi = () => {
  applyStaticTranslations();
  if (roundPhoto) {
    roundPhoto.alt = (currentPhoto && currentPhoto.label) || t("photo_alt");
  }
  updateHud();

  if (mode === "review") {
    const result = sessionResults[currentRoundNumber - 1];
    if (resultSummary && result) {
      resultSummary.textContent = t("result_points_distance", {
        score: result.score,
        distance: formatDistance(result.distanceKm)
      });
    }
    nextButton.textContent = t("button_back_to_total_results");
  } else if (mode === "result") {
    const result = sessionResults[currentRoundNumber - 1];
    if (resultSummary && result) {
      resultSummary.textContent = t("result_points_distance", {
        score: result.score,
        distance: formatDistance(result.distanceKm)
      });
    }
    nextButton.textContent = getNextButtonLabel();
  } else if (mode === "playing") {
    nextButton.textContent = getNextButtonLabel();
    if (!guessButton.disabled && isNumber(guessLat) && isNumber(guessLng)) {
      statusText.textContent = t("status_guess_placed");
    } else {
      statusText.textContent = t("status_place_guess");
    }
  } else if (mode === "summary") {
    nextButton.textContent = t("button_view_total_results");
    statusText.textContent = t("status_game_finished");
  }

  if (finalTotalScore && mode === "summary") {
    finalTotalScore.textContent = `${accumulatedScore} / ${MAX_ROUNDS * SCORE_MAX}`;
  }
  if (finalSummaryLine && mode === "summary") {
    const totalDistance = sessionResults.reduce((sum, result) => sum + result.distanceKm, 0);
    const averageDistance = sessionResults.length ? Math.round(totalDistance / sessionResults.length) : 0;
    finalSummaryLine.textContent = t("summary_avg_distance", { distance: formatDistance(averageDistance) });
  }
  if (roundReviewButtons && mode === "summary") {
    Array.from(roundReviewButtons.children).forEach((button, index) => {
      const result = sessionResults[index];
      if (!result) return;
      button.textContent = t("round_review_button", { round: result.round, score: result.score });
    });
  }
};

const setLanguage = (lang) => {
  if (lang !== "en" && lang !== "no") return;
  currentLang = lang;
  setStoredLanguage(lang);
  refreshLocalizedUi();
};

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

const formatDistance = (distanceKm) => {
  if (!isNumber(distanceKm)) return "0 km";
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${Math.round(distanceKm)} km`;
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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getPhotoPanBounds = () => {
  if (!photoPanel) {
    return { maxX: 0, maxY: 0 };
  }

  const panelWidth = photoPanel.clientWidth;
  const panelHeight = photoPanel.clientHeight;
  if (!panelWidth || !panelHeight) {
    return { maxX: 0, maxY: 0 };
  }

  return {
    maxX: Math.max(0, (panelWidth * (photoZoom - 1)) / 2),
    maxY: Math.max(0, (panelHeight * (photoZoom - 1)) / 2)
  };
};

const setPhotoPan = (nextPanX, nextPanY) => {
  if (!photoPanel) return;
  const bounds = getPhotoPanBounds();
  photoPanX = clamp(nextPanX, -bounds.maxX, bounds.maxX);
  photoPanY = clamp(nextPanY, -bounds.maxY, bounds.maxY);
  photoPanel.style.setProperty("--photo-pan-x", `${photoPanX}px`);
  photoPanel.style.setProperty("--photo-pan-y", `${photoPanY}px`);
};

const resetPhotoPan = () => {
  setPhotoPan(0, 0);
};

const getPhotoAnchorOffset = (clientX, clientY) => {
  if (!photoPanel || !Number.isFinite(clientX) || !Number.isFinite(clientY)) {
    return null;
  }
  const rect = photoPanel.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: clientX - rect.left - rect.width / 2,
    y: clientY - rect.top - rect.height / 2
  };
};

const getAnchoredPan = (nextZoom, anchorOffset) => {
  if (!anchorOffset || photoZoom <= 0 || nextZoom <= 0) {
    return { x: photoPanX, y: photoPanY };
  }
  const zoomRatio = nextZoom / photoZoom;
  return {
    x: (1 - zoomRatio) * anchorOffset.x + zoomRatio * photoPanX,
    y: (1 - zoomRatio) * anchorOffset.y + zoomRatio * photoPanY
  };
};

const setPhotoZoom = (nextZoom, options = {}) => {
  if (!photoPanel || !roundPhoto) return;
  const { anchorClientX, anchorClientY } = options;
  const clampedZoom = clamp(nextZoom, PHOTO_ZOOM_MIN, PHOTO_ZOOM_MAX);
  const anchorOffset = getPhotoAnchorOffset(anchorClientX, anchorClientY);
  const anchoredPan = getAnchoredPan(clampedZoom, anchorOffset);
  photoZoom = clampedZoom;
  photoPanel.style.setProperty("--photo-zoom", String(photoZoom));
  photoPanel.classList.toggle("is-photo-zoomed", photoZoom > PHOTO_ZOOM_MIN);
  if (photoZoom > PHOTO_ZOOM_MIN && (mode === "result" || mode === "review")) {
    photoPanel.classList.add("is-expanded-photo");
  }
  photoPanel.classList.remove("is-photo-dragging");
  isPhotoDragging = false;
  photoDragPointerId = null;
  if (photoZoomResetButton) {
    photoZoomResetButton.textContent = `${Math.round(photoZoom * 100)}%`;
  }
  if (photoZoomOutButton) {
    photoZoomOutButton.disabled = photoZoom <= PHOTO_ZOOM_MIN;
  }
  if (photoZoomInButton) {
    photoZoomInButton.disabled = photoZoom >= PHOTO_ZOOM_MAX;
  }
  setPhotoPan(anchoredPan.x, anchoredPan.y);
};

const resetPhotoZoom = () => {
  resetPhotoPan();
  setPhotoZoom(PHOTO_ZOOM_MIN);
};

const syncResultPhotoPanelOrientation = () => {
  if (!photoPanel || !roundPhoto) return;
  if (!roundPhoto.naturalWidth || !roundPhoto.naturalHeight) return;
  const isPortrait = roundPhoto.naturalHeight > roundPhoto.naturalWidth;
  photoPanel.classList.toggle("is-portrait-photo", isPortrait);
  setPhotoPan(photoPanX, photoPanY);
};

const setDataError = (message) => {
  statusText.textContent = message;
  guessButton.disabled = true;
  nextButton.disabled = true;
};

const updateHud = () => {
  if (mode === "review") {
    roundCount.textContent = t("hud_round_review", { current: currentRoundNumber, max: MAX_ROUNDS });
  } else {
    roundCount.textContent = t("hud_round", { current: currentRoundNumber, max: MAX_ROUNDS });
  }
  totalScore.textContent = t("hud_total", { score: accumulatedScore });
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
  if (photoPanel) {
    photoPanel.classList.remove("is-expanded-photo");
  }
  resetPhotoZoom();

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
    finalSummaryLine.textContent = t("summary_avg_distance", { distance: formatDistance(averageDistance) });
  }

  if (roundReviewButtons) {
    roundReviewButtons.innerHTML = "";
    sessionResults.forEach((result, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "guessr-round-review-btn";
      button.textContent = t("round_review_button", { round: result.round, score: result.score });
      button.addEventListener("click", () => showRoundReview(index));
      roundReviewButtons.appendChild(button);
    });
  }

  statusText.textContent = t("status_game_finished");
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
  if (photoPanel) {
    photoPanel.classList.remove("is-expanded-photo");
  }

  if (totalResultsPanel) {
    totalResultsPanel.hidden = true;
  }

  currentPhoto = result.photo;
  roundPhoto.src = result.photo.src;
  roundPhoto.alt = result.photo.label || t("photo_alt");
  resetPhotoZoom();

  clearRoundMarkers();
  guessMapMarker = L.marker([result.guessLat, result.guessLng], { icon: markerIcon("guess-pin") }).addTo(map);
  answerMapMarker = L.marker([result.answerLat, result.answerLng], { icon: markerIcon("answer-pin") }).addTo(map);
  map.fitBounds(
    [
      [result.guessLat, result.guessLng],
      [result.answerLat, result.answerLng]
    ],
    { padding: [35, 35], maxZoom: 19 }
  );

  if (resultSummary) {
    resultSummary.textContent = t("result_points_distance", {
      score: result.score,
      distance: formatDistance(result.distanceKm)
    });
  }

  currentRoundNumber = result.round;
  updateHud();
  statusText.textContent = t("status_reviewing_round", { round: result.round });

  guessButton.disabled = true;
  nextButton.disabled = false;
  nextButton.textContent = t("button_back_to_total_results");

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
  roundPhoto.alt = currentPhoto.label || t("photo_alt");
  if (photoPanel) {
    photoPanel.classList.remove("is-expanded-photo");
  }
  resetPhotoZoom();

  guessLat = null;
  guessLng = null;

  if (resultSummary) {
    resultSummary.textContent = "";
  }

  statusText.textContent = t("status_place_guess");
  guessButton.disabled = true;
  nextButton.disabled = true;
  nextButton.textContent = getNextButtonLabel();
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

  statusText.textContent = t("status_guess_placed");
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
    { padding: [35, 35], maxZoom: 19 }
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
    resultSummary.textContent = t("result_points_distance", {
      score: roundScore,
      distance: formatDistance(distanceKm)
    });
  }
  statusText.textContent = t("status_you_were_away", {
    distance: formatDistance(distanceKm),
    score: roundScore
  });

  updateHud();
  guessButton.disabled = true;

  if (currentRoundNumber < MAX_ROUNDS) {
    nextButton.textContent = t("button_next_round");
    nextButton.disabled = false;
  } else {
    nextButton.textContent = t("button_view_total_results");
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
    maxZoom: 19,
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
      setDataError(t("data_error_missing_data"));
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
      setDataError(t("data_error_no_photos"));
      return;
    }

    initMap();
    restartGame();
  } catch (error) {
    setDataError(t("data_error_init_fail"));
    console.error(error);
  }
};

switchButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

guessButton.addEventListener("click", submitGuess);
nextButton.addEventListener("click", handleNextButton);
playAgainButton.addEventListener("click", restartGame);
roundPhoto.addEventListener("load", syncResultPhotoPanelOrientation);
roundPhoto.addEventListener("wheel", (event) => {
  event.preventDefault();
  const direction = event.deltaY < 0 ? 1 : -1;
  setPhotoZoom(photoZoom + direction * PHOTO_ZOOM_STEP, {
    anchorClientX: event.clientX,
    anchorClientY: event.clientY
  });
}, { passive: false });

if (photoPanel) {
  photoPanel.addEventListener("pointerdown", (event) => {
    if (photoZoom <= PHOTO_ZOOM_MIN) return;
    if (event.target instanceof HTMLElement && event.target.closest(".guessr-photo-zoom-btn")) return;
    isPhotoDragging = true;
    photoDragMoved = false;
    photoDragPointerId = event.pointerId;
    photoDragStartX = event.clientX;
    photoDragStartY = event.clientY;
    photoPanStartX = photoPanX;
    photoPanStartY = photoPanY;
    photoPanel.classList.add("is-photo-dragging");
    photoPanel.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  photoPanel.addEventListener("pointermove", (event) => {
    if (!isPhotoDragging || event.pointerId !== photoDragPointerId) return;
    const deltaX = event.clientX - photoDragStartX;
    const deltaY = event.clientY - photoDragStartY;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      photoDragMoved = true;
    }
    setPhotoPan(photoPanStartX + deltaX, photoPanStartY + deltaY);
  });

  const stopPhotoDrag = (event) => {
    if (!isPhotoDragging || event.pointerId !== photoDragPointerId) return;
    isPhotoDragging = false;
    photoDragPointerId = null;
    photoPanel.classList.remove("is-photo-dragging");
    if (photoPanel.hasPointerCapture(event.pointerId)) {
      photoPanel.releasePointerCapture(event.pointerId);
    }
  };

  photoPanel.addEventListener("pointerup", stopPhotoDrag);
  photoPanel.addEventListener("pointercancel", stopPhotoDrag);
  photoPanel.addEventListener("transitionend", (event) => {
    if (event.propertyName === "width" || event.propertyName === "height") {
      setPhotoPan(photoPanX, photoPanY);
    }
  });

  photoPanel.addEventListener("click", (event) => {
    if (mode !== "result" && mode !== "review") return;
    if (event.target instanceof HTMLElement && event.target.closest(".guessr-photo-zoom-btn")) return;
    if (photoDragMoved) {
      photoDragMoved = false;
      return;
    }
    if (photoZoom > PHOTO_ZOOM_MIN) return;
    photoPanel.classList.toggle("is-expanded-photo");
  });
}

if (photoZoomOutButton) {
  photoZoomOutButton.addEventListener("click", () => setPhotoZoom(photoZoom - PHOTO_ZOOM_STEP));
}

if (photoZoomResetButton) {
  photoZoomResetButton.addEventListener("click", resetPhotoZoom);
}

if (photoZoomInButton) {
  photoZoomInButton.addEventListener("click", () => setPhotoZoom(photoZoom + PHOTO_ZOOM_STEP));
}

window.addEventListener("resize", () => setPhotoPan(photoPanX, photoPanY));

const browserLang = (navigator.language || "").toLowerCase();
const isNorwegian = browserLang.startsWith("no") || browserLang.startsWith("nb") || browserLang.startsWith("nn");
setLanguage(getStoredLanguage() || (isNorwegian ? "no" : "en"));

resetPhotoZoom();

init();
