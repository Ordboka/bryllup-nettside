const translations = {
  en: {
    names: "Sandra & Benjamin",
    invite_line: "invites you to our wedding",
    date_label: "Date",
    date_value: "Saturday, September 19, 2026",
    location_label: "Location",
    location_value: "Beitostølen, Norway",
    cta_schedule: "View the schedule",
    welcome_title: "Welcome",
    welcome_body:
      "We’re getting married in the mountains we love most. Join us for a weekend of quiet trails, candlelit meals, and fresh alpine air.",
    notes_title: "Weekend Notes",
    notes_body:
      "Dress for layered weather, bring comfortable shoes, and plan for golden-hour portraits overlooking the valley.",
    stay_eyebrow: "Stay Nearby",
    stay_title: "Where to stay",
    stay_intro:
      "We have not reserved any accommodation, but here are our suggested places to stay.",
    stay_walkable:
      "The venue is in the town center, so all three hotels are within walking distance.",
    stay_ridder: "Riddergården",
    stay_bergo: "Bergo Hotell",
    stay_cabin: "Rent a private cabin",
    stay_cabin_note: "Explore local cabins in the area.",
    stay_beito_resort: "Beito Resort Hotel",
    stay_link: "Visit website",
    travel_eyebrow: "Travel",
    travel_title: "How to get there",
    travel_lead: "Choose the option that fits your trip.",
    travel_drive_title: "Drive",
    travel_drive_body: "Follow the route to Beitostølen.",
    travel_drive_link: "Open in Google Maps",
    travel_bus_title: "Bus",
    travel_bus_body: "Valdresekspressen or Vy from Oslo Bussterminal.",
    travel_bus_valdre: "Valdresekspressen",
    travel_bus_vy: "Vy",
    travel_flight_title: "Flight",
    travel_flight_body:
      "Fly to Oslo Gardermoen, then take the train to Oslo city center and follow the bus instructions.",
    travel_entur: "entur.no",
    dress_eyebrow: "Dress Code",
    dress_title: "Dress code",
    dress_label: "Dress code",
    dress_value: "Mørk dress · lang kjole",
    schedule_eyebrow: "Schedule",
    schedule_title: "Weekend of events",
    fri_label: "Friday",
    fri_event: "Optional get-together",
    sat_label: "Saturday",
    sat_ceremony: "Ceremony",
    sat_dinner: "Dinner",
    gallery_eyebrow: "Gallery",
    gallery_title: "Mountain moments",
    footer_line: "We can’t wait to celebrate with you in the mountains."
  },
  no: {
    names: "Sandra & Benjamin",
    invite_line: "inviterer deg til bryllupet vårt",
    date_label: "Dato",
    date_value: "Lørdag 19. september 2026",
    location_label: "Sted",
    location_value: "Beitostølen, Norge",
    cta_schedule: "Se programmet",
    welcome_title: "Velkommen",
    welcome_body:
      "Vi gifter oss i fjellet vi er aller mest glad i. Bli med på en helg med stille stier, levende lys og frisk fjelluft.",
    notes_title: "Helgeinfo",
    notes_body:
      "Kle deg for skiftende vær, ta med gode sko og planlegg for bilder i kveldslyset over dalen.",
    stay_eyebrow: "Overnatting",
    stay_title: "Hvor kan du bo",
    stay_intro:
      "Vi har ikke reservert overnatting, men her er våre forslag til steder å bo.",
    stay_walkable:
      "Lokalet ligger i sentrum, så alle tre hotellene er i gangavstand.",
    stay_ridder: "Riddergården",
    stay_bergo: "Bergo Hotell",
    stay_cabin: "Lei en privat hytte",
    stay_cabin_note: "Se etter lokale hytter i området.",
    stay_beito_resort: "Beito Resort Hotel",
    stay_link: "Besøk nettsiden",
    travel_eyebrow: "Reise",
    travel_title: "Slik kommer du deg dit",
    travel_lead: "Velg alternativet som passer reisen din.",
    travel_drive_title: "Kjør",
    travel_drive_body: "Følg ruten til Beitostølen.",
    travel_drive_link: "Åpne i Google Maps",
    travel_bus_title: "Buss",
    travel_bus_body: "Valdresekspressen eller Vy fra Oslo Bussterminal.",
    travel_bus_valdre: "Valdresekspressen",
    travel_bus_vy: "Vy",
    travel_flight_title: "Fly",
    travel_flight_body:
      "Fly til Oslo Gardermoen, og ta toget til Oslo sentrum og følg bussinstruksjonene.",
    travel_entur: "entur.no",
    dress_eyebrow: "Kleskode",
    dress_title: "Kleskode",
    dress_label: "Kleskode",
    dress_value: "Mørk dress · lang kjole",
    schedule_eyebrow: "Program",
    schedule_title: "Helgens program",
    fri_label: "Fredag",
    fri_event: "Uformell samling",
    sat_label: "Lørdag",
    sat_ceremony: "Vielse",
    sat_dinner: "Middag",
    gallery_eyebrow: "Galleri",
    gallery_title: "Fjelløyeblikk",
    footer_line: "Vi gleder oss til å feire med dere i fjellet."
  }
};

const switchButtons = document.querySelectorAll(".lang-switch__btn");
const translatable = document.querySelectorAll("[data-i18n]");

const setLanguage = (lang) => {
  const dict = translations[lang];
  if (!dict) return;
  translatable.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  document.documentElement.setAttribute("lang", lang === "no" ? "no" : "en");
  switchButtons.forEach((btn) =>
    btn.classList.toggle("is-active", btn.dataset.lang === lang)
  );
};

switchButtons.forEach((btn) => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

const browserLang = (navigator.language || "").toLowerCase();
const isNorwegian = browserLang.startsWith("no") || browserLang.startsWith("nb") || browserLang.startsWith("nn");
setLanguage(isNorwegian ? "no" : "en");

const galleryGrid = document.querySelector(".gallery__grid");
if (galleryGrid) {
  const items = Array.from(galleryGrid.children);
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    galleryGrid.appendChild(items[j]);
    items.splice(j, 1);
  }
  items.forEach((item) => galleryGrid.appendChild(item));

  let isDragging = false;
  let startX = 0;
  let scrollStart = 0;
  let targetScroll = 0;
  let rafId = 0;

  const smoothStep = () => {
    const diff = targetScroll - galleryGrid.scrollLeft;
    galleryGrid.scrollLeft += diff * 0.35;
    if (Math.abs(diff) > 0.5) {
      rafId = requestAnimationFrame(smoothStep);
    } else {
      galleryGrid.scrollLeft = targetScroll;
      rafId = 0;
    }
  };

  galleryGrid.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" && event.button !== 0) return;
    isDragging = true;
    startX = event.clientX;
    scrollStart = galleryGrid.scrollLeft;
    targetScroll = scrollStart;
    galleryGrid.classList.add("is-dragging");
    galleryGrid.setPointerCapture(event.pointerId);
  });

  galleryGrid.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const delta = event.clientX - startX;
    targetScroll = scrollStart - delta * 1.2;
    if (!rafId) rafId = requestAnimationFrame(smoothStep);
  });

  const stopDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    galleryGrid.classList.remove("is-dragging");
    galleryGrid.scrollLeft = targetScroll;
    const itemsNow = Array.from(galleryGrid.children);
    if (itemsNow.length) {
      let closest = itemsNow[0];
      let closestDist = Math.abs(closest.offsetLeft - galleryGrid.scrollLeft);
      for (let i = 1; i < itemsNow.length; i += 1) {
        const dist = Math.abs(itemsNow[i].offsetLeft - galleryGrid.scrollLeft);
        if (dist < closestDist) {
          closest = itemsNow[i];
          closestDist = dist;
        }
      }
      galleryGrid.scrollTo({ left: closest.offsetLeft, behavior: "smooth" });
    }
    if (event.pointerId !== undefined) {
      galleryGrid.releasePointerCapture(event.pointerId);
    }
  };

  galleryGrid.addEventListener("pointerup", stopDrag);
  galleryGrid.addEventListener("pointercancel", stopDrag);
  galleryGrid.addEventListener("pointerleave", stopDrag);
  galleryGrid.addEventListener("dragstart", (event) => event.preventDefault());
}
