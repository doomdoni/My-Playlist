/**
 * YouTube Playlist Web App
 * My Playlist - 완벽한 슬라이드 메뉴 및 유튜브 플레이어
 */

const DEFAULT_DATA = {
  playlists: [],
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
  colorCanvas: document.getElementById('color-canvas')
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

function saveState() {
  try {
    const dataToSave = {
      playlists: appState.playlists,
      activePlaylistId: appState.activePlaylistId,
      settings: appState.settings
    };
    localStorage.setItem('my_yt_playlist_hub_v2', JSON.stringify(dataToSave));
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
  try {
    const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.title) {
        return {
          title: data.title,
          author: data.author_name || 'YouTube',
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
      }
    }
  } catch (e) {}

  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (response.ok) {
      const data = await response.json();
      if (data.title) {
        return {
          title: data.title,
          author: data.author_name || 'YouTube',
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
      }
    }
  } catch (e) {}

  return {
    title: `YouTube 영상 (${videoId})`,
    author: 'YouTube',
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  };
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
  if (videoColorCache.has(videoId)) {
    const cached = videoColorCache.get(videoId);
    applyColorToCSS(cached.color1, cached.color2, cached.glowStr, cached.gradStr);
    return;
  }

  // 빠른 즉각 반응을 위한 해시 기반 기본 색상 즉시 적용 (0ms)
  fallbackColorFromId(videoId);

  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = thumbnailUrl;

  img.onload = function() {
    try {
      const ctx = el.colorCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 10, 10);
      const data = ctx.getImageData(0, 0, 10, 10).data;
      
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
        if (brightness > 30 && brightness < 230) {
          r += data[i];
          g += data[i+1];
          b += data[i+2];
          count++;
        }
      }

      if (count > 0) {
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
      } else {
        const hash = videoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        r = (hash * 37) % 200 + 55;
        g = (hash * 59) % 200 + 55;
        b = (hash * 83) % 200 + 55;
      }

      const maxVal = Math.max(r, g, b);
      if (maxVal < 140) {
        const factor = 170 / (maxVal || 1);
        r = Math.min(255, Math.floor(r * factor));
        g = Math.min(255, Math.floor(g * factor));
        b = Math.min(255, Math.floor(b * factor));
      }

      const r2 = (r + 60) % 255;
      const g2 = (g + 80) % 255;
      const b2 = (b + 110) % 255;

      const color1 = `rgb(${r}, ${g}, ${b})`;
      const color2 = `rgb(${r2}, ${g2}, ${b2})`;
      const glowStr = `rgba(${r}, ${g}, ${b}, 0.45)`;
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
  const hue2 = (hue1 + 50) % 360;
  
  const color1 = `hsl(${hue1}, 85%, 60%)`;
  const color2 = `hsl(${hue2}, 85%, 60%)`;
  const glowStr = `hsla(${hue1}, 85%, 60%, 0.4)`;
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

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    appState.isPlaying = true;
    updatePlayPauseUI(true);
    startProgressTimer();
    setVisualizerState(true);
    preloadUpcomingTracks();
  } else if (event.data === YT.PlayerState.PAUSED) {
    appState.isPlaying = false;
    updatePlayPauseUI(false);
    stopProgressTimer();
    setVisualizerState(false);
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

/* ==================== 재생바 위 파형 ==================== */
function initTopSoundWaveform() {
  if (!el.topSoundWaveform) return;
  el.topSoundWaveform.innerHTML = '';
  const barCount = 42;
  for (let i = 0; i < barCount; i++) {
    const stick = document.createElement('div');
    stick.className = 'wave-stick';
    const randomDuration = (0.5 + Math.random() * 0.7).toFixed(2);
    const randomDelay = (Math.random() * 0.5).toFixed(2);
    stick.style.animationDuration = `${randomDuration}s`;
    stick.style.animationDelay = `${randomDelay}s`;
    el.topSoundWaveform.appendChild(stick);
  }
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
  appState.isPlaying = true;
  updatePlayPauseUI(true);
  setVisualizerState(true);

  extractAndApplyVideoColor(track.thumbnail, track.id);
  updateNowPlayingInfo(track);
  highlightActiveTrack();

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

/* ==================== 60fps 프로그레스 & 스와이프 탐색 ==================== */
function startProgressTimer() {
  stopProgressTimer();
  progressUpdateTimer = setInterval(() => {
    if (!ytPlayer || !isPlayerReady || isDraggingSeekbar) return;
    try {
      const curTime = ytPlayer.getCurrentTime() || 0;
      const duration = ytPlayer.getDuration() || 0;

      el.timeCurrent.textContent = formatTime(curTime);
      el.timeTotal.textContent = formatTime(duration);

      if (duration > 0) {
        const percentage = (curTime / duration) * 100;
        el.progressFilled.style.width = `${percentage}%`;
      } else {
        el.progressFilled.style.width = '0%';
      }
    } catch (e) {}
  }, 350);
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
function getCurrentPlaylist() {
  return appState.playlists.find(p => p.id === appState.activePlaylistId);
}

function renderPlaylists() {
  el.playlistList.innerHTML = '';

  if (appState.playlists.length === 0) {
    el.sidebarEmptyMsg.classList.remove('hidden');
    el.headerActions.classList.add('hidden');
    return;
  }

  el.sidebarEmptyMsg.classList.add('hidden');
  el.headerActions.classList.remove('hidden');

  appState.playlists.forEach(pl => {
    const li = document.createElement('li');
    li.className = `playlist-item ${pl.id === appState.activePlaylistId ? 'active' : ''}`;
    li.innerHTML = `
      <div class="playlist-item-left">
        <i class="fa-solid fa-compact-disc"></i>
        <span>${escapeHtml(pl.name)}</span>
      </div>
      <span class="playlist-item-count">${pl.tracks.length}곡</span>
    `;
    li.addEventListener('click', () => {
      selectPlaylist(pl.id);
      closeSidebar();
    });
    el.playlistList.appendChild(li);
  });
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

  el.headerActions.classList.remove('hidden');
  el.currentPlaylistTitle.textContent = currentPl.name;
  el.currentPlaylistMeta.textContent = `총 ${currentPl.tracks.length}개의 트랙`;

  if (currentPl.tracks.length === 0) {
    el.emptyTrackMsg.classList.remove('hidden');
    el.emptyStateText.innerHTML = `<strong>'${escapeHtml(currentPl.name)}'</strong> 플레이리스트가 비어있습니다.<br>상단 입력창에 유튜브 링크를 붙여넣어 노래를 추가해보세요!`;
    return;
  } else {
    el.emptyTrackMsg.classList.add('hidden');
  }

  currentPl.tracks.forEach((track, idx) => {
    const li = document.createElement('li');
    li.className = `track-item ${idx === appState.currentTrackIndex ? 'active' : ''}`;
    li.innerHTML = `
      <div class="drag-handle" title="드래그하여 순서 변경">
        <i class="fa-solid fa-grip-vertical"></i>
      </div>
      <div class="track-index">${idx + 1}</div>
      <div class="track-info">
        <img class="track-thumb" src="${track.thumbnail}" alt="thumb" onerror="this.src='https://i.ytimg.com/vi/${track.id}/hqdefault.jpg'">
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

  el.npTitle.textContent = track.title;
  el.npSubtitle.textContent = '재생 중';
  
  if (el.npThumbnail) {
    el.npThumbnail.src = track.thumbnail;
    el.npThumbnail.classList.remove('hidden');
  }
  if (el.npPlaceholderIcon) el.npPlaceholderIcon.classList.add('hidden');

  const currentPl = getCurrentPlaylist();
  const plName = currentPl ? currentPl.name : 'YouTube Playlist';

  // 데스크탑 하단 바
  el.barTitle.textContent = track.title;
  el.barArtist.textContent = plName;
  if (el.barThumb) {
    el.barThumb.src = track.thumbnail;
    el.barThumb.classList.remove('hidden');
  }
  if (el.desktopPlaceholderIcon) el.desktopPlaceholderIcon.classList.add('hidden');

  // 모바일 하단 바
  if (el.mobileBarTitle) el.mobileBarTitle.textContent = track.title;
  if (el.mobileBarArtist) el.mobileBarArtist.textContent = plName;
  if (el.mobileBarThumb) {
    el.mobileBarThumb.src = track.thumbnail;
    el.mobileBarThumb.classList.remove('hidden');
  }
  if (el.mobilePlaceholderIcon) el.mobilePlaceholderIcon.classList.add('hidden');
}

function updatePlayPauseUI(isPlaying) {
  const iconClass = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  if (el.iconPlayPause) el.iconPlayPause.className = iconClass;
  if (el.iconMobilePlayPause) el.iconMobilePlayPause.className = iconClass;
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
}

function updateShuffleUI() {
  const isShuffled = appState.settings.isShuffled;
  if (el.btnShuffle) el.btnShuffle.classList.toggle('active', isShuffled);
  if (el.btnMobileShuffle) el.btnMobileShuffle.classList.toggle('active', isShuffled);
}

function updateVolumeIcon(vol) {
  let iconClass = 'fa-solid fa-volume-high';
  if (vol === 0) iconClass = 'fa-solid fa-volume-xmark';
  else if (vol < 50) iconClass = 'fa-solid fa-volume-low';

  if (el.iconVolume) el.iconVolume.className = iconClass;
  if (el.iconMobileVolume) el.iconMobileVolume.className = iconClass;
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

function createNewPlaylist(defaultName) {
  const defaultTitle = defaultName || `내 플레이리스트 ${appState.playlists.length + 1}`;
  const name = prompt('새 플레이리스트 이름을 입력하세요:', defaultTitle);
  if (!name || !name.trim()) return null;

  const newPl = {
    id: 'pl-' + Date.now(),
    name: name.trim(),
    tracks: []
  };

  appState.playlists.push(newPl);
  selectPlaylist(newPl.id);
  saveState();
  closeSidebar();
  return newPl;
}

function renameCurrentPlaylist() {
  const currentPl = getCurrentPlaylist();
  if (!currentPl) return;

  const newName = prompt('플레이리스트 이름을 변경하세요:', currentPl.name);
  if (!newName || !newName.trim()) return;

  currentPl.name = newName.trim();
  saveState();
  renderPlaylists();
  renderTracks();
}

function deleteCurrentPlaylist() {
  const currentPl = getCurrentPlaylist();
  if (!currentPl) return;

  if (confirm(`'${currentPl.name}' 플레이리스트를 삭제하시겠습니까?`)) {
    appState.playlists = appState.playlists.filter(p => p.id !== currentPl.id);
    appState.activePlaylistId = appState.playlists[0] ? appState.playlists[0].id : null;
    appState.currentTrackIndex = -1;
    saveState();
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
    const created = createNewPlaylist('🎵 나의 첫 플레이리스트');
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
      title: meta.title,
      thumbnail: meta.thumbnail
    };

    currentPl.tracks.push(newTrack);
    saveState();
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

  el.btnToggleVideo.addEventListener('click', () => {
    appState.settings.isVideoVisible = !appState.settings.isVideoVisible;
    if (appState.settings.isVideoVisible) {
      el.videoWrapper.classList.remove('minimized');
      el.btnToggleVideo.classList.remove('active');
    } else {
      el.videoWrapper.classList.add('minimized');
      el.btnToggleVideo.classList.add('active');
    }
    saveState();
  });

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

  window.addEventListener('keydown', (e) => {
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
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1 && e.touches[0].clientX < 25) {
      const startX = e.touches[0].clientX;
      const onEdgeMove = (moveEvt) => {
        if (moveEvt.touches.length === 1 && moveEvt.touches[0].clientX - startX > 60) {
          openSidebar();
          window.removeEventListener('touchmove', onEdgeMove);
        }
      };
      window.addEventListener('touchmove', onEdgeMove, { passive: true, once: true });
    }
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
  
  if (!appState.settings.isVideoVisible) {
    el.videoWrapper.classList.add('minimized');
    el.btnToggleVideo.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', init);
