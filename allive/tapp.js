const video = document.getElementById("video");
const channelCountDiv = document.getElementById("channelCount");

let hls;
let channels = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let current = null;

let currentLanguage = localStorage.getItem("language") || DEFAULT_LANGUAGE;

// ------------------- INITIALIZE -------------------
window.addEventListener("DOMContentLoaded", () => {
  initLanguages();
  loadLanguage(currentLanguage);
});

// ------------------- LANGUAGE HANDLING -------------------
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
      play(channels[0]); // auto-play first channel
    } else {
      document.getElementById("nowPlaying").textContent = "No channels found";
    }
  } catch (e) {
    alert("Failed to load channels");
    console.error(e);
  }
}

// ------------------- M3U PARSING -------------------
function parseM3U(data) {
  let info = {};
  channels = [];

  data.split("\n").forEach(line => {
    line = line.trim();
    if (line.startsWith("#EXTINF")) {
      info = {
        name: line.split(",")[1] || "Unknown",
        logo: (line.match(/tvg-logo="(.*?)"/) || [])[1],
        group: (line.match(/group-title="(.*?)"/) || [])[1] || "Other"
      };
    } else if (line.startsWith("http")) {
      channels.push({ ...info, url: line });
    }
  });

  renderCategories();
  renderChannels();
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

// ------------------- RENDER CHANNELS -------------------
function renderChannels() {
  const list = document.getElementById("channels");
  const q = document.getElementById("search").value.toLowerCase();
  const cat = document.getElementById("category").value;
  list.innerHTML = "";

  const filtered = channels.filter(c => {
    if (q && !c.name.toLowerCase().includes(q)) return false;
    if (cat === "FAV") return favorites.includes(c.url);
    if (cat && c.group !== cat) return false;
    return true;
  });

  filtered.forEach(c => {
    const div = document.createElement("div");
    div.className = "channel";
    if (current?.url === c.url) div.classList.add("active");
    div.innerHTML = `
      <img src="${c.logo || ''}" onerror="this.style.display='none'">
      ${c.name}
      <span class="star">${favorites.includes(c.url) ? "★" : "☆"}</span>
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

  let url = c.url;

  // TS → HLS Proxy
  if (url.toLowerCase().includes(".ts")) {
    url = TS_TO_HLS + encodeURIComponent(url);
  }

  if (Hls.isSupported()) {
    hls = new Hls({ lowLatencyMode: true });
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.play();
  }

  renderChannels();
}

// ------------------- CONTROLS -------------------
function togglePlay() { video.paused ? video.play() : video.pause(); }
function toggleMute() { video.muted = !video.muted; }

function toggleFav(c) {
  const i = favorites.indexOf(c.url);
  i >= 0 ? favorites.splice(i, 1) : favorites.push(c.url);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderChannels();
}

function toggleFavorite() { if (current) toggleFav(current); }

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    video.requestFullscreen().catch(err => console.log(err));
  } else {
    document.exitFullscreen();
  }
}
