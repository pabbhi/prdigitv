// config.js
const PROXY = "https://prdigitv-ts-proxy.onrender.com/"; // Your TS proxy

const LANGUAGE_M3U = {
  Telugu2: PROXY + "https://pabbhi.github.io/prdigitv/stb/final.m3u",
  Hindi: PROXY + "https://iptv-org.github.io/iptv/languages/hin.m3u",
  Telugu: PROXY + "https://iptv-org.github.io/iptv/languages/tel.m3u",
  Tamil: PROXY + "https://iptv-org.github.io/iptv/languages/tam.m3u",
  Kannada: PROXY + "https://iptv-org.github.io/iptv/languages/kan.m3u",
  Marathi: PROXY + "https://iptv-org.github.io/iptv/languages/mar.m3u",
  Bengali: PROXY + "https://iptv-org.github.io/iptv/languages/ben.m3u",
  Punjabi: PROXY + "https://iptv-org.github.io/iptv/languages/pan.m3u",
  Malayalam: PROXY + "https://iptv-org.github.io/iptv/languages/mal.m3u",
  Urdu: PROXY + "https://iptv-org.github.io/iptv/languages/urd.m3u",
  Gujarathi: PROXY + "https://iptv-org.github.io/iptv/languages/guj.m3u",
  Odisha: PROXY + "https://iptv-org.github.io/iptv/languages/ori.m3u",
  "Unknown SIN": PROXY + "https://iptv-org.github.io/iptv/languages/sin.m3u",
  Assamese: PROXY + "https://iptv-org.github.io/iptv/languages/asm.m3u",
  Konkani: PROXY + "https://iptv-org.github.io/iptv/languages/kok.m3u",
  Bhojpuri: PROXY + "https://iptv-org.github.io/iptv/languages/bho.m3u"
};

const DEFAULT_LANGUAGE = "Telugu2";
