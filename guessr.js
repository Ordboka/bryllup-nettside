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
    button_place_guess: "Click map to place guess",
    button_next_round: "Next round",
    button_view_total_results: "View total results",
    button_back_to_total_results: "Back to total results",
    summary_title: "Your Total Score",
    summary_share_prompt: "We would love to know how you did. Copy your results and share them with us.",
    button_copy_results: "Copy results",
    button_results_copied: "✅ Results copied",
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
    status_results_copied: "Results copied to clipboard.",
    status_results_copy_failed: "Could not copy results. Please try again.",
    photo_alt: "Guessr round photo",
    map_aria: "World map for placing guess",
    photo_zoom_controls: "Photo zoom controls",
    zoom_out: "Zoom out",
    zoom_reset: "Reset zoom",
    zoom_in: "Zoom in",
    tooltip_guess: "Your guess",
    tooltip_answer: "Answer",
    summary_copy_title: "SandraOgBenjaminGuessr Results",
    summary_copy_round_label: "Round {round}",
    summary_copy_total: "Total",
    summary_copy_avg_distance: "Average distance",
    data_error_missing_data: "Missing photo location data. Check photo-locations.js.",
    data_error_no_photos: "Add coordinates in photo-locations.js (numbers only, no quotes) to start playing.",
    data_error_init_fail: "Could not initialize the map. Check internet access and photo-locations.js."
  },
  no: {
    page_title: "SandraOgBenjaminGuessr",
    back_to_gallery: "← Tilbake til galleri",
    tagline: "Gjett hvor hvert bilde ble tatt.",
    button_guess: "Gjett",
    button_place_guess: "Klikk kartet for å plassere gjett",
    button_next_round: "Neste runde",
    button_view_total_results: "Se totalresultat",
    button_back_to_total_results: "Tilbake til totalresultat",
    summary_title: "Din totalscore",
    summary_share_prompt: "Vi vil gjerne vite hvordan det gikk. Kopier resultatet ditt og del det med oss.",
    button_copy_results: "Kopier resultat",
    button_results_copied: "✅ Resultat kopiert",
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
    status_results_copied: "Resultatene er kopiert til utklippstavlen.",
    status_results_copy_failed: "Kunne ikke kopiere resultatene. Prøv igjen.",
    photo_alt: "Guessr-rundebilde",
    map_aria: "Verdenskart for å plassere gjetning",
    photo_zoom_controls: "Kontroller for bildezoom",
    zoom_out: "Zoom ut",
    zoom_reset: "Tilbakestill zoom",
    zoom_in: "Zoom inn",
    tooltip_guess: "Ditt gjett",
    tooltip_answer: "Svar",
    summary_copy_title: "SandraOgBenjaminGuessr Resultat",
    summary_copy_round_label: "Runde {round}",
    summary_copy_total: "Totalt",
    summary_copy_avg_distance: "Gjennomsnittlig avstand",
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
const copyResultsButton = document.querySelector("#copyResultsButton");
const photoZoomOutButton = document.querySelector("#photoZoomOutButton");
const photoZoomResetButton = document.querySelector("#photoZoomResetButton");
const photoZoomInButton = document.querySelector("#photoZoomInButton");

const PHOTO_ZOOM_MIN = 1;
const PHOTO_ZOOM_MAX = 4;
const PHOTO_ZOOM_STEP = 0.25;
const PHOTO_BASE_DRAG_PAN_RATIO = 0.18;
const MOBILE_LAYOUT_QUERY = "(max-width: 920px)";

let map = null;
let guessMapMarker = null;
let answerMapMarker = null;
let answerRevealLine = null;
let answerRevealAnimationFrame = null;
let confettiLayer = null;

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
let mobileLayoutMediaQuery = null;
let hasCopiedResults = false;

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

const setStatusMessage = (message) => {
  if (!statusText) return;
  statusText.textContent = message;
};

const updateGuessButtonLabel = () => {
  if (!guessButton) return;
  if (mode !== "playing") {
    guessButton.textContent = t("button_guess");
    return;
  }
  const hasPlacedGuess = isNumber(guessLat) && isNumber(guessLng) && !guessButton.disabled;
  guessButton.textContent = hasPlacedGuess ? t("button_guess") : t("button_place_guess");
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

const updateCopyResultsButtonState = () => {
  if (!copyResultsButton) return;
  copyResultsButton.classList.toggle("is-copied", hasCopiedResults);
  copyResultsButton.textContent = hasCopiedResults
    ? t("button_results_copied")
    : t("button_copy_results");
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
    updateGuessButtonLabel();
  } else if (mode === "summary") {
    nextButton.textContent = t("button_view_total_results");
    setStatusMessage(t("status_game_finished"));
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
  updateCopyResultsButtonState();
  updateActionButtons();
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

const buildResultsCopyText = () => {
  const sortedResults = sessionResults
    .filter(Boolean)
    .slice()
    .sort((a, b) => a.round - b.round);
  if (!sortedResults.length) return "";

  const roundEmoji = {
    1: "1️⃣",
    2: "2️⃣",
    3: "3️⃣",
    4: "4️⃣",
    5: "5️⃣"
  };
  const totalDistance = sortedResults.reduce((sum, result) => sum + result.distanceKm, 0);
  const averageDistance = Math.round(totalDistance / sortedResults.length);
  const totalLabel = t("summary_copy_total");
  const avgLabel = t("summary_copy_avg_distance");
  const maxTotalScore = MAX_ROUNDS * SCORE_MAX;

  const lines = [
    `📋 ${t("summary_copy_title")}`,
    "",
    ...sortedResults.map((result) =>
      `${roundEmoji[result.round] || "📍"} ${result.score}/${SCORE_MAX} • ${formatDistance(result.distanceKm)}`
    ),
    "",
    `🏆 ${totalLabel}: ${accumulatedScore}/${maxTotalScore}`,
    `📏 ${avgLabel}: ${formatDistance(averageDistance)}`
  ];

  return lines.join("\n");
};

const copyTextToClipboard = async (text) => {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      // Fallback below.
    }
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  helper.setSelectionRange(0, helper.value.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (_error) {
    copied = false;
  }
  helper.remove();
  return copied;
};

const normalizeLng = (lng) => {
  const normalized = ((lng + 180) % 360 + 360) % 360 - 180;
  return normalized === -180 ? 180 : normalized;
};

const wrapLngNear = (targetLng, referenceLng) => {
  const reference = normalizeLng(referenceLng);
  let wrapped = normalizeLng(targetLng);
  while (wrapped - reference > 180) wrapped -= 360;
  while (wrapped - reference < -180) wrapped += 360;
  return wrapped;
};

const getDisplayPoints = (guessLatValue, guessLngValue, answerLatValue, answerLngValue) => {
  const guessLngWrapped = normalizeLng(guessLngValue);
  const answerLngWrapped = wrapLngNear(answerLngValue, guessLngWrapped);
  return {
    guess: [guessLatValue, guessLngWrapped],
    answer: [answerLatValue, answerLngWrapped]
  };
};

const markerIcon = (className) => {
  const isAnswer = className === "answer-pin";
  const size = isAnswer ? 34 : 16;
  const anchor = size / 2;
  return L.divIcon({
    className,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor]
  });
};

const createGuessMarker = (latlng) =>
  L.marker(latlng, { icon: markerIcon("guess-pin") })
    .bindTooltip(t("tooltip_guess"), { direction: "top", offset: [0, -8] });

const createAnswerMarker = (latlng, options = {}) => {
  const { opacity = 1 } = options;
  return L.marker(latlng, { icon: markerIcon("answer-pin"), opacity })
    .bindTooltip(t("tooltip_answer"), { direction: "top", offset: [0, -12] });
};

const ensureConfettiLayer = () => {
  if (confettiLayer && confettiLayer.isConnected) return confettiLayer;
  if (!guessrStage) return null;
  confettiLayer = document.createElement("div");
  confettiLayer.className = "guessr-confetti-layer";
  guessrStage.appendChild(confettiLayer);
  return confettiLayer;
};

const launchPerfectScoreConfetti = () => {
  const layer = ensureConfettiLayer();
  if (!layer) return;

  const colors = ["#f4efe3", "#d9a441", "#e94e3d", "#3ca157", "#84a06f"];
  const pieceCount = 56;

  for (let index = 0; index < pieceCount; index += 1) {
    const piece = document.createElement("span");
    piece.className = "guessr-confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    piece.style.setProperty("--confetti-rotate", `${Math.random() * 360}deg`);
    piece.style.setProperty("--confetti-drift", `${(Math.random() - 0.5) * 180}px`);
    piece.style.animationDelay = `${Math.random() * 120}ms`;
    piece.style.animationDuration = `${1150 + Math.random() * 700}ms`;
    layer.appendChild(piece);
    window.setTimeout(() => piece.remove(), 2100);
  }
};

const refreshMapSize = () => {
  if (!map) return;
  window.requestAnimationFrame(() => map.invalidateSize());
};

const scheduleMapResize = () => {
  setTimeout(refreshMapSize, 20);
  setTimeout(refreshMapSize, 260);
  setTimeout(refreshMapSize, 700);
};

const isMobileLayout = () => Boolean(mobileLayoutMediaQuery && mobileLayoutMediaQuery.matches);

const setMobileMapFocus = (isFocused) => {
  if (!guessrStage || !mapDock) return;
  if (mode !== "playing" || !isMobileLayout()) {
    guessrStage.classList.remove("is-mobile-map-focused");
    mapDock.classList.remove("is-expanded");
    return;
  }

  guessrStage.classList.toggle("is-mobile-map-focused", isFocused);
  mapDock.classList.toggle("is-expanded", isFocused);
  scheduleMapResize();
};

const clearRoundMarkers = () => {
  if (answerRevealAnimationFrame) {
    window.cancelAnimationFrame(answerRevealAnimationFrame);
    answerRevealAnimationFrame = null;
  }

  if (answerRevealLine) {
    map.removeLayer(answerRevealLine);
    answerRevealLine = null;
  }

  if (guessMapMarker) {
    map.removeLayer(guessMapMarker);
    guessMapMarker = null;
  }

  if (answerMapMarker) {
    map.removeLayer(answerMapMarker);
    answerMapMarker = null;
  }
};

const drawAnswerRevealLine = (start, end, options = {}) => {
  if (!map) return;
  const { animate = true, durationMs = 650, onComplete = null } = options;

  if (answerRevealAnimationFrame) {
    window.cancelAnimationFrame(answerRevealAnimationFrame);
    answerRevealAnimationFrame = null;
  }
  if (answerRevealLine) {
    map.removeLayer(answerRevealLine);
    answerRevealLine = null;
  }

  answerRevealLine = L.polyline([start, end], {
    color: "#d9a441",
    weight: 4,
    opacity: 0.98,
    dashArray: "4 8",
    lineCap: "round"
  }).addTo(map);
  answerRevealLine.bringToBack();

  if (!animate) {
    if (typeof onComplete === "function") onComplete();
    return;
  }

  answerRevealLine.setLatLngs([start, start]);
  const startTime = performance.now();
  const tick = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    const eased = 1 - Math.pow(1 - progress, 3);
    const lat = start[0] + (end[0] - start[0]) * eased;
    const lng = start[1] + (end[1] - start[1]) * eased;
    answerRevealLine.setLatLngs([start, [lat, lng]]);

    if (progress < 1) {
      answerRevealAnimationFrame = window.requestAnimationFrame(tick);
    } else {
      answerRevealAnimationFrame = null;
      if (typeof onComplete === "function") onComplete();
    }
  };

  answerRevealAnimationFrame = window.requestAnimationFrame(tick);
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

  if (photoZoom <= PHOTO_ZOOM_MIN) {
    return {
      maxX: panelWidth * PHOTO_BASE_DRAG_PAN_RATIO,
      maxY: panelHeight * PHOTO_BASE_DRAG_PAN_RATIO
    };
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
  setPhotoPan(photoPanX, photoPanY);
};

const setDataError = (message) => {
  setStatusMessage(message);
  guessButton.disabled = true;
  nextButton.disabled = true;
  updateActionButtons();
};

const updateHud = () => {
  if (mode === "review") {
    roundCount.textContent = t("hud_round_review", { current: currentRoundNumber, max: MAX_ROUNDS });
  } else {
    roundCount.textContent = t("hud_round", { current: currentRoundNumber, max: MAX_ROUNDS });
  }
  totalScore.textContent = t("hud_total", { score: accumulatedScore });
};

const updateActionButtons = () => {
  if (!guessButton || !nextButton) return;

  if (mode === "summary") {
    guessButton.hidden = true;
    nextButton.hidden = true;
    return;
  }

  if (mode === "playing") {
    guessButton.hidden = false;
    nextButton.hidden = true;
    updateGuessButtonLabel();
    return;
  }

  if (mode === "result" || mode === "review") {
    guessButton.hidden = true;
    nextButton.hidden = false;
    return;
  }

  guessButton.hidden = true;
  nextButton.hidden = true;
  updateGuessButtonLabel();
};

const clearStageModes = () => {
  if (!guessrStage) return;
  guessrStage.classList.remove("is-result");
  guessrStage.classList.remove("is-summary");
  guessrStage.classList.remove("is-mobile-map-focused");
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

  setStatusMessage(t("status_game_finished"));
  guessButton.disabled = true;
  nextButton.disabled = true;
  updateActionButtons();
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
  const displayPoints = getDisplayPoints(result.guessLat, result.guessLng, result.answerLat, result.answerLng);
  guessMapMarker = createGuessMarker(displayPoints.guess).addTo(map);
  answerMapMarker = createAnswerMarker(displayPoints.answer).addTo(map);
  drawAnswerRevealLine(displayPoints.guess, displayPoints.answer, { animate: false });
  map.fitBounds(
    [displayPoints.guess, displayPoints.answer],
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
  setStatusMessage(t("status_reviewing_round", { round: result.round }));

  guessButton.disabled = true;
  nextButton.disabled = false;
  nextButton.textContent = t("button_back_to_total_results");
  updateActionButtons();

  scheduleMapResize();
};

const startRound = () => {
  mode = "playing";
  clearStageModes();
  setMobileMapFocus(false);

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

  setStatusMessage(t("status_place_guess"));
  guessButton.disabled = true;
  nextButton.disabled = true;
  nextButton.textContent = getNextButtonLabel();
  updateHud();
  updateActionButtons();

  map.setView([20, 0], 2);
  scheduleMapResize();
};

const placeGuess = (lat, lng) => {
  if (mode !== "playing") return;

  guessLat = lat;
  guessLng = lng;

  if (guessMapMarker) {
    guessMapMarker.setLatLng([lat, lng]);
  } else {
    guessMapMarker = createGuessMarker([lat, lng]).addTo(map);
  }

  setStatusMessage(t("status_guess_placed"));
  guessButton.disabled = false;
  updateActionButtons();
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

  const displayPoints = getDisplayPoints(guessLat, guessLng, currentPhoto.lat, currentPhoto.lng);
  if (guessMapMarker) {
    guessMapMarker.setLatLng(displayPoints.guess);
  } else {
    guessMapMarker = createGuessMarker(displayPoints.guess).addTo(map);
  }
  answerMapMarker = createAnswerMarker(displayPoints.answer, { opacity: 0 }).addTo(map);
  drawAnswerRevealLine(displayPoints.guess, displayPoints.answer, {
    animate: true,
    durationMs: 700,
    onComplete: () => {
      if (answerMapMarker) answerMapMarker.setOpacity(1);
    }
  });
  map.fitBounds(
    [displayPoints.guess, displayPoints.answer],
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
  setStatusMessage(t("status_you_were_away", {
    distance: formatDistance(distanceKm),
    score: roundScore
  }));

  if (roundScore === SCORE_MAX) {
    launchPerfectScoreConfetti();
  }

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
  updateActionButtons();

  scheduleMapResize();
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

const isTypingTarget = (target) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") return true;
  return target.isContentEditable;
};

const restartGame = () => {
  currentRoundNumber = 1;
  accumulatedScore = 0;
  sessionResults = [];
  hasCopiedResults = false;
  remainingPhotos = [...playablePhotos];
  startRound();
};

const setupMapDockBehavior = () => {
  if (!mapDock) return;

  const expandDock = () => {
    if (mode === "summary") return;
    if (isMobileLayout()) return;
    mapDock.classList.add("is-expanded");
    setTimeout(refreshMapSize, 260);
  };

  const collapseDock = () => {
    if (isMobileLayout()) return;
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

  if (mapSurface) {
    mapSurface.addEventListener("pointerdown", () => {
      if (mode !== "playing") return;
      setMobileMapFocus(true);
    });
  }

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
if (copyResultsButton) {
  copyResultsButton.addEventListener("click", async () => {
    const text = buildResultsCopyText();
    const copied = await copyTextToClipboard(text);
    hasCopiedResults = copied;
    updateCopyResultsButtonState();
    setStatusMessage(copied ? t("status_results_copied") : t("status_results_copy_failed"));
  });
}
window.addEventListener("keydown", (event) => {
  if (event.code !== "Space") return;
  if (event.repeat) return;
  if (isTypingTarget(event.target)) return;
  if (mode !== "playing") return;
  if (!isNumber(guessLat) || !isNumber(guessLng) || guessButton.disabled) return;
  event.preventDefault();
  submitGuess();
});
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
    if (mode === "playing") {
      setMobileMapFocus(false);
    }
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
    if (photoZoom <= PHOTO_ZOOM_MIN) {
      resetPhotoPan();
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

window.addEventListener("resize", () => {
  setPhotoPan(photoPanX, photoPanY);
});

const browserLang = (navigator.language || "").toLowerCase();
const isNorwegian = browserLang.startsWith("no") || browserLang.startsWith("nb") || browserLang.startsWith("nn");
mobileLayoutMediaQuery = window.matchMedia(MOBILE_LAYOUT_QUERY);
if (mobileLayoutMediaQuery && typeof mobileLayoutMediaQuery.addEventListener === "function") {
  mobileLayoutMediaQuery.addEventListener("change", () => setMobileMapFocus(false));
}
setLanguage(getStoredLanguage() || (isNorwegian ? "no" : "en"));

resetPhotoZoom();

init();
