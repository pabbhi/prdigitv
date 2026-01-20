const video = document.getElementById("video");
const channelCountDiv = document.getElementById("channelCount");

let hls;
let channels = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let current = null;
let currentLanguage = localStorage.getItem("language") || DEFAULT_LANGUAGE;

// -------------------- INIT --------------------
window.addEventListener("DOMContentLoaded", () => {
  initLanguages();
  loadLanguage(currentLanguage);
});

// ------------------- LANGUAGE -------------------
function initLanguages() {
  const langSelect = document.getElementById("language");
  langSelect.innerHTML = "";
  Object.keys(LANGUAGE_M3U).forEach(lang => {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = lang;
    if (lang === currentLanguage) opt.selected = true;
    langSelect.appendChild(opt);
  });
}

function onLanguageChange() {
  const lang = document.getElementById("language").value;
  currentLanguage = lang;
  localStorage.setItem("language", lang);
  loadLanguage(lang);
}

async function loadLanguage(lang) {
  try {
    channels = [];
    renderChannels();
    renderCategories();
    document.getElementById("nowPlaying").textContent = `Loading ${lang} channels...`;

    const res = await fetch(LANGUAGE_M3U[lang]);
    const text = await res.text();
    parseM3U(text);

    if (channels.length > 0) {
      play(channels[0]);
    } else {
      document.getElementById("nowPlaying").textContent = "No channels found";
    }

  } catch (e) {
    alert("Failed to load channels");
    console.error(e);
  }
}

// ------------------- M3U PARSE -------------------
function parseM3U(data) {
  let info = {};
  channels = [];

  data.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    if (line.startsWith("#EXTINF")) {
      info = {
        name: line.split(",")[1] || "Unknown",
        logo: (line.match(/tvg-logo="(.*?)"/) || [])[1],
        group: (line.match(/group-title="(.*?)"/) || [])[1] || "Other"
      };
    } else if (line.startsWith("http")) {
      // Wrap .ts in .m3u8 dynamically if needed
      const url = line.endsWith(".m3u8") ? line : createM3U8FromTS(line);
      channels.push({ ...info, url, rawUrl: line });
    }
  });

  renderCategories();
  renderChannels();
}

// ------------------- CREATE TEMP M3U8 FOR .TS -------------------
function createM3U8FromTS(tsUrl) {
  // HLS.js can accept data URI with a small playlist
  const playlist = `#EXTM3U
#EXTINF:-1,TS Stream
${tsUrl}
`;
  const blob = new Blob([playlist], { type: "application/vnd.apple.mpegurl" });
  return URL.createObjectURL(blob);
}

// ------------------- CATEGORIES -------------------
function renderCategories() {
  const cat = document.getElementById("category");
  const groups = [...new Set(channels.map(c => c.group))];
  cat.innerHTML = `<option value="">All</option><option value="FAV">⭐ Favorites</option>`;
  groups.forEach(g => cat.innerHTML += `<option>${g}</option>`);
}

function onCategoryChange() {
  document.getElementById("search").value = "";
  renderChannels();
}

// ------------------- CHANNEL LIST -------------------
function renderChannels() {
  const list = document.getElementById("channels");
  const q = document.getElementById("search").value.toLowerCase();
  const cat = document.getElementById("category").value;
  list.innerHTML = "";

  const filtered = channels.filter(c => {
    if (q && !c.name.toLowerCase().includes(q)) return false;
    if (cat === "FAV") return favorites.includes(c.rawUrl || c.url);
    if (cat && c.group !== cat) return false;
    return true;
  });

  filtered.forEach(c => {
    const div = document.createElement("div");
    div.className = "channel";
    if (current?.rawUrl === c.rawUrl) div.classList.add("active");
    div.innerHTML = `
      <img src="${c.logo || ''}" onerror="this.style.display='none'">
      ${c.name}
      <span class="star">${favorites.includes(c.rawUrl || c.url) ? "★" : "☆"}</span>
    `;
    div.onclick = () => play(c);
    div.querySelector(".star").onclick = e => {
      e.stopPropagation();
      toggleFav(c);
    };

    list.appendChild(div);
  });

  channelCountDiv.textContent = `Channels: ${filtered.length}`;
}

// ------------------- PLAYBACK -------------------
function play(c) {
  current = c;
  document.getElementById("nowPlaying").textContent = c.name;

  if (hls) {
    hls.destroy();
    hls = null;
  }

  video.pause();
  video.src = "";

  if (Hls.isSupported()) {
    hls = new Hls({ lowLatencyMode: true, enableWorker: true, debug: true });
    hls.loadSource(c.url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(err => console.log("Autoplay failed", err));
    });
    hls.on(Hls.Events.ERROR, (event, data) => console.error("HLS.js error", data));
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = c.url;
    video.play().catch(err => console.log(err));
  } else {
    console.error("Cannot play this stream:", c.url);
  }

  renderChannels();
}

// ------------------- CONTROLS -------------------
function togglePlay() { video.paused ? video.play() : video.pause(); }
function toggleMute() { video.muted = !video.muted; }

function toggleFav(c) {
  const i = favorites.indexOf(c.rawUrl || c.url);
  i >= 0 ? favorites.splice(i, 1) : favorites.push(c.rawUrl || c.url);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderChannels();
}

function toggleFavorite() {
  if (current) toggleFav(current);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    video.requestFullscreen().catch(err => console.log(err));
  } else {
    document.exitFullscreen();
  }
}
