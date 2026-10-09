/**
 * YouTube Playlist Web App
 * My Playlist - 완벽한 슬라이드 메뉴 및 유튜브 플레이어
 */

const DEFAULT_DATA = {
  playlists: [],
  cloudPlaylists: [],
  activePlaylistId: null,
  settings: {
    volume: 80,
    repeatMode: 'all',
    isShuffled: false,
    isVideoVisible: true
  }
};

let appState = {
  playlists: [],
  cloudPlaylists: [],
  activePlaylistId: null,
  currentTrackIndex: -1,
  isPlaying: false,
  settings: {
    volume: 80,
    repeatMode: 'all',
    isShuffled: false,
    isVideoVisible: true
  }
};

let ytPlayer = null;
let isPlayerReady = false;
let progressUpdateTimer = null;
let pendingVideoLoad = null;
let isDraggingSeekbar = false;
let dragAnimationRaf = null;
let draggedTrackIndex = null;

// DOM Elements
const el = {
  protocolWarning: document.getElementById('protocol-warning'),
  btnCloseWarning: document.getElementById('btn-close-warning'),
  
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebar-overlay'),
  btnOpenSidebar: document.getElementById('btn-open-sidebar'),
  btnMobileToggleView: document.getElementById('btn-mobile-toggle-view'),
  iconMobileView: document.getElementById('icon-mobile-view'),
  contentBody: document.getElementById('content-body'),
  
  playlistList: document.getElementById('playlist-list'),
  sidebarEmptyMsg: document.getElementById('sidebar-empty-msg'),
  btnQuickCreatePl: document.getElementById('btn-quick-create-pl'),
  btnCreatePlaylist: document.getElementById('btn-create-playlist'),
  
  currentPlaylistTitle: document.getElementById('current-playlist-title'),
  currentPlaylistMeta: document.getElementById('current-playlist-meta'),
  headerActions: document.getElementById('header-actions'),
  btnRenamePlaylist: document.getElementById('btn-rename-playlist'),
  btnDeletePlaylist: document.getElementById('btn-delete-playlist'),
  
  formAddTrack: document.getElementById('form-add-track'),
  inputYoutubeUrl: document.getElementById('input-youtube-url'),
  btnPasteUrl: document.getElementById('btn-paste-url'),
  btnSubmitAdd: document.getElementById('btn-submit-add'),
  urlStatus: document.getElementById('url-status'),
  
  trackList: document.getElementById('track-list'),
  emptyTrackMsg: document.getElementById('empty-track-msg'),
  emptyStateText: document.getElementById('empty-state-text'),
  
  videoWrapper: document.getElementById('video-wrapper'),
  playerPlaceholder: document.getElementById('player-placeholder'),
  placeholderText: document.getElementById('placeholder-text'),
  nowPlayingCard: document.getElementById('now-playing-card'),
  
  npPlaceholderIcon: document.getElementById('np-placeholder-icon'),
  npThumbnail: document.getElementById('np-thumbnail'),
  npTitle: document.getElementById('np-title'),
  npSubtitle: document.getElementById('np-subtitle'),
  
  bottomPlayerBar: document.getElementById('bottom-player-bar'),
  topSoundWaveform: document.getElementById('top-sound-waveform'),
  soundWaveCanvas: document.getElementById('sound-wave-canvas'),
  
  // 데스크탑 플레이어 바
  desktopPlaceholderIcon: document.getElementById('desktop-placeholder-icon'),
  barThumb: document.getElementById('bar-thumb'),
  barTitle: document.getElementById('bar-title'),
  barArtist: document.getElementById('bar-artist'),
  btnPlayPause: document.getElementById('btn-play-pause'),
  iconPlayPause: document.getElementById('icon-play-pause'),
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next'),
  btnShuffle: document.getElementById('btn-shuffle'),
  btnRepeat: document.getElementById('btn-repeat'),
  repeatBadge: document.getElementById('repeat-badge'),
  
  // 모바일 전용 플레이어 바
  mobilePlaceholderIcon: document.getElementById('mobile-placeholder-icon'),
  mobileBarThumb: document.getElementById('mobile-bar-thumb'),
  mobileBarTitle: document.getElementById('mobile-bar-title'),
  mobileBarArtist: document.getElementById('mobile-bar-artist'),
  btnMobilePlayPause: document.getElementById('btn-mobile-play-pause'),
  iconMobilePlayPause: document.getElementById('icon-mobile-play-pause'),
  btnMobilePrev: document.getElementById('btn-mobile-prev'),
  btnMobileNext: document.getElementById('btn-mobile-next'),
  btnMobileShuffle: document.getElementById('btn-mobile-shuffle'),
  btnMobileRepeat: document.getElementById('btn-mobile-repeat'),
  mobileRepeatBadge: document.getElementById('mobile-repeat-badge'),
  btnMobileMute: document.getElementById('btn-mobile-mute'),
  iconMobileVolume: document.getElementById('icon-mobile-volume'),
  
  // 프로그레스 바
  progressBar: document.getElementById('progress-bar'),
  progressFilled: document.getElementById('progress-filled'),
  timeCurrent: document.getElementById('time-current'),
  timeTotal: document.getElementById('time-total'),
  
  btnToggleVideo: document.getElementById('btn-toggle-video'),
  btnMute: document.getElementById('btn-mute'),
  iconVolume: document.getElementById('icon-volume'),
  volumeSlider: document.getElementById('volume-slider'),
  
  btnBackupData: document.getElementById('btn-backup-data'),
  btnRestoreData: document.getElementById('btn-restore-data'),
  fileRestore: document.getElementById('file-restore'),
  colorCanvas: document.getElementById('color-canvas'),
  btnWakeLock: document.getElementById('btn-wakelock'),
  silentAudioDriver: document.getElementById('silent-audio-driver'),

  // 플리만 보기 (감상 모드) 요소들
  btnFocusMode: document.getElementById('btn-focus-mode'),
  btnFocusModeBar: document.getElementById('btn-focus-mode-bar'),
  btnMobileFocus: document.getElementById('btn-mobile-focus'),
  focusOverlay: document.getElementById('focus-mode-overlay'),
  btnCloseFocus: document.getElementById('btn-close-focus'),
  focusPlName: document.getElementById('focus-pl-name'),
  focusCarouselViewport: document.getElementById('focus-carousel-viewport'),
  focusTrackList: document.getElementById('focus-track-list'),
  btnFocusPlayPause: document.getElementById('btn-focus-play-pause'),
  iconFocusPlayPause: document.getElementById('icon-focus-play-pause'),
  btnFocusPrev: document.getElementById('btn-focus-prev'),
  btnFocusNext: document.getElementById('btn-focus-next'),
  btnFocusShuffle: document.getElementById('btn-focus-shuffle'),
  btnFocusRepeat: document.getElementById('btn-focus-repeat'),
  focusProgressBar: document.getElementById('focus-progress-bar'),
  focusProgressFilled: document.getElementById('focus-progress-filled'),
  focusTimeCurrent: document.getElementById('focus-time-current'),
  focusTimeTotal: document.getElementById('focus-time-total'),

  // 기기 실시간 동기화 (클라우드 룸)
  btnCloudSync: document.getElementById('btn-cloud-sync'),
  syncBtnText: document.getElementById('sync-btn-text'),
  syncBadge: document.getElementById('sync-badge'),
  syncModal: document.getElementById('sync-modal'),
  btnCloseSyncModal: document.getElementById('btn-close-sync-modal'),
  syncDisconnectedView: document.getElementById('sync-disconnected-view'),
  syncConnectedView: document.getElementById('sync-connected-view'),
  btnCreateSyncRoom: document.getElementById('btn-create-sync-room'),
  inputSyncCode: document.getElementById('input-sync-code'),
  btnPasteSyncCode: document.getElementById('btn-paste-sync-code'),
  btnJoinSyncRoom: document.getElementById('btn-join-sync-room'),
  displaySyncCode: document.getElementById('display-sync-code'),
  btnCopySyncCode: document.getElementById('btn-copy-sync-code'),
  btnManualSyncPush: document.getElementById('btn-manual-sync-push'),
  btnManualSyncPull: document.getElementById('btn-manual-sync-pull'),
  btnDisconnectSync: document.getElementById('btn-disconnect-sync'),
  syncStatusMsg: document.getElementById('sync-status-msg')
};

/* ==================== 데이터 영속성 (LocalStorage) ==================== */
function loadState() {
  try {
    const saved = localStorage.getItem('my_yt_playlist_hub_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      appState.playlists = parsed.playlists || [];
      appState.activePlaylistId = parsed.activePlaylistId || (appState.playlists[0] ? appState.playlists[0].id : null);
      appState.settings = Object.assign({}, DEFAULT_DATA.settings, parsed.settings);
    } else {
      appState.playlists = [];
      appState.activePlaylistId = null;
      appState.settings = JSON.parse(JSON.stringify(DEFAULT_DATA.settings));
      saveState();
    }
  } catch (err) {
    console.error('State load error:', err);
    appState.playlists = [];
    appState.activePlaylistId = null;
  }
}

function saveState(syncToCloud = true) {
  try {
    const dataToSave = {
      playlists: appState.playlists,
      activePlaylistId: appState.activePlaylistId,
      settings: appState.settings
    };
    localStorage.setItem('my_yt_playlist_hub_v2', JSON.stringify(dataToSave));
    if (syncToCloud && typeof scheduleCloudPush === 'function') {
      scheduleCloudPush();
    }
  } catch (err) {
    console.error('State save error:', err);
  }
}

/* ==================== 엄격한 YouTube URL 검증 ==================== */
function extractStrictYouTubeId(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const trimmed = inputUrl.trim();
  const strictPattern = /^(https?:\/\/)?((www|m)\.)?(youtube\.com\/(watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/i;
  const match = trimmed.match(strictPattern);
  if (match && match[6] && match[6].length === 11) {
    return match[6];
  }
  return null;
}

async function fetchVideoMetadata(videoId) {
  const defaultResult = {
    title: `YouTube 영상 (${videoId})`,
    author: 'YouTube',
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  };

  const fetchWithTimeout = async (url, timeoutMs = 2200) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {}
    return null;
  };

  try {
    const noembedData = await fetchWithTimeout(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, 2200);
    if (noembedData && noembedData.title) {
      return {
        title: noembedData.title,
        author: noembedData.author_name || 'YouTube',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      };
    }
  } catch (e) {}

  try {
    const oembedData = await fetchWithTimeout(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, 2200);
    if (oembedData && oembedData.title) {
      return {
        title: oembedData.title,
        author: oembedData.author_name || 'YouTube',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      };
    }
  } catch (e) {}

  return defaultResult;
}

/* ==================== 영상 색감 자동 추출 (초고속 캐싱 & 백그라운드 프리로드) ==================== */
const videoColorCache = new Map();

function applyColorToCSS(color1, color2, glowStr, gradStr) {
  document.documentElement.style.setProperty('--dynamic-video-color', color1);
  document.documentElement.style.setProperty('--dynamic-video-color-2', color2);
  document.documentElement.style.setProperty('--dynamic-video-glow', glowStr);
  document.documentElement.style.setProperty('--dynamic-video-gradient', gradStr);
}

function extractAndApplyVideoColor(thumbnailUrl, videoId) {
  if (!videoId) return;

  if (videoColorCache.has(videoId)) {
    const cached = videoColorCache.get(videoId);
    applyColorToCSS(cached.color1, cached.color2, cached.glowStr, cached.gradStr);
    return;
  }

  // 즉시 기본 색상 적용 (0ms 즉각 반응)
  fallbackColorFromId(videoId);

  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  img.onload = function() {
    try {
      const canvas = el.colorCanvas || document.getElementById('color-canvas');
      if (!canvas) {
        fallbackColorFromId(videoId);
        return;
      }
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, 16, 16);
      const data = ctx.getImageData(0, 0, 16, 16).data;
      
      let bestSaturation = -1;
      let bestR = 255, bestG = 0, bestB = 85;
      let totalR = 0, totalG = 0, totalB = 0, validPixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 510;
        const d = max - min;
        const s = max === 0 ? 0 : d / max;

        // 너무 어둡거나 너무 흰 픽셀 제외 (블랙바, 흰 텍스트 제외)
        if (l > 0.15 && l < 0.88 && s > 0.18) {
          totalR += r;
          totalG += g;
          totalB += b;
          validPixels++;

          if (s > bestSaturation) {
            bestSaturation = s;
            bestR = r;
            bestG = g;
            bestB = b;
          }
        }
      }

      let r = bestR, g = bestG, b = bestB;
      if (validPixels > 0 && bestSaturation < 0.3) {
        r = Math.floor(totalR / validPixels);
        g = Math.floor(totalG / validPixels);
        b = Math.floor(totalB / validPixels);
      }

      // 채도 & 밝기 보정 (항상 영롱하고 선명하게)
      const maxVal = Math.max(r, g, b);
      if (maxVal < 160) {
        const factor = 190 / Math.max(1, maxVal);
        r = Math.min(255, Math.floor(r * factor));
        g = Math.min(255, Math.floor(g * factor));
        b = Math.min(255, Math.floor(b * factor));
      }

      const color1 = `rgb(${r}, ${g}, ${b})`;
      const r2 = (r + 70) % 255;
      const g2 = (g + 90) % 255;
      const b2 = (b + 120) % 255;
      const color2 = `rgb(${r2}, ${g2}, ${b2})`;
      const glowStr = `rgba(${r}, ${g}, ${b}, 0.5)`;
      const gradStr = `linear-gradient(90deg, ${color1}, ${color2})`;

      videoColorCache.set(videoId, { color1, color2, glowStr, gradStr });

      const currentPl = getCurrentPlaylist();
      if (currentPl && currentPl.tracks[appState.currentTrackIndex]?.id === videoId) {
        applyColorToCSS(color1, color2, glowStr, gradStr);
      }
    } catch (err) {
      fallbackColorFromId(videoId);
    }
  };

  img.onerror = function() {
    fallbackColorFromId(videoId);
  };
}

function fallbackColorFromId(videoId) {
  if (!videoId) return;
  const hash = videoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 55) % 360;
  
  const color1 = `hsl(${hue1}, 90%, 62%)`;
  const color2 = `hsl(${hue2}, 90%, 62%)`;
  const glowStr = `hsla(${hue1}, 90%, 62%, 0.45)`;
  const gradStr = `linear-gradient(90deg, ${color1}, ${color2})`;

  applyColorToCSS(color1, color2, glowStr, gradStr);
}

/* ==================== YouTube IFrame Player ==================== */
window.onYouTubeIframeAPIReady = function() {
  const originUrl = window.location.origin && window.location.origin !== 'null' ? window.location.origin : undefined;

  ytPlayer = new YT.Player('yt-player', {
    height: '100%',
    width: '100%',
    playerVars: {
      playsinline: 1,
      autoplay: 1,
      controls: 1,
      rel: 0,
      enablejsapi: 1,
      modestbranding: 1,
      origin: originUrl,
      iv_load_policy: 3
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError
    }
  });
};

function onPlayerReady(event) {
  isPlayerReady = true;
  ytPlayer.setVolume(appState.settings.volume);
  if (el.volumeSlider) el.volumeSlider.value = appState.settings.volume;
  updateVolumeIcon(appState.settings.volume);

  if (pendingVideoLoad) {
    const videoId = pendingVideoLoad;
    pendingVideoLoad = null;
    ytPlayer.loadVideoById({
      videoId: videoId,
      startSeconds: 0
    });
  }
}

/* ==================== 📱 화면 꺼짐 방지(WakeLock) & 백그라운드 재생 유지 ==================== */
let wakeLockSentinel = null;
let isWakeLockEnabled = true;

async function requestScreenWakeLock() {
  if (!isWakeLockEnabled || !('wakeLock' in navigator)) return;
  try {
    if (!wakeLockSentinel || wakeLockSentinel.released) {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      updateWakeLockUI(true);
      wakeLockSentinel.addEventListener('release', () => {
        updateWakeLockUI(false);
      });
    }
  } catch (err) {
    console.log('Screen wakeLock request:', err);
  }
}

async function releaseScreenWakeLock() {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
      wakeLockSentinel = null;
    } catch (e) {}
  }
  updateWakeLockUI(false);
}

function toggleWakeLock() {
  isWakeLockEnabled = !isWakeLockEnabled;
  if (isWakeLockEnabled) {
    requestScreenWakeLock();
    showStatusMsg('☀️ 화면 꺼짐 방지(화면 켜짐 유지)가 활성화되었습니다.', 'info');
  } else {
    releaseScreenWakeLock();
    showStatusMsg('🌙 화면 꺼짐 방지가 해제되었습니다.', 'info');
  }
  updateWakeLockUI(isWakeLockEnabled);
}

function updateWakeLockUI(active) {
  if (el.btnWakeLock) {
    el.btnWakeLock.classList.toggle('active', active);
    el.btnWakeLock.title = active ? '화면 켜짐 유지 활성화됨 (클릭하여 끄기)' : '화면 꺼짐 방지 켜기';
  }
}

function startSilentAudioDriver() {
  if (el.silentAudioDriver) {
    try {
      el.silentAudioDriver.play().catch(() => {});
    } catch (e) {}
  }
}

function pauseSilentAudioDriver() {
  if (el.silentAudioDriver) {
    try {
      el.silentAudioDriver.pause();
    } catch (e) {}
  }
}

function updateMediaSession(track) {
  if (!('mediaSession' in navigator) || !track) return;
  try {
    const currentPl = getCurrentPlaylist();
    const plName = currentPl ? currentPl.name : 'My Playlist';

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: plName,
      album: 'YouTube Playlist',
      artwork: [
        { src: track.thumbnail, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      if (ytPlayer && isPlayerReady) ytPlayer.playVideo();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      if (ytPlayer && isPlayerReady) ytPlayer.pauseVideo();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPrevTrack();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNextTrack();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime && ytPlayer && isPlayerReady) {
        ytPlayer.seekTo(details.seekTime, true);
      }
    });
  } catch (err) {}
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    appState.isPlaying = true;
    updatePlayPauseUI(true);
    startProgressTimer();
    setVisualizerState(true);
    preloadUpcomingTracks();
    requestScreenWakeLock();
    startSilentAudioDriver();
  } else if (event.data === YT.PlayerState.PAUSED) {
    appState.isPlaying = false;
    updatePlayPauseUI(false);
    stopProgressTimer();
    setVisualizerState(false);
    pauseSilentAudioDriver();
  } else if (event.data === YT.PlayerState.ENDED) {
    setVisualizerState(false);
    handleTrackEnded();
  }
}

function onPlayerError(event) {
  let errorMsg = '해당 영상을 재생할 수 없어 다음 곡으로 이동합니다.';
  if (event.data === 150 || event.data === 101) {
    errorMsg = '유튜브 영상 소유자가 외부 재생을 제한한 영상입니다.';
  }
  showStatusMsg(errorMsg, 'error');
  setTimeout(() => {
    playNextTrack();
  }, 400);
}

/* ==================== 🎵 실제 음악 동기화 연결형 오디오 스펙트럼 파형 ==================== */
let spectrumCanvasCtx = null;
let spectrumAnimFrame = null;
const NUM_SPECTRUM_NODES = 52;
let spectrumNodes = [];
let lastSyncTime = 0;
let lastSyncPerf = performance.now();

function getAccurateTrackTime() {
  if (ytPlayer && isPlayerReady && appState.isPlaying) {
    try {
      const ytTime = ytPlayer.getCurrentTime() || 0;
      const now = performance.now();
      // YT.getCurrentTime() 업데이트 간격을 performance.now()로 마이크로초 보간
      if (Math.abs(ytTime - lastSyncTime) > 0.01) {
        lastSyncTime = ytTime;
        lastSyncPerf = now;
      }
      return lastSyncTime + (now - lastSyncPerf) / 1000;
    } catch (e) {}
  }
  return lastSyncTime;
}

function initTopSoundWaveform() {
  const canvas = el.soundWaveCanvas || document.getElementById('sound-wave-canvas');
  if (!canvas) return;
  spectrumCanvasCtx = canvas.getContext('2d');
  
  spectrumNodes = [];
  for (let i = 0; i < NUM_SPECTRUM_NODES; i++) {
    spectrumNodes.push({
      height: 2,
      targetHeight: 2,
      velocity: 0
    });
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      if (spectrumCanvasCtx) {
        spectrumCanvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  startConnectedSpectrumAnimation();
}

function startConnectedSpectrumAnimation() {
  if (spectrumAnimFrame) cancelAnimationFrame(spectrumAnimFrame);

  function renderConnectedSpectrum() {
    const canvas = el.soundWaveCanvas || document.getElementById('sound-wave-canvas');
    if (!canvas || !spectrumCanvasCtx) {
      spectrumAnimFrame = requestAnimationFrame(renderConnectedSpectrum);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) {
      spectrumAnimFrame = requestAnimationFrame(renderConnectedSpectrum);
      return;
    }

    spectrumCanvasCtx.clearRect(0, 0, width, height);

    const isPlaying = appState.isPlaying;
    const trackTime = getAccurateTrackTime();
    
    // 현재 재생 중인 트랙 고유 시드 (곡마다 고유한 비트 패턴)
    const currentPl = getCurrentPlaylist();
    const currentTrack = currentPl?.tracks[appState.currentTrackIndex];
    const trackSeed = currentTrack ? (currentTrack.id.charCodeAt(0) + currentTrack.id.charCodeAt(currentTrack.id.length - 1)) % 100 : 42;
    const bpm = 120 + (trackSeed % 28); // 120 ~ 148 BPM
    const beatFreq = (bpm / 60) * Math.PI; // 비트 라디안 속도

    const color1 = getComputedStyle(document.documentElement).getPropertyValue('--dynamic-video-color').trim() || '#ff0055';
    const color2 = getComputedStyle(document.documentElement).getPropertyValue('--dynamic-video-color-2').trim() || '#8000ff';

    const numNodes = NUM_SPECTRUM_NODES;
    const points = [];

    // 노래 시간 동기화 비트 연산
    const bassPulse = Math.pow(Math.max(0, Math.sin(trackTime * beatFreq)), 3) * 0.95;
    const snarePulse = Math.pow(Math.max(0, Math.sin(trackTime * beatFreq + Math.PI * 0.5)), 4) * 0.85;
    const hihatPulse = Math.pow(Math.max(0, Math.sin(trackTime * beatFreq * 2)), 2) * 0.7;

    for (let i = 0; i < numNodes; i++) {
      const node = spectrumNodes[i];
      const normX = i / (numNodes - 1); // 0 (좌측) ~ 1 (우측)
      const x = normX * width;

      if (isPlaying) {
        // 주파수 대역별 리듬 반응
        let bandEnergy = 0;
        if (normX < 0.3) {
          // 저음/베이스 대역
          const sub = Math.sin(trackTime * beatFreq * 1.5 + i * 0.2) * 0.3;
          bandEnergy = bassPulse * (1 - normX * 2.2) + Math.max(0, sub);
        } else if (normX < 0.7) {
          // 중음/보컬 멜로디 대역
          const mid = Math.sin(trackTime * beatFreq * 2.5 + i * 0.4) * Math.cos(trackTime * 3.2 - i * 0.3);
          bandEnergy = snarePulse * 0.7 + Math.max(0, mid) * 0.75;
        } else {
          // 고음/하이햇 세션 대역
          const high = Math.sin(trackTime * beatFreq * 4.0 + i * 0.7) * Math.sin(trackTime * 5.5 + i * 0.3);
          bandEnergy = hihatPulse * 0.75 + Math.max(0, high) * 0.65;
        }

        // 유기적 파동 변조 (곡 시간 기준)
        const waveMod = Math.sin(trackTime * 4.0 + i * 0.35) * 0.15;
        const targetH = Math.max(2.5, Math.min(height * 0.92, (bandEnergy * 0.82 + 0.14 + waveMod) * height));
        
        // 탄력적인 스프링 반응 (통통 튀는 바운스)
        node.height += (targetH - node.height) * 0.32;
      } else {
        // 일시정지 시: 잔잔한 대기 곡선
        const idleH = 2 + Math.sin(trackTime * 0.5 + i * 0.2) * 0.8;
        node.height += (idleH - node.height) * 0.1;
      }

      const y = height - Math.max(2, node.height);
      points.push({ x, y });
    }

    if (points.length > 1) {
      // 1. 이어져있는 스펙트럼 영역 채우기 (배경 반투명 그라데이션)
      spectrumCanvasCtx.save();
      const areaGrad = spectrumCanvasCtx.createLinearGradient(0, height, 0, 0);
      areaGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      areaGrad.addColorStop(0.3, color1);
      areaGrad.addColorStop(1, color2);
      spectrumCanvasCtx.fillStyle = areaGrad;
      spectrumCanvasCtx.globalAlpha = 0.38;

      spectrumCanvasCtx.beginPath();
      spectrumCanvasCtx.moveTo(0, height);
      spectrumCanvasCtx.lineTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;
        spectrumCanvasCtx.quadraticCurveTo(curr.x, curr.y, midX, midY);
      }
      spectrumCanvasCtx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      spectrumCanvasCtx.lineTo(width, height);
      spectrumCanvasCtx.closePath();
      spectrumCanvasCtx.fill();
      spectrumCanvasCtx.restore();

      // 2. 이어져있는 상단 네온 발광 곡선 (연결된 매끄러운 스펙트럼 윤곽선)
      spectrumCanvasCtx.save();
      const lineGrad = spectrumCanvasCtx.createLinearGradient(0, 0, width, 0);
      lineGrad.addColorStop(0, color1);
      lineGrad.addColorStop(0.5, color2);
      lineGrad.addColorStop(1, color1);
      spectrumCanvasCtx.strokeStyle = lineGrad;
      spectrumCanvasCtx.lineWidth = 2.2;
      spectrumCanvasCtx.globalAlpha = 0.95;
      spectrumCanvasCtx.shadowColor = color1;
      spectrumCanvasCtx.shadowBlur = 8;
      spectrumCanvasCtx.lineCap = 'round';
      spectrumCanvasCtx.lineJoin = 'round';

      spectrumCanvasCtx.beginPath();
      spectrumCanvasCtx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;
        spectrumCanvasCtx.quadraticCurveTo(curr.x, curr.y, midX, midY);
      }
      spectrumCanvasCtx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      spectrumCanvasCtx.stroke();
      spectrumCanvasCtx.restore();
    }

    spectrumAnimFrame = requestAnimationFrame(renderConnectedSpectrum);
  }

  renderConnectedSpectrum();
}

function setVisualizerState(isPlaying) {
  if (el.bottomPlayerBar) {
    if (isPlaying) {
      el.bottomPlayerBar.classList.add('playing');
    } else {
      el.bottomPlayerBar.classList.remove('playing');
    }
  }
}

/* ==================== 다음 트랙 프리로드 ==================== */
function preloadUpcomingTracks() {
  const currentPl = getCurrentPlaylist();
  if (!currentPl || currentPl.tracks.length <= 1) return;

  const nextIdx = (appState.currentTrackIndex + 1) % currentPl.tracks.length;
  const nextTrack = currentPl.tracks[nextIdx];
  if (nextTrack) {
    const preImg = new Image();
    preImg.crossOrigin = 'Anonymous';
    preImg.src = nextTrack.thumbnail;
    if (!videoColorCache.has(nextTrack.id)) {
      extractAndApplyVideoColor(nextTrack.thumbnail, nextTrack.id);
    }
  }
}

/* ==================== 연속 재생 및 곡 전환 ==================== */
function handleTrackEnded() {
  if (appState.settings.repeatMode === 'one') {
    if (ytPlayer && isPlayerReady) {
      ytPlayer.seekTo(0);
      ytPlayer.playVideo();
    }
    return;
  }

  const currentPl = getCurrentPlaylist();
  if (!currentPl || currentPl.tracks.length === 0) return;

  if (appState.settings.isShuffled) {
    playNextShuffledTrack();
    return;
  }

  if (appState.currentTrackIndex < currentPl.tracks.length - 1) {
    playTrackByIndex(appState.currentTrackIndex + 1);
  } else {
    if (appState.settings.repeatMode === 'all') {
      playTrackByIndex(0);
    } else {
      appState.isPlaying = false;
      updatePlayPauseUI(false);
      stopProgressTimer();
      setVisualizerState(false);
    }
  }
}

function playNextTrack() {
  const currentPl = getCurrentPlaylist();
  if (!currentPl || currentPl.tracks.length === 0) return;

  if (appState.settings.isShuffled) {
    playNextShuffledTrack();
    return;
  }

  let nextIdx = appState.currentTrackIndex + 1;
  if (nextIdx >= currentPl.tracks.length) {
    nextIdx = 0;
  }
  playTrackByIndex(nextIdx);
}

function playPrevTrack() {
  const currentPl = getCurrentPlaylist();
  if (!currentPl || currentPl.tracks.length === 0) return;

  if (ytPlayer && isPlayerReady) {
    try {
      const curTime = ytPlayer.getCurrentTime();
      if (curTime > 3) {
        ytPlayer.seekTo(0);
        return;
      }
    } catch (e) {}
  }

  let prevIdx = appState.currentTrackIndex - 1;
  if (prevIdx < 0) {
    prevIdx = currentPl.tracks.length - 1;
  }
  playTrackByIndex(prevIdx);
}

function playTrackByIndex(index) {
  const currentPl = getCurrentPlaylist();
  if (!currentPl || !currentPl.tracks[index]) return;

  appState.currentTrackIndex = index;
  const track = currentPl.tracks[index];

  // 즉각 반응: 재생바 및 시간 텍스트 즉시 0으로 초기화 (이전 곡 잔상 제거)
  el.progressFilled.style.width = '0%';
  el.timeCurrent.textContent = '0:00';
  el.timeTotal.textContent = '0:00';
  if (el.focusProgressFilled) el.focusProgressFilled.style.width = '0%';
  if (el.focusTimeCurrent) el.focusTimeCurrent.textContent = '0:00';
  if (el.focusTimeTotal) el.focusTimeTotal.textContent = '0:00';

  appState.isPlaying = true;
  updatePlayPauseUI(true);
  setVisualizerState(true);

  extractAndApplyVideoColor(track.thumbnail, track.id);
  updateNowPlayingInfo(track);
  highlightActiveTrack();

  if (isFocusModeOpen) {
    updateFocusTrackListActive();
  }

  if (el.playerPlaceholder) {
    el.playerPlaceholder.classList.add('hidden');
  }

  if (ytPlayer && isPlayerReady) {
    try {
      ytPlayer.loadVideoById({
        videoId: track.id,
        startSeconds: 0
      });
    } catch (e) {
      try {
        ytPlayer.loadVideoById(track.id, 0);
      } catch (err) {}
    }
    startProgressTimer();
  } else {
    pendingVideoLoad = track.id;
  }

  // 다음 트랙 백그라운드 프리로드
  preloadUpcomingTracks();
}

function playNextShuffledTrack() {
  const currentPl = getCurrentPlaylist();
  if (!currentPl || currentPl.tracks.length === 0) return;

  if (currentPl.tracks.length === 1) {
    playTrackByIndex(0);
    return;
  }

  let randomIdx;
  do {
    randomIdx = Math.floor(Math.random() * currentPl.tracks.length);
  } while (randomIdx === appState.currentTrackIndex && currentPl.tracks.length > 1);

  playTrackByIndex(randomIdx);
}

/* ==================== 🌟 플리만 보기 (감상 모드) 기능 ==================== */
let isFocusModeOpen = false;
let wasVideoVisibleBeforeFocus = true;

function openFocusMode() {
  let currentPl = getCurrentPlaylist();
  if (!currentPl || currentPl.tracks.length === 0) {
    if (appState.playlists.length > 0 && appState.playlists[0].tracks.length > 0) {
      selectPlaylist(appState.playlists[0].id);
      currentPl = getCurrentPlaylist();
    }
  }

  if (!currentPl || currentPl.tracks.length === 0) {
    showStatusMsg('재생할 노래가 있는 플레이리스트를 먼저 생성하거나 노래를 추가해주세요.', 'error');
    return;
  }

  if (appState.currentTrackIndex === -1 && currentPl.tracks.length > 0) {
    playTrackByIndex(0);
  }

  // 감상모드 시 뒤편 영상 화면을 자동으로 숨겨 배경이 거슬리지 않도록 처리
  wasVideoVisibleBeforeFocus = appState.settings.isVideoVisible;
  if (el.videoWrapper) el.videoWrapper.classList.add('minimized');
  if (el.contentBody) el.contentBody.classList.add('video-minimized');

  isFocusModeOpen = true;
  if (el.focusOverlay) el.focusOverlay.classList.remove('hidden');
  if (el.focusPlName) el.focusPlName.textContent = currentPl.name;
  if (el.btnFocusMode) el.btnFocusMode.classList.add('active');
  if (el.btnFocusModeBar) el.btnFocusModeBar.classList.add('active');
  if (el.btnMobileFocus) el.btnMobileFocus.classList.add('active');

  renderFocusTrackList();
  
  setTimeout(() => {
    centerActiveFocusTrack(false);
  }, 80);

  updatePlayPauseUI(appState.isPlaying);
  updateRepeatUI();
  updateShuffleUI();
}

function closeFocusMode() {
  isFocusModeOpen = false;
  if (el.focusOverlay) el.focusOverlay.classList.add('hidden');
  if (el.btnFocusMode) el.btnFocusMode.classList.remove('active');
  if (el.btnFocusModeBar) el.btnFocusModeBar.classList.remove('active');
  if (el.btnMobileFocus) el.btnMobileFocus.classList.remove('active');

  // 감상모드 닫힐 때 원래 영상 표시 설정 복원
  if (wasVideoVisibleBeforeFocus && appState.settings.isVideoVisible) {
    if (el.videoWrapper) el.videoWrapper.classList.remove('minimized');
    if (el.contentBody) el.contentBody.classList.remove('video-minimized');
  }
}

function toggleFocusMode() {
  if (isFocusModeOpen) {
    closeFocusMode();
  } else {
    openFocusMode();
  }
}

function renderFocusTrackList() {
  const currentPl = getCurrentPlaylist();
  if (!currentPl || !el.focusTrackList) return;

  el.focusTrackList.innerHTML = '';

  currentPl.tracks.forEach((track, idx) => {
    const card = document.createElement('div');
    const isActive = idx === appState.currentTrackIndex;
    card.className = `focus-track-card ${isActive ? 'active' : ''}`;
    const vid = track.videoId || track.id;
    const thumbUrl = track.thumbnail || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
    card.innerHTML = `
      <div class="focus-thumb-box">
        <img class="focus-thumb-img" src="${thumbUrl}" alt="${escapeHtml(track.title)}" onerror="this.onerror=null; this.src='https://i.ytimg.com/vi/${vid}/mqdefault.jpg';">
        ${isActive ? `
          <div class="focus-playing-indicator">
            <div class="focus-equalizer-waves">
              <span class="focus-eq-bar"></span>
              <span class="focus-eq-bar"></span>
              <span class="focus-eq-bar"></span>
            </div>
            <span>NOW PLAYING</span>
          </div>
        ` : ''}
      </div>
      <div class="focus-track-meta">
        <span class="focus-card-index">#${idx + 1}</span>
        <h3 class="focus-card-title">${escapeHtml(track.title)}</h3>
      </div>
    `;

    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (idx !== appState.currentTrackIndex) {
        playTrackByIndex(idx);
      }
    });

    el.focusTrackList.appendChild(card);
  });
}

function updateFocusTrackListActive() {
  if (!el.focusTrackList) return;
  const cards = el.focusTrackList.querySelectorAll('.focus-track-card');
  cards.forEach((card, idx) => {
    const isActive = idx === appState.currentTrackIndex;
    if (isActive) {
      card.classList.add('active');
      const thumbBox = card.querySelector('.focus-thumb-box');
      if (thumbBox && !thumbBox.querySelector('.focus-playing-indicator')) {
        const ind = document.createElement('div');
        ind.className = 'focus-playing-indicator';
        ind.innerHTML = `
          <div class="focus-equalizer-waves">
            <span class="focus-eq-bar"></span>
            <span class="focus-eq-bar"></span>
            <span class="focus-eq-bar"></span>
          </div>
          <span>NOW PLAYING</span>
        `;
        thumbBox.appendChild(ind);
      }
    } else {
      card.classList.remove('active');
      const ind = card.querySelector('.focus-playing-indicator');
      if (ind) ind.remove();
    }
  });

  centerActiveFocusTrack(true);
}

function centerActiveFocusTrack(smooth = true) {
  if (!el.focusCarouselViewport || !el.focusTrackList) return;
  const activeCard = el.focusTrackList.querySelector('.focus-track-card.active');
  if (!activeCard) return;

  requestAnimationFrame(() => {
    const viewportHeight = el.focusCarouselViewport.clientHeight;
    const cardTop = activeCard.offsetTop;
    const cardHeight = activeCard.clientHeight;

    const targetScrollTop = cardTop - (viewportHeight / 2) + (cardHeight / 2);

    el.focusCarouselViewport.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: smooth ? 'smooth' : 'auto'
    });
  });
}

/* ==================== 60fps 프로그레스 & 스와이프 탐색 ==================== */
function startProgressTimer() {
  stopProgressTimer();
  progressUpdateTimer = setInterval(() => {
    if (!ytPlayer || !isPlayerReady) return;
    try {
      const curTime = ytPlayer.getCurrentTime() || 0;
      const duration = ytPlayer.getDuration() || 0;

      if (!isDraggingSeekbar) {
        el.timeCurrent.textContent = formatTime(curTime);
        el.timeTotal.textContent = formatTime(duration);
        if (duration > 0) {
          el.progressFilled.style.width = `${(curTime / duration) * 100}%`;
        } else {
          el.progressFilled.style.width = '0%';
        }
      }

      if (!isDraggingFocusSeekbar) {
        if (el.focusTimeCurrent) el.focusTimeCurrent.textContent = formatTime(curTime);
        if (el.focusTimeTotal) el.focusTimeTotal.textContent = formatTime(duration);
        if (el.focusProgressFilled && duration > 0) {
          el.focusProgressFilled.style.width = `${(curTime / duration) * 100}%`;
        } else if (el.focusProgressFilled) {
          el.focusProgressFilled.style.width = '0%';
        }
      }
    } catch (e) {}
  }, 250);
}

function stopProgressTimer() {
  if (progressUpdateTimer) {
    clearInterval(progressUpdateTimer);
    progressUpdateTimer = null;
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateSeekbarUI(clientX) {
  if (dragAnimationRaf) {
    cancelAnimationFrame(dragAnimationRaf);
  }

  dragAnimationRaf = requestAnimationFrame(() => {
    const rect = el.progressBar.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    offsetX = Math.max(0, Math.min(offsetX, rect.width));

    const percentage = (offsetX / rect.width) * 100;
    el.progressFilled.style.width = `${percentage}%`;

    if (ytPlayer && isPlayerReady) {
      try {
        const duration = ytPlayer.getDuration() || 0;
        if (duration > 0) {
          const seekTime = (offsetX / rect.width) * duration;
          el.timeCurrent.textContent = formatTime(seekTime);
        }
      } catch (e) {}
    }
  });
}

function finalizeSeek(clientX) {
  if (dragAnimationRaf) {
    cancelAnimationFrame(dragAnimationRaf);
  }

  if (!ytPlayer || !isPlayerReady) return;
  const rect = el.progressBar.getBoundingClientRect();
  let offsetX = clientX - rect.left;
  offsetX = Math.max(0, Math.min(offsetX, rect.width));

  try {
    const duration = ytPlayer.getDuration() || 0;
    if (duration > 0) {
      const seekTime = (offsetX / rect.width) * duration;
      ytPlayer.seekTo(seekTime, true);
    }
  } catch (e) {}
}

function setupSeekbarDragEvents() {
  const bar = el.progressBar;

  bar.addEventListener('mousedown', (e) => {
    isDraggingSeekbar = true;
    bar.classList.add('is-dragging');
    updateSeekbarUI(e.clientX);

    const onMouseMove = (moveEvent) => {
      if (isDraggingSeekbar) {
        updateSeekbarUI(moveEvent.clientX);
      }
    };

    const onMouseUp = (upEvent) => {
      if (isDraggingSeekbar) {
        isDraggingSeekbar = false;
        bar.classList.remove('is-dragging');
        finalizeSeek(upEvent.clientX);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  bar.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      isDraggingSeekbar = true;
      bar.classList.add('is-dragging');
      updateSeekbarUI(e.touches[0].clientX);
    }
  }, { passive: false });

  bar.addEventListener('touchmove', (e) => {
    if (isDraggingSeekbar && e.touches.length > 0) {
      e.preventDefault();
      updateSeekbarUI(e.touches[0].clientX);
    }
  }, { passive: false });

  const endTouch = (e) => {
    if (isDraggingSeekbar) {
      isDraggingSeekbar = false;
      bar.classList.remove('is-dragging');
      const touch = e.changedTouches ? e.changedTouches[0] : null;
      if (touch) {
        finalizeSeek(touch.clientX);
      }
    }
  };

  bar.addEventListener('touchend', endTouch);
  bar.addEventListener('touchcancel', endTouch);
}

/* ==================== 🌟 플리만 보기 프로그레스바 60fps 드래그 & 터치 스와이프 탐색 ==================== */
let isDraggingFocusSeekbar = false;
let focusDragAnimationRaf = null;

function updateFocusSeekbarUI(clientX) {
  if (focusDragAnimationRaf) {
    cancelAnimationFrame(focusDragAnimationRaf);
  }

  focusDragAnimationRaf = requestAnimationFrame(() => {
    if (!el.focusProgressBar) return;
    const rect = el.focusProgressBar.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    offsetX = Math.max(0, Math.min(offsetX, rect.width));

    const percentage = (offsetX / rect.width) * 100;
    if (el.focusProgressFilled) el.focusProgressFilled.style.width = `${percentage}%`;

    if (ytPlayer && isPlayerReady) {
      try {
        const duration = ytPlayer.getDuration() || 0;
        if (duration > 0) {
          const seekTime = (offsetX / rect.width) * duration;
          if (el.focusTimeCurrent) el.focusTimeCurrent.textContent = formatTime(seekTime);
        }
      } catch (e) {}
    }
  });
}

function finalizeFocusSeek(clientX) {
  if (focusDragAnimationRaf) {
    cancelAnimationFrame(focusDragAnimationRaf);
  }

  if (!ytPlayer || !isPlayerReady || !el.focusProgressBar) return;
  const rect = el.focusProgressBar.getBoundingClientRect();
  let offsetX = clientX - rect.left;
  offsetX = Math.max(0, Math.min(offsetX, rect.width));

  try {
    const duration = ytPlayer.getDuration() || 0;
    if (duration > 0) {
      const seekTime = (offsetX / rect.width) * duration;
      ytPlayer.seekTo(seekTime, true);
    }
  } catch (e) {}
}

function setupFocusSeekbarDragEvents() {
  const bar = el.focusProgressBar;
  if (!bar) return;

  bar.addEventListener('mousedown', (e) => {
    isDraggingFocusSeekbar = true;
    bar.classList.add('is-dragging');
    updateFocusSeekbarUI(e.clientX);

    const onMouseMove = (moveEvent) => {
      if (isDraggingFocusSeekbar) {
        updateFocusSeekbarUI(moveEvent.clientX);
      }
    };

    const onMouseUp = (upEvent) => {
      if (isDraggingFocusSeekbar) {
        isDraggingFocusSeekbar = false;
        bar.classList.remove('is-dragging');
        finalizeFocusSeek(upEvent.clientX);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  bar.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      isDraggingFocusSeekbar = true;
      bar.classList.add('is-dragging');
      updateFocusSeekbarUI(e.touches[0].clientX);
    }
  }, { passive: false });

  bar.addEventListener('touchmove', (e) => {
    if (isDraggingFocusSeekbar && e.touches.length > 0) {
      e.preventDefault();
      updateFocusSeekbarUI(e.touches[0].clientX);
    }
  }, { passive: false });

  const endTouch = (e) => {
    if (isDraggingFocusSeekbar) {
      isDraggingFocusSeekbar = false;
      bar.classList.remove('is-dragging');
      const touch = e.changedTouches ? e.changedTouches[0] : null;
      if (touch) {
        finalizeFocusSeek(touch.clientX);
      }
    }
  };

  bar.addEventListener('touchend', endTouch);
  bar.addEventListener('touchcancel', endTouch);
}

/* ==================== 트랙 드래그 앤 드롭 (데스크탑 & 모바일 터치 지원) ==================== */
function setupTrackDragAndDrop(li, index) {
  li.setAttribute('draggable', 'true');
  const dragHandle = li.querySelector('.drag-handle');

  // 1. 데스크탑 HTML5 Drag & Drop
  li.addEventListener('dragstart', (e) => {
    draggedTrackIndex = index;
    li.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  });

  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
    document.querySelectorAll('.track-item').forEach(item => {
      item.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    draggedTrackIndex = null;
  });

  li.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedTrackIndex === null || draggedTrackIndex === index) return;

    const rect = li.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    if (e.clientY < midY) {
      li.classList.add('drag-over-top');
      li.classList.remove('drag-over-bottom');
    } else {
      li.classList.add('drag-over-bottom');
      li.classList.remove('drag-over-top');
    }
  });

  li.addEventListener('dragleave', () => {
    li.classList.remove('drag-over-top', 'drag-over-bottom');
  });

  li.addEventListener('drop', (e) => {
    e.preventDefault();
    li.classList.remove('drag-over-top', 'drag-over-bottom');

    if (draggedTrackIndex === null || draggedTrackIndex === index) return;

    const rect = li.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    let targetIndex = index;

    if (e.clientY >= midY && draggedTrackIndex < index) {
      targetIndex = index;
    } else if (e.clientY < midY && draggedTrackIndex > index) {
      targetIndex = index;
    }

    reorderTracks(draggedTrackIndex, targetIndex);
  });

  // 2. 모바일 터치 스와이프 순서 변경 지원
  if (dragHandle) {
    let touchStartY = 0;
    let currentDropTarget = null;

    dragHandle.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      touchStartY = e.touches[0].clientY;
      draggedTrackIndex = index;
      li.classList.add('dragging');
    }, { passive: true });

    dragHandle.addEventListener('touchmove', (e) => {
      if (draggedTrackIndex === null || e.touches.length !== 1) return;
      e.preventDefault();

      const touch = e.touches[0];
      const targetElem = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetLi = targetElem ? targetElem.closest('.track-item') : null;

      document.querySelectorAll('.track-item').forEach(item => {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
      });

      if (targetLi && targetLi !== li) {
        currentDropTarget = targetLi;
        const rect = targetLi.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (touch.clientY < midY) {
          targetLi.classList.add('drag-over-top');
        } else {
          targetLi.classList.add('drag-over-bottom');
        }
      } else {
        currentDropTarget = null;
      }
    }, { passive: false });

    const finishTouchDrag = () => {
      if (draggedTrackIndex === null) return;
      li.classList.remove('dragging');

      if (currentDropTarget) {
        const items = Array.from(el.trackList.querySelectorAll('.track-item'));
        const targetIdx = items.indexOf(currentDropTarget);
        if (targetIdx !== -1 && targetIdx !== draggedTrackIndex) {
          reorderTracks(draggedTrackIndex, targetIdx);
        }
      }

      document.querySelectorAll('.track-item').forEach(item => {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
      });

      draggedTrackIndex = null;
      currentDropTarget = null;
    };

    dragHandle.addEventListener('touchend', finishTouchDrag);
    dragHandle.addEventListener('touchcancel', finishTouchDrag);
  }
}

function reorderTracks(fromIndex, toIndex) {
  const currentPl = getCurrentPlaylist();
  if (!currentPl || fromIndex === toIndex) return;

  const [movedTrack] = currentPl.tracks.splice(fromIndex, 1);
  currentPl.tracks.splice(toIndex, 0, movedTrack);

  if (appState.currentTrackIndex === fromIndex) {
    appState.currentTrackIndex = toIndex;
  } else if (appState.currentTrackIndex > fromIndex && appState.currentTrackIndex <= toIndex) {
    appState.currentTrackIndex--;
  } else if (appState.currentTrackIndex < fromIndex && appState.currentTrackIndex >= toIndex) {
    appState.currentTrackIndex++;
  }

  saveState();
  renderTracks();
}

/* ==================== UI 렌더링 & 업데이트 ==================== */
function getAllPlaylists() {
  return [...(appState.playlists || []), ...(appState.cloudPlaylists || [])];
}

function getCurrentPlaylist() {
  const all = getAllPlaylists();
  return all.find(p => p.id === appState.activePlaylistId) || (appState.playlists && appState.playlists[0]) || (appState.cloudPlaylists && appState.cloudPlaylists[0]) || null;
}

function isCloudPlaylist(id) {
  return Array.isArray(appState.cloudPlaylists) && appState.cloudPlaylists.some(p => p.id === id);
}

function renderPlaylists() {
  el.playlistList.innerHTML = '';

  const hasLocal = appState.playlists && appState.playlists.length > 0;
  const isCloudConnected = !!activeSyncRoomId;
  const hasCloud = isCloudConnected && appState.cloudPlaylists && appState.cloudPlaylists.length > 0;

  if (!hasLocal && !hasCloud) {
    el.sidebarEmptyMsg.classList.remove('hidden');
    el.headerActions.classList.add('hidden');
    return;
  }

  el.sidebarEmptyMsg.classList.add('hidden');
  el.headerActions.classList.remove('hidden');

  // 1. 📂 내 로컬 플레이리스트 섹션 (영구 보존)
  const localHeader = document.createElement('div');
  localHeader.className = 'sidebar-section-header';
  localHeader.innerHTML = `
    <span><i class="fa-solid fa-folder"></i> 내 로컬 플레이리스트</span>
    <button type="button" class="btn-icon-xs" id="btn-create-local-inline" title="새 로컬 플레이리스트">
      <i class="fa-solid fa-plus"></i>
    </button>
  `;
  el.playlistList.appendChild(localHeader);
  const btnCreateLocal = localHeader.querySelector('#btn-create-local-inline');
  if (btnCreateLocal) {
    btnCreateLocal.addEventListener('click', (e) => {
      e.stopPropagation();
      createNewPlaylist(null, false);
    });
  }

  if (hasLocal) {
    appState.playlists.forEach(pl => {
      const li = document.createElement('li');
      li.className = `playlist-item ${pl.id === appState.activePlaylistId ? 'active' : ''}`;
      li.innerHTML = `
        <div class="playlist-item-left">
          <i class="fa-solid fa-compact-disc"></i>
          <span>${escapeHtml(pl.name)}</span>
        </div>
        <span class="playlist-item-count">${(pl.tracks || []).length}곡</span>
      `;
      li.addEventListener('click', () => {
        selectPlaylist(pl.id);
        closeSidebar();
      });
      el.playlistList.appendChild(li);
    });
  } else {
    const emptyLocalLi = document.createElement('li');
    emptyLocalLi.className = 'sub-text';
    emptyLocalLi.style.padding = '6px 12px';
    emptyLocalLi.textContent = '로컬 플레이리스트가 없습니다.';
    el.playlistList.appendChild(emptyLocalLi);
  }

  // 2. ☁️ 클라우드 동기화 플레이리스트 섹션 (연결 시만 표시)
  if (isCloudConnected) {
    const cloudHeader = document.createElement('div');
    cloudHeader.className = 'sidebar-section-header cloud-header';
    cloudHeader.innerHTML = `
      <span><i class="fa-solid fa-cloud"></i> 클라우드 동기화 (${escapeHtml(activeSyncRoomId)})</span>
      <button type="button" class="btn-icon-xs" id="btn-create-cloud-inline" title="새 클라우드 플레이리스트">
        <i class="fa-solid fa-plus"></i>
      </button>
    `;
    el.playlistList.appendChild(cloudHeader);
    const btnCreateCloud = cloudHeader.querySelector('#btn-create-cloud-inline');
    if (btnCreateCloud) {
      btnCreateCloud.addEventListener('click', (e) => {
        e.stopPropagation();
        createNewPlaylist(null, true);
      });
    }

    if (hasCloud) {
      appState.cloudPlaylists.forEach(pl => {
        const li = document.createElement('li');
        li.className = `playlist-item cloud-item ${pl.id === appState.activePlaylistId ? 'active' : ''}`;
        li.innerHTML = `
          <div class="playlist-item-left">
            <i class="fa-solid fa-cloud"></i>
            <span>${escapeHtml(pl.name)}</span>
            <span class="cloud-pill">동기화</span>
          </div>
          <span class="playlist-item-count">${(pl.tracks || []).length}곡</span>
          <button type="button" class="btn-copy-to-local" title="내 로컬에 영구 복사">
            <i class="fa-solid fa-download"></i>
          </button>
        `;

        li.addEventListener('click', (e) => {
          if (e.target.closest('.btn-copy-to-local')) return;
          selectPlaylist(pl.id);
          closeSidebar();
        });

        const btnCopy = li.querySelector('.btn-copy-to-local');
        if (btnCopy) {
          btnCopy.addEventListener('click', (e) => {
            e.stopPropagation();
            copyCloudPlaylistToLocal(pl.id);
          });
        }

        el.playlistList.appendChild(li);
      });
    } else {
      const emptyCloudLi = document.createElement('li');
      emptyCloudLi.className = 'sub-text';
      emptyCloudLi.style.padding = '6px 12px';
      emptyCloudLi.textContent = '클라우드에 등록된 플레이리스트가 없습니다.';
      el.playlistList.appendChild(emptyCloudLi);
    }
  }
}

function copyCloudPlaylistToLocal(cloudPlId) {
  const cloudPl = (appState.cloudPlaylists || []).find(p => p.id === cloudPlId);
  if (!cloudPl) return;

  const newLocalPl = {
    id: 'pl-' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name: `${cloudPl.name} (로컬)`,
    tracks: JSON.parse(JSON.stringify(cloudPl.tracks || []))
  };

  appState.playlists.push(newLocalPl);
  saveState();
  renderPlaylists();
  alert(`'${cloudPl.name}' 플레이리스트가 내 로컬 플레이리스트에 안전하게 저장되었습니다!`);
}

function renderTracks() {
  const currentPl = getCurrentPlaylist();
  el.trackList.innerHTML = '';

  if (!currentPl) {
    el.currentPlaylistTitle.textContent = '플레이리스트가 없습니다';
    el.currentPlaylistMeta.textContent = '메뉴에서 새 플레이리스트를 만들어보세요.';
    el.emptyTrackMsg.classList.remove('hidden');
    el.emptyStateText.innerHTML = '등록된 플레이리스트가 없습니다.<br>메뉴에서 <strong>+ 새 플레이리스트</strong>를 만들어주세요.';
    el.headerActions.classList.add('hidden');
    return;
  }

  const isCloud = isCloudPlaylist(currentPl.id);
  el.headerActions.classList.remove('hidden');
  el.currentPlaylistTitle.innerHTML = `${escapeHtml(currentPl.name)} ${isCloud ? '<span class="cloud-pill" style="font-size:0.75rem; vertical-align:middle;">클라우드</span>' : ''}`;
  el.currentPlaylistMeta.textContent = `총 ${(currentPl.tracks || []).length}개의 트랙 ${isCloud ? '• 다른 기기와 실시간 동기화 중' : '• 로컬 전용'}`;

  if (!currentPl.tracks || currentPl.tracks.length === 0) {
    el.emptyTrackMsg.classList.remove('hidden');
    el.emptyStateText.innerHTML = `<strong>'${escapeHtml(currentPl.name)}'</strong> 플레이리스트가 비어있습니다.<br>상단 입력창에 유튜브 링크를 붙여넣어 노래를 추가해보세요!`;
    return;
  } else {
    el.emptyTrackMsg.classList.add('hidden');
  }

  currentPl.tracks.forEach((track, idx) => {
    const videoId = track.videoId || track.id;
    const thumbUrl = track.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const li = document.createElement('li');
    li.className = `track-item ${idx === appState.currentTrackIndex ? 'active' : ''}`;
    li.innerHTML = `
      <div class="drag-handle" title="드래그하여 순서 변경">
        <i class="fa-solid fa-grip-vertical"></i>
      </div>
      <div class="track-index">${idx + 1}</div>
      <div class="track-info">
        <img class="track-thumb" src="${thumbUrl}" alt="thumb" onerror="this.onerror=null; this.src='https://i.ytimg.com/vi/${videoId}/mqdefault.jpg';">
        <div class="track-text-details">
          <span class="track-title" title="${escapeHtml(track.title)}">${escapeHtml(track.title)}</span>
        </div>
      </div>
      <div class="track-actions">
        <button class="btn-track-action delete" data-action="delete" title="트랙 삭제">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;

    setupTrackDragAndDrop(li, idx);

    li.addEventListener('click', (e) => {
      if (e.target.closest('.track-actions') || e.target.closest('.drag-handle')) return;
      playTrackByIndex(idx);
    });

    const btnDelete = li.querySelector('[data-action="delete"]');
    if (btnDelete) {
      btnDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTrack(idx);
      });
    }

    el.trackList.appendChild(li);
  });
}

function highlightActiveTrack() {
  const items = el.trackList.querySelectorAll('.track-item');
  items.forEach((item, idx) => {
    if (idx === appState.currentTrackIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function updateNowPlayingInfo(track) {
  if (!track) {
    if (el.npThumbnail) el.npThumbnail.classList.add('hidden');
    if (el.npPlaceholderIcon) el.npPlaceholderIcon.classList.remove('hidden');
    if (el.barThumb) el.barThumb.classList.add('hidden');
    if (el.desktopPlaceholderIcon) el.desktopPlaceholderIcon.classList.remove('hidden');
    if (el.mobileBarThumb) el.mobileBarThumb.classList.add('hidden');
    if (el.mobilePlaceholderIcon) el.mobilePlaceholderIcon.classList.remove('hidden');
    return;
  }

  const vid = track.videoId || track.id;
  const thumbUrl = track.thumbnail || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;

  el.npTitle.textContent = track.title;
  el.npSubtitle.textContent = '재생 중';
  
  if (el.npThumbnail) {
    el.npThumbnail.src = thumbUrl;
    el.npThumbnail.classList.remove('hidden');
  }
  if (el.npPlaceholderIcon) el.npPlaceholderIcon.classList.add('hidden');

  const currentPl = getCurrentPlaylist();
  const plName = currentPl ? currentPl.name : 'YouTube Playlist';

  // 데스크탑 하단 바
  el.barTitle.textContent = track.title;
  el.barArtist.textContent = plName;
  if (el.barThumb) {
    el.barThumb.src = thumbUrl;
    el.barThumb.classList.remove('hidden');
  }
  if (el.desktopPlaceholderIcon) el.desktopPlaceholderIcon.classList.add('hidden');

  // 모바일 하단 바
  if (el.mobileBarTitle) el.mobileBarTitle.textContent = track.title;
  if (el.mobileBarArtist) el.mobileBarArtist.textContent = plName;
  if (el.mobileBarThumb) {
    el.mobileBarThumb.src = thumbUrl;
    el.mobileBarThumb.classList.remove('hidden');
  }
  if (el.mobilePlaceholderIcon) el.mobilePlaceholderIcon.classList.add('hidden');

  updateMediaSession(track);
}

function updatePlayPauseUI(isPlaying) {
  const iconClass = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  if (el.iconPlayPause) el.iconPlayPause.className = iconClass;
  if (el.iconMobilePlayPause) el.iconMobilePlayPause.className = iconClass;
  if (el.iconFocusPlayPause) el.iconFocusPlayPause.className = iconClass;
}

function updateRepeatUI() {
  const mode = appState.settings.repeatMode;
  const isNone = mode === 'none';
  const isOne = mode === 'one';

  if (el.btnRepeat) {
    if (isNone) {
      el.btnRepeat.classList.remove('active');
      el.repeatBadge.classList.add('hidden');
      el.btnRepeat.title = '반복 끔';
    } else {
      el.btnRepeat.classList.add('active');
      el.repeatBadge.classList.toggle('hidden', !isOne);
      el.btnRepeat.title = isOne ? '한 곡 반복' : '전체 반복';
    }
  }

  if (el.btnMobileRepeat) {
    if (isNone) {
      el.btnMobileRepeat.classList.remove('active');
      el.mobileRepeatBadge.classList.add('hidden');
    } else {
      el.btnMobileRepeat.classList.add('active');
      el.mobileRepeatBadge.classList.toggle('hidden', !isOne);
    }
  }

  if (el.btnFocusRepeat) {
    el.btnFocusRepeat.classList.toggle('active', !isNone);
  }
}

function updateShuffleUI() {
  const isShuffled = appState.settings.isShuffled;
  if (el.btnShuffle) el.btnShuffle.classList.toggle('active', isShuffled);
  if (el.btnMobileShuffle) el.btnMobileShuffle.classList.toggle('active', isShuffled);
  if (el.btnFocusShuffle) el.btnFocusShuffle.classList.toggle('active', isShuffled);
}

function updateVolumeIcon(vol) {
  let iconClass = 'fa-solid fa-volume-high';
  if (vol === 0) iconClass = 'fa-solid fa-volume-xmark';
  else if (vol < 50) iconClass = 'fa-solid fa-volume-low';

  if (el.iconVolume) el.iconVolume.className = iconClass;
  if (el.iconMobileVolume) el.iconMobileVolume.className = iconClass;
}

function updateVideoVisibilityUI() {
  const isVisible = appState.settings.isVideoVisible !== false;
  if (el.videoWrapper) {
    el.videoWrapper.classList.toggle('minimized', !isVisible);
  }
  if (el.contentBody) {
    el.contentBody.classList.toggle('video-minimized', !isVisible);
  }
  if (el.btnToggleVideo) {
    el.btnToggleVideo.classList.toggle('active', !isVisible);
    el.btnToggleVideo.title = isVisible ? '영상 화면 숨기기 (오디오만 재생)' : '영상 화면 보기';
    const icon = el.btnToggleVideo.querySelector('i');
    if (icon) {
      icon.className = isVisible ? 'fa-solid fa-display' : 'fa-solid fa-eye-slash';
    }
  }
}

function showStatusMsg(msg, type = 'error') {
  el.urlStatus.textContent = msg;
  el.urlStatus.className = `status-msg ${type}`;
  el.urlStatus.classList.remove('hidden');
  setTimeout(() => {
    el.urlStatus.classList.add('hidden');
    el.urlStatus.textContent = '';
  }, 4500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

/* ==================== 사이드바 토글 (깜빡임/찌그러짐 없는 완벽 슬라이드) ==================== */
function toggleSidebar() {
  const isOpen = el.sidebar.classList.contains('open');
  if (isOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function openSidebar() {
  el.sidebar.classList.add('open');
  el.sidebarOverlay.classList.add('active');
}

function closeSidebar() {
  el.sidebar.classList.remove('open');
  el.sidebarOverlay.classList.remove('active');
}

let mobileViewMode = 'all';
function toggleMobileView() {
  if (mobileViewMode === 'all' || mobileViewMode === 'tracks') {
    mobileViewMode = 'video';
    el.contentBody.classList.remove('mode-tracks');
    el.contentBody.classList.add('mode-video');
    el.iconMobileView.className = 'fa-solid fa-list';
  } else {
    mobileViewMode = 'tracks';
    el.contentBody.classList.remove('mode-video');
    el.contentBody.classList.add('mode-tracks');
    el.iconMobileView.className = 'fa-solid fa-tv';
  }
}

/* ==================== 플레이리스트 관리 기능 ==================== */
function selectPlaylist(id) {
  appState.activePlaylistId = id;
  appState.currentTrackIndex = -1;
  saveState();
  renderPlaylists();
  renderTracks();
}

function createNewPlaylist(defaultName, forceCloud = null) {
  const isTargetCloud = forceCloud !== null ? forceCloud : (isCloudPlaylist(appState.activePlaylistId));
  const list = isTargetCloud ? (appState.cloudPlaylists || []) : appState.playlists;
  const prefix = isTargetCloud ? '클라우드' : '내 로컬';
  const defaultTitle = defaultName || `${prefix} 플레이리스트 ${list.length + 1}`;
  const name = prompt(`${prefix} 플레이리스트 이름을 입력하세요:`, defaultTitle);
  if (!name || !name.trim()) return null;

  const newPl = {
    id: (isTargetCloud ? 'cpl-' : 'pl-') + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name: name.trim(),
    tracks: []
  };

  if (isTargetCloud) {
    if (!appState.cloudPlaylists) appState.cloudPlaylists = [];
    appState.cloudPlaylists.push(newPl);
    selectPlaylist(newPl.id);
    scheduleCloudPush();
  } else {
    appState.playlists.push(newPl);
    selectPlaylist(newPl.id);
    saveState();
  }

  closeSidebar();
  return newPl;
}

function renameCurrentPlaylist() {
  const currentPl = getCurrentPlaylist();
  if (!currentPl) return;

  const newName = prompt('플레이리스트 이름을 변경하세요:', currentPl.name);
  if (!newName || !newName.trim()) return;

  currentPl.name = newName.trim();
  if (isCloudPlaylist(currentPl.id)) {
    scheduleCloudPush();
  } else {
    saveState();
  }
  renderPlaylists();
  renderTracks();
}

function deleteCurrentPlaylist() {
  const currentPl = getCurrentPlaylist();
  if (!currentPl) return;

  const isCloud = isCloudPlaylist(currentPl.id);
  const typeText = isCloud ? '클라우드 동기화' : '로컬';

  if (confirm(`'${currentPl.name}' (${typeText}) 플레이리스트를 삭제하시겠습니까?`)) {
    if (isCloud) {
      appState.cloudPlaylists = appState.cloudPlaylists.filter(p => p.id !== currentPl.id);
      scheduleCloudPush();
    } else {
      appState.playlists = appState.playlists.filter(p => p.id !== currentPl.id);
      saveState();
    }

    const remaining = getAllPlaylists();
    appState.activePlaylistId = remaining[0] ? remaining[0].id : null;
    appState.currentTrackIndex = -1;
    renderPlaylists();
    renderTracks();
  }
}

/* ==================== 트랙 관리 기능 ==================== */
async function addTrackFromUrl(url) {
  const videoId = extractStrictYouTubeId(url);
  if (!videoId) {
    showStatusMsg('❌ 올바른 유튜브 영상 URL만 입력 가능합니다. (예: https://www.youtube.com/watch?v=... 또는 https://youtu.be/...)', 'error');
    return;
  }

  let currentPl = getCurrentPlaylist();
  if (!currentPl) {
    const created = createNewPlaylist('🎵 나의 첫 플레이리스트', false);
    if (!created) {
      showStatusMsg('먼저 플레이리스트를 생성해주세요.', 'error');
      return;
    }
    currentPl = created;
  }

  el.btnSubmitAdd.disabled = true;

  try {
    const meta = await fetchVideoMetadata(videoId);
    const newTrack = {
      id: videoId,
      videoId: videoId,
      title: meta.title,
      thumbnail: meta.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      author: meta.author || 'YouTube'
    };

    currentPl.tracks.push(newTrack);
    
    if (isCloudPlaylist(currentPl.id)) {
      scheduleCloudPush();
    } else {
      saveState();
    }

    renderTracks();
    renderPlaylists();

    el.inputYoutubeUrl.value = '';

    if (appState.currentTrackIndex === -1 && currentPl.tracks.length === 1) {
      playTrackByIndex(0);
    }
  } catch (err) {
    showStatusMsg('영상 정보를 불러오는 데 실패했습니다.', 'error');
  } finally {
    el.btnSubmitAdd.disabled = false;
  }
}

function deleteTrack(index) {
  const currentPl = getCurrentPlaylist();
  if (!currentPl) return;

  const track = currentPl.tracks[index];
  if (!confirm(`'${track.title}' 영상을 목록에서 삭제하시겠습니까?`)) {
    return;
  }

  currentPl.tracks.splice(index, 1);

  if (isCloudPlaylist(currentPl.id)) {
    scheduleCloudPush();
  } else {
    saveState();
  }

  if (appState.currentTrackIndex === index) {
    if (currentPl.tracks.length > 0) {
      playTrackByIndex(Math.min(index, currentPl.tracks.length - 1));
    } else {
      appState.currentTrackIndex = -1;
      if (ytPlayer && isPlayerReady) {
        try { ytPlayer.stopVideo(); } catch (e) {}
      }
      appState.isPlaying = false;
      updatePlayPauseUI(false);
      setVisualizerState(false);
      el.playerPlaceholder.classList.remove('hidden');
      el.npTitle.textContent = '재생 중인 곡 없음';
      el.npSubtitle.textContent = '재생 대기 중';
      el.barTitle.textContent = '재생할 곡을 선택해주세요';
      el.barArtist.textContent = 'YouTube Player';
      if (el.mobileBarTitle) el.mobileBarTitle.textContent = '곡을 선택해주세요';
      if (el.mobileBarArtist) el.mobileBarArtist.textContent = 'YouTube Player';
      updateNowPlayingInfo(null);
    }
  } else if (appState.currentTrackIndex > index) {
    appState.currentTrackIndex--;
  }

  saveState();
  renderTracks();
  renderPlaylists();
}

/* ==================== 백업 & 복원 ==================== */
function exportBackup() {
  const data = {
    playlists: appState.playlists,
    exportedAt: new Date().toISOString()
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my_playlist_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.playlists && Array.isArray(parsed.playlists)) {
        appState.playlists = parsed.playlists;
        appState.activePlaylistId = parsed.playlists[0] ? parsed.playlists[0].id : null;
        appState.currentTrackIndex = -1;
        saveState();
        renderPlaylists();
        renderTracks();
        alert('플레이리스트 데이터를 성공적으로 복원했습니다!');
      } else {
        alert('올바른 백업 JSON 파일 형식이 아닙니다.');
      }
    } catch (err) {
      alert('파일을 읽는 중 오류가 발생했습니다: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/* ==================== ☁️ 기기 간 실시간 클라우드 동기화 (Method 2) ==================== */
let activeSyncRoomId = null;
let lastSyncedTimestamp = 0;
let syncPollingTimer = null;
let pushDebounceTimer = null;
let isSyncingNow = false;
let syncStatusTimeout = null;

const SYNC_STORAGE_KEY = 'my_yt_sync_room_code_v3';

function showSyncStatus(msg, type = 'info', timeout = 4000) {
  if (!el.syncStatusMsg) return;
  if (syncStatusTimeout) clearTimeout(syncStatusTimeout);

  el.syncStatusMsg.textContent = msg;
  el.syncStatusMsg.className = `status-msg ${type}`;
  el.syncStatusMsg.classList.remove('hidden');

  if (timeout > 0) {
    syncStatusTimeout = setTimeout(() => {
      if (el.syncStatusMsg) el.syncStatusMsg.classList.add('hidden');
    }, timeout);
  }
}

function updateSyncUI() {
  const isConnected = !!activeSyncRoomId;

  if (el.syncBadge) {
    if (isConnected) {
      el.syncBadge.classList.remove('hidden');
    } else {
      el.syncBadge.classList.add('hidden');
    }
  }

  if (el.syncBtnText) {
    el.syncBtnText.textContent = isConnected ? '동기화 관리 (연결됨)' : '기기 실시간 동기화';
  }

  if (isConnected) {
    if (el.syncDisconnectedView) el.syncDisconnectedView.classList.add('hidden');
    if (el.syncConnectedView) el.syncConnectedView.classList.remove('hidden');
    if (el.displaySyncCode) el.displaySyncCode.textContent = activeSyncRoomId;
  } else {
    if (el.syncDisconnectedView) el.syncDisconnectedView.classList.remove('hidden');
    if (el.syncConnectedView) el.syncConnectedView.classList.add('hidden');
  }
}

function openSyncModal() {
  if (el.syncModal) {
    el.syncModal.classList.remove('hidden');
    updateSyncUI();
    if (activeSyncRoomId) {
      pullStateFromCloud(false);
    }
  }
}

function closeSyncModal() {
  if (el.syncModal) {
    el.syncModal.classList.add('hidden');
    if (el.syncStatusMsg) el.syncStatusMsg.classList.add('hidden');
  }
}

// 데이터 직렬화 (초고속 전송 및 완전 복원 지원)
function serializeSyncPayload() {
  const cloudList = (appState.cloudPlaylists && appState.cloudPlaylists.length > 0) ? appState.cloudPlaylists : appState.playlists;
  return JSON.stringify({
    type: 'MY_PLAYLIST_SYNC',
    version: 2,
    updatedAt: Date.now(),
    activePlaylistId: appState.activePlaylistId,
    playlists: (cloudList || []).map(pl => ({
      id: pl.id,
      name: pl.name,
      createdAt: pl.createdAt || Date.now(),
      tracks: (pl.tracks || []).map(tr => {
        const vid = tr.videoId || tr.id;
        return {
          id: vid,
          videoId: vid,
          title: tr.title || 'YouTube 영상',
          author: tr.author || 'YouTube',
          thumbnail: tr.thumbnail || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`
        };
      })
    }))
  });
}

// 클라우드 업로드 (pastes.dev 기본, dpaste.com 폴백)
async function uploadSyncPayloadToCloud(jsonStr) {
  // 1순위: pastes.dev
  try {
    const res = await fetch('https://api.pastes.dev/post', {
      method: 'POST',
      headers: { 'Content-Type': 'text/json' },
      body: jsonStr
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.key) {
        return 'PL-' + data.key;
      }
    }
  } catch (e) {
    console.warn('pastes.dev upload error, trying dpaste fallback:', e);
  }

  // 2순위: dpaste.com 폴백
  try {
    const formData = new URLSearchParams();
    formData.append('content', jsonStr);
    formData.append('syntax', 'json');
    formData.append('expiry_days', '365');

    const res = await fetch('https://dpaste.com/api/v2/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });
    if (res.ok) {
      const urlText = await res.text();
      const trimmed = urlText.trim();
      const parts = trimmed.split('/');
      const key = parts[parts.length - 1] || parts[parts.length - 2];
      if (key) {
        return 'DP-' + key;
      }
    }
  } catch (e) {
    console.error('dpaste fallback error:', e);
  }

  throw new Error('클라우드 저장소에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
}

// 클라우드 다운로드
async function downloadSyncPayloadFromCloud(rawCode) {
  if (!rawCode) throw new Error('동기화 코드를 입력해주세요.');
  let cleanCode = rawCode.trim();

  // URL 형태 입력 처리 (?sync=... 또는 전체 링크)
  if (cleanCode.includes('sync=')) {
    try {
      const parsedUrl = new URL(cleanCode.startsWith('http') ? cleanCode : 'http://dummy.com/' + cleanCode);
      const extracted = parsedUrl.searchParams.get('sync');
      if (extracted) cleanCode = extracted.trim();
    } catch (e) {}
  }
  if (cleanCode.startsWith('https://pastes.dev/')) {
    cleanCode = cleanCode.replace('https://pastes.dev/', '').trim();
  }
  if (cleanCode.startsWith('https://dpaste.com/')) {
    cleanCode = 'DP-' + cleanCode.replace('https://dpaste.com/', '').replace('.txt', '').trim();
  }

  const isDpaste = /^DP-/i.test(cleanCode);
  const key = cleanCode.replace(/^(PL|DP)-/i, '').trim();

  if (!key) throw new Error('올바르지 않은 동기화 코드 형식입니다.');

  let textData = null;

  if (isDpaste) {
    try {
      const res = await fetch(`https://dpaste.com/${key}.txt`);
      if (res.ok) textData = await res.text();
    } catch (e) {}
  } else {
    // pastes.dev 우선 시도
    try {
      const res = await fetch(`https://api.pastes.dev/${key}`);
      if (res.ok) {
        textData = await res.text();
      }
    } catch (e) {}

    // 안되면 dpaste 시도
    if (!textData) {
      try {
        const res = await fetch(`https://dpaste.com/${key}.txt`);
        if (res.ok) {
          textData = await res.text();
        }
      } catch (e) {}
    }
  }

  if (!textData) {
    throw new Error('동기화 코드를 찾을 수 없습니다. 대소문자를 정확히 확인해주세요.');
  }

  const parsed = JSON.parse(textData);
  return { parsed, rawKey: cleanCode };
}

async function createSyncRoom() {
  if (isSyncingNow) return;
  isSyncingNow = true;

  if (el.btnCreateSyncRoom) {
    el.btnCreateSyncRoom.disabled = true;
    el.btnCreateSyncRoom.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 코드 생성 중...';
  }
  showSyncStatus('클라우드 동기화 코드를 안전하게 발급받고 있습니다...', 'info', 0);

  try {
    // 만약 클라우드 플레이리스트가 비어있다면 현재 로컬 플레이리스트를 복사하여 초기 클라우드 플리로 설정
    if (!appState.cloudPlaylists || appState.cloudPlaylists.length === 0) {
      appState.cloudPlaylists = (appState.playlists || []).map(pl => ({
        id: 'cpl-' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: pl.name,
        createdAt: pl.createdAt || Date.now(),
        tracks: (pl.tracks || []).map(tr => {
          const vid = tr.videoId || tr.id;
          return {
            id: vid,
            videoId: vid,
            title: tr.title,
            author: tr.author || 'YouTube',
            thumbnail: tr.thumbnail || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`
          };
        })
      }));
    }

    const jsonPayload = serializeSyncPayload();
    const roomCode = await uploadSyncPayloadToCloud(jsonPayload);

    activeSyncRoomId = roomCode;
    localStorage.setItem(SYNC_STORAGE_KEY, activeSyncRoomId);
    lastSyncedTimestamp = Date.now();
    updateSyncUI();
    renderPlaylists();
    startCloudSyncPolling();
    showSyncStatus(`동기화 코드가 발급되었습니다: ${roomCode}`, 'success', 5000);
  } catch (err) {
    console.error('Create sync room error:', err);
    showSyncStatus('동기화 코드 생성 실패: ' + err.message, 'error', 5000);
  } finally {
    isSyncingNow = false;
    if (el.btnCreateSyncRoom) {
      el.btnCreateSyncRoom.disabled = false;
      el.btnCreateSyncRoom.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> 새 동기화 코드 발급';
    }
  }
}

async function joinSyncRoom(inputRawCode) {
  if (isSyncingNow) return;
  if (!inputRawCode || !inputRawCode.trim()) {
    showSyncStatus('동기화 코드를 입력해주세요.', 'error', 3000);
    if (el.inputSyncCode) el.inputSyncCode.focus();
    return;
  }

  isSyncingNow = true;
  if (el.btnJoinSyncRoom) {
    el.btnJoinSyncRoom.disabled = true;
    el.btnJoinSyncRoom.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 연결 중...';
  }
  showSyncStatus('클라우드에서 플레이리스트를 불러오는 중입니다...', 'info', 0);

  try {
    const { parsed, rawKey } = await downloadSyncPayloadFromCloud(inputRawCode);

    if (parsed && Array.isArray(parsed.playlists)) {
      // 썸네일 완전 복원 및 데이터 매핑 (로컬 플레이리스트는 100% 보존!)
      appState.cloudPlaylists = parsed.playlists.map(pl => ({
        id: pl.id || `cpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: pl.name || '클라우드 플레이리스트',
        createdAt: pl.createdAt || Date.now(),
        tracks: (pl.tracks || []).map(tr => {
          const vid = tr.videoId || tr.id;
          return {
            id: vid,
            videoId: vid,
            title: tr.title || 'YouTube 영상',
            author: tr.author || 'YouTube',
            thumbnail: tr.thumbnail || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`
          };
        })
      }));

      // 클라우드 플레이리스트를 활성화
      if (appState.cloudPlaylists.length > 0) {
        appState.activePlaylistId = appState.cloudPlaylists[0].id;
      }
      appState.currentTrackIndex = -1;
      lastSyncedTimestamp = parsed.updatedAt || Date.now();
      activeSyncRoomId = rawKey.startsWith('PL-') || rawKey.startsWith('DP-') ? rawKey : 'PL-' + rawKey;
      localStorage.setItem(SYNC_STORAGE_KEY, activeSyncRoomId);

      renderPlaylists();
      renderTracks();
      updateSyncUI();
      startCloudSyncPolling();
      showSyncStatus('동기화 연결 성공! 클라우드 플레이리스트를 불러왔습니다.', 'success', 5000);
      if (el.inputSyncCode) el.inputSyncCode.value = '';
    } else {
      throw new Error('올바른 플레이리스트 형식이 아닙니다.');
    }
  } catch (err) {
    console.error('Join sync room error:', err);
    showSyncStatus(err.message, 'error', 5000);
  } finally {
    isSyncingNow = false;
    if (el.btnJoinSyncRoom) {
      el.btnJoinSyncRoom.disabled = false;
      el.btnJoinSyncRoom.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> 연결';
    }
  }
}

function scheduleCloudPush() {
  if (!activeSyncRoomId) return;
  if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
  pushDebounceTimer = setTimeout(() => {
    pushStateToCloud(false);
  }, 1500);
}

async function pushStateToCloud(showToast = false) {
  if (!activeSyncRoomId || isSyncingNow) return;
  isSyncingNow = true;

  if (showToast) {
    showSyncStatus('클라우드에 데이터를 올리는 중...', 'info', 0);
  }

  try {
    const jsonPayload = serializeSyncPayload();
    const newRoomCode = await uploadSyncPayloadToCloud(jsonPayload);
    
    if (newRoomCode) {
      activeSyncRoomId = newRoomCode;
      localStorage.setItem(SYNC_STORAGE_KEY, activeSyncRoomId);
      lastSyncedTimestamp = Date.now();
      updateSyncUI();
    }

    if (showToast) {
      showSyncStatus('클라우드에 최신 데이터가 성공적으로 반영되었습니다!', 'success', 3000);
    }
  } catch (err) {
    console.error('Push state error:', err);
    if (showToast) {
      showSyncStatus('클라우드 업로드 실패: ' + err.message, 'error', 4000);
    }
  } finally {
    isSyncingNow = false;
  }
}

async function pullStateFromCloud(showToast = false) {
  if (!activeSyncRoomId || isSyncingNow) return;
  isSyncingNow = true;

  if (showToast) {
    showSyncStatus('클라우드에서 최신 데이터를 가져오는 중...', 'info', 0);
  }

  try {
    const { parsed } = await downloadSyncPayloadFromCloud(activeSyncRoomId);

    if (parsed && Array.isArray(parsed.playlists)) {
      const remoteUpdatedAt = parsed.updatedAt || 0;
      if (remoteUpdatedAt > lastSyncedTimestamp) {
        appState.cloudPlaylists = parsed.playlists.map(pl => ({
          id: pl.id || `cpl_${Date.now()}`,
          name: pl.name || '클라우드 플레이리스트',
          createdAt: pl.createdAt || Date.now(),
          tracks: (pl.tracks || []).map(tr => {
            const vid = tr.videoId || tr.id;
            return {
              id: vid,
              videoId: vid,
              title: tr.title || 'YouTube 영상',
              author: tr.author || 'YouTube',
              thumbnail: tr.thumbnail || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`
            };
          })
        }));

        lastSyncedTimestamp = remoteUpdatedAt;
        renderPlaylists();
        renderTracks();

        if (showToast) {
          showSyncStatus('최신 클라우드 플레이리스트를 업데이트했습니다!', 'success', 3000);
        }
      } else if (showToast) {
        showSyncStatus('이미 최신 상태입니다.', 'info', 2500);
      }
    }
  } catch (err) {
    console.error('Pull state error:', err);
    if (showToast) {
      showSyncStatus('클라우드 다운로드 실패: ' + err.message, 'error', 4000);
    }
  } finally {
    isSyncingNow = false;
  }
}

function disconnectSyncRoom() {
  if (!confirm('정말 동기화를 해제하시겠습니까?\n\n* 내 로컬 플레이리스트는 100% 안전하게 유지됩니다.\n* 클라우드 동기화 연결만 해제됩니다.')) {
    return;
  }

  activeSyncRoomId = null;
  appState.cloudPlaylists = [];
  localStorage.removeItem(SYNC_STORAGE_KEY);
  if (syncPollingTimer) {
    clearInterval(syncPollingTimer);
    syncPollingTimer = null;
  }

  // 만약 선택된 플레이리스트가 클라우드였다면 로컬 플레이리스트로 복귀
  if (!getCurrentPlaylist() && appState.playlists && appState.playlists.length > 0) {
    appState.activePlaylistId = appState.playlists[0].id;
    appState.currentTrackIndex = -1;
  }

  updateSyncUI();
  renderPlaylists();
  renderTracks();
  showSyncStatus('동기화가 해제되었습니다. 로컬 플레이리스트 모드로 작동합니다.', 'info', 4000);
}

function copySyncCode() {
  if (!activeSyncRoomId) return;

  const codeText = activeSyncRoomId;
  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve();
    } catch (err) {
      document.body.removeChild(textArea);
      return Promise.reject(err);
    }
  };

  copyToClipboard(codeText).then(() => {
    if (el.btnCopySyncCode) {
      const originalHtml = el.btnCopySyncCode.innerHTML;
      el.btnCopySyncCode.innerHTML = '<i class="fa-solid fa-check"></i> 복사됨!';
      setTimeout(() => {
        if (el.btnCopySyncCode) el.btnCopySyncCode.innerHTML = originalHtml;
      }, 2000);
    }
    showSyncStatus('동기화 코드가 클립보드에 복사되었습니다!', 'success', 3000);
  }).catch(() => {
    showSyncStatus('코드 복사에 실패했습니다. 코드를 직접 복사해주세요.', 'error', 4000);
  });
}

function startCloudSyncPolling() {
  if (syncPollingTimer) clearInterval(syncPollingTimer);
  syncPollingTimer = setInterval(() => {
    if (activeSyncRoomId && document.visibilityState === 'visible') {
      pullStateFromCloud(false);
    }
  }, 15000);
}

function initCloudSync() {
  // 1. URL search param check (?sync=...)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const syncParam = urlParams.get('sync');
    if (syncParam && syncParam.trim()) {
      joinSyncRoom(syncParam.trim());
      return;
    }
  } catch (e) {}

  // 2. localStorage saved sync room
  const savedRoomId = localStorage.getItem(SYNC_STORAGE_KEY) || localStorage.getItem('my_yt_sync_room_id_v2');
  if (savedRoomId && savedRoomId.trim()) {
    activeSyncRoomId = savedRoomId.trim();
    updateSyncUI();
    pullStateFromCloud(false);
    startCloudSyncPolling();
  }
}

/* ==================== 프로토콜 검사 ==================== */
function checkProtocol() {
  if (window.location.protocol === 'file:') {
    el.protocolWarning.classList.remove('hidden');
  }
}

/* ==================== 이벤트 리스너 ==================== */
function setupEventListeners() {
  if (el.btnCloseWarning) {
    el.btnCloseWarning.addEventListener('click', () => {
      el.protocolWarning.classList.add('hidden');
    });
  }

  if (el.btnOpenSidebar) el.btnOpenSidebar.addEventListener('click', toggleSidebar);
  if (el.sidebarOverlay) el.sidebarOverlay.addEventListener('click', closeSidebar);
  if (el.btnMobileToggleView) el.btnMobileToggleView.addEventListener('click', toggleMobileView);

  el.btnCreatePlaylist.addEventListener('click', () => createNewPlaylist());
  if (el.btnQuickCreatePl) {
    el.btnQuickCreatePl.addEventListener('click', () => createNewPlaylist());
  }
  el.btnRenamePlaylist.addEventListener('click', renameCurrentPlaylist);
  el.btnDeletePlaylist.addEventListener('click', deleteCurrentPlaylist);

  el.formAddTrack.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = el.inputYoutubeUrl.value;
    addTrackFromUrl(url);
  });

  const togglePlayPause = () => {
    if (!ytPlayer || !isPlayerReady) return;
    if (appState.currentTrackIndex === -1) {
      const currentPl = getCurrentPlaylist();
      if (currentPl && currentPl.tracks.length > 0) {
        playTrackByIndex(0);
      }
      return;
    }

    try {
      if (appState.isPlaying) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    } catch (e) {}
  };

  el.btnPlayPause.addEventListener('click', togglePlayPause);
  if (el.btnMobilePlayPause) el.btnMobilePlayPause.addEventListener('click', togglePlayPause);

  el.btnPrev.addEventListener('click', playPrevTrack);
  el.btnNext.addEventListener('click', playNextTrack);
  if (el.btnMobilePrev) el.btnMobilePrev.addEventListener('click', playPrevTrack);
  if (el.btnMobileNext) el.btnMobileNext.addEventListener('click', playNextTrack);

  const toggleShuffle = () => {
    appState.settings.isShuffled = !appState.settings.isShuffled;
    updateShuffleUI();
    saveState();
  };
  el.btnShuffle.addEventListener('click', toggleShuffle);
  if (el.btnMobileShuffle) el.btnMobileShuffle.addEventListener('click', toggleShuffle);

  const toggleRepeat = () => {
    const modes = ['all', 'one', 'none'];
    const currentIdx = modes.indexOf(appState.settings.repeatMode);
    appState.settings.repeatMode = modes[(currentIdx + 1) % modes.length];
    updateRepeatUI();
    saveState();
  };
  el.btnRepeat.addEventListener('click', toggleRepeat);
  if (el.btnMobileRepeat) el.btnMobileRepeat.addEventListener('click', toggleRepeat);

  setupSeekbarDragEvents();

  if (el.volumeSlider) {
    el.volumeSlider.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value, 10);
      appState.settings.volume = vol;
      if (ytPlayer && isPlayerReady) {
        try {
          ytPlayer.setVolume(vol);
          if (ytPlayer.isMuted() && vol > 0) ytPlayer.unMute();
        } catch (e) {}
      }
      updateVolumeIcon(vol);
      saveState();
    });
  }

  const toggleMute = () => {
    if (!ytPlayer || !isPlayerReady) return;
    try {
      if (ytPlayer.isMuted()) {
        ytPlayer.unMute();
        if (el.volumeSlider) el.volumeSlider.value = appState.settings.volume || 80;
        updateVolumeIcon(appState.settings.volume || 80);
      } else {
        ytPlayer.mute();
        if (el.volumeSlider) el.volumeSlider.value = 0;
        updateVolumeIcon(0);
      }
    } catch (e) {}
  };

  el.btnMute.addEventListener('click', toggleMute);
  if (el.btnMobileMute) el.btnMobileMute.addEventListener('click', toggleMute);

  if (el.btnToggleVideo) {
    el.btnToggleVideo.addEventListener('click', () => {
      appState.settings.isVideoVisible = !appState.settings.isVideoVisible;
      updateVideoVisibilityUI();
      saveState();
    });
  }

  // 클립보드 붙여넣기 버튼
  if (el.btnPasteUrl) {
    el.btnPasteUrl.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text) {
            el.inputYoutubeUrl.value = text.trim();
            el.inputYoutubeUrl.focus();
          }
        } else {
          el.inputYoutubeUrl.focus();
        }
      } catch (err) {
        el.inputYoutubeUrl.focus();
      }
    });
  }

  // 백업 및 복원
  if (el.btnBackupData) el.btnBackupData.addEventListener('click', exportBackup);
  if (el.btnRestoreData) el.btnRestoreData.addEventListener('click', () => el.fileRestore.click());
  if (el.fileRestore) {
    el.fileRestore.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importBackup(e.target.files[0]);
      }
    });
  }

  // 플리만 보기 (감상 모드) 이벤트
  if (el.btnFocusMode) el.btnFocusMode.addEventListener('click', toggleFocusMode);
  if (el.btnFocusModeBar) el.btnFocusModeBar.addEventListener('click', toggleFocusMode);
  if (el.btnMobileFocus) el.btnMobileFocus.addEventListener('click', toggleFocusMode);
  if (el.btnCloseFocus) el.btnCloseFocus.addEventListener('click', closeFocusMode);
  if (el.btnFocusPlayPause) el.btnFocusPlayPause.addEventListener('click', togglePlayPause);
  if (el.btnFocusPrev) el.btnFocusPrev.addEventListener('click', playPrevTrack);
  if (el.btnFocusNext) el.btnFocusNext.addEventListener('click', playNextTrack);
  if (el.btnFocusShuffle) el.btnFocusShuffle.addEventListener('click', toggleShuffle);
  if (el.btnFocusRepeat) el.btnFocusRepeat.addEventListener('click', toggleRepeat);

  setupFocusSeekbarDragEvents();

  // 클라우드 기기 동기화 이벤트
  if (el.btnCloudSync) el.btnCloudSync.addEventListener('click', openSyncModal);
  if (el.btnCloseSyncModal) el.btnCloseSyncModal.addEventListener('click', closeSyncModal);
  if (el.syncModal) {
    el.syncModal.addEventListener('click', (e) => {
      if (e.target === el.syncModal) closeSyncModal();
    });
  }
  if (el.btnCreateSyncRoom) el.btnCreateSyncRoom.addEventListener('click', createSyncRoom);
  if (el.btnJoinSyncRoom) {
    el.btnJoinSyncRoom.addEventListener('click', () => {
      if (el.inputSyncCode) joinSyncRoom(el.inputSyncCode.value);
    });
  }
  if (el.btnPasteSyncCode) {
    el.btnPasteSyncCode.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text) {
            el.inputSyncCode.value = text.trim();
            el.inputSyncCode.focus();
          }
        } else {
          el.inputSyncCode.focus();
        }
      } catch (err) {
        el.inputSyncCode.focus();
      }
    });
  }
  if (el.inputSyncCode) {
    el.inputSyncCode.addEventListener('keydown', (e) => {
      if (e.code === 'Enter') {
        e.preventDefault();
        joinSyncRoom(el.inputSyncCode.value);
      }
    });
  }
  if (el.btnCopySyncCode) el.btnCopySyncCode.addEventListener('click', copySyncCode);
  if (el.btnManualSyncPush) el.btnManualSyncPush.addEventListener('click', () => pushStateToCloud(true));
  if (el.btnManualSyncPull) el.btnManualSyncPull.addEventListener('click', () => pullStateFromCloud(true));
  if (el.btnDisconnectSync) el.btnDisconnectSync.addEventListener('click', disconnectSyncRoom);

  // 화면 꺼짐 방지 토글 버튼
  if (el.btnWakeLock) {
    el.btnWakeLock.addEventListener('click', toggleWakeLock);
  }

  // 화면 복귀 및 탭 전환 시 자동 복구 & 동기화
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (activeSyncRoomId) {
        pullStateFromCloud(false);
      }
      if (appState.isPlaying) {
        requestScreenWakeLock();
        startSilentAudioDriver();
        if (ytPlayer && isPlayerReady) {
          try {
            const state = ytPlayer.getPlayerState();
            if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.UNSTARTED) {
              ytPlayer.playVideo();
            }
          } catch (e) {}
        }
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      if (el.syncModal && !el.syncModal.classList.contains('hidden')) {
        closeSyncModal();
        return;
      }
      if (isFocusModeOpen) {
        closeFocusMode();
        return;
      }
    }
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      togglePlayPause();
    }
  });

  setupMobileGestures();
}

/* ==================== 📱 모바일 스와이프 제스처 ==================== */
function setupMobileGestures() {
  // 1. 하단 플레이어 바 좌/우 스와이프 (이전곡 / 다음곡 넘기기)
  const mobileTopRow = document.querySelector('.mobile-player-top-row');
  if (mobileTopRow) {
    let touchStartX = 0;
    let touchStartY = 0;

    mobileTopRow.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    mobileTopRow.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;

        // 수평 스와이프 판정 (50px 이상 & 수평이 수직보다 클 때)
        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
          if (diffX < 0) {
            // 왼쪽으로 스와이프 -> 다음 곡
            playNextTrack();
          } else {
            // 오른쪽으로 스와이프 -> 이전 곡
            playPrevTrack();
          }
        }
      }
    }, { passive: true });
  }

  // 2. 사이드바 좌측 스와이프로 닫기
  if (el.sidebar) {
    let sbStartX = 0;
    el.sidebar.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) sbStartX = e.touches[0].clientX;
    }, { passive: true });

    el.sidebar.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const diffX = e.changedTouches[0].clientX - sbStartX;
        if (diffX < -60) {
          closeSidebar();
        }
      }
    }, { passive: true });
  }

  // 3. 화면 왼쪽 끝에서 오른쪽으로 스와이프 시 사이드바 열기
  let edgeStartX = 0;
  let isEdgeSwiping = false;

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1 && e.touches[0].clientX < 30) {
      edgeStartX = e.touches[0].clientX;
      isEdgeSwiping = true;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isEdgeSwiping && e.touches.length === 1) {
      if (e.touches[0].clientX - edgeStartX > 50) {
        openSidebar();
        isEdgeSwiping = false;
      }
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isEdgeSwiping = false;
  }, { passive: true });
}

/* ==================== 초기화 ==================== */
function init() {
  checkProtocol();
  loadState();
  initTopSoundWaveform();
  setupEventListeners();
  renderPlaylists();
  renderTracks();
  updateRepeatUI();
  updateShuffleUI();
  updateNowPlayingInfo(null);
  updateVideoVisibilityUI();
  initCloudSync();
}

document.addEventListener('DOMContentLoaded', init);
