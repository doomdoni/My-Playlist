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

  // 일괄 선택 및 편집 관련 요소
  tracksSection: document.getElementById('tracks-section'),
  btnToggleSelectMode: document.getElementById('btn-toggle-select-mode'),
  trackCountBadge: document.getElementById('track-count-badge'),
  batchActionBar: document.getElementById('batch-action-bar'),
  chkSelectAllTracks: document.getElementById('chk-select-all-tracks'),
  batchSelectedCount: document.getElementById('batch-selected-count'),
  btnBatchMoveUp: document.getElementById('btn-batch-move-up'),
  btnBatchMoveDown: document.getElementById('btn-batch-move-down'),
  btnBatchMoveTop: document.getElementById('btn-batch-move-top'),
  btnBatchMoveBottom: document.getElementById('btn-batch-move-bottom'),
  btnBatchDelete: document.getElementById('btn-batch-delete'),
  colHeaderCheck: document.getElementById('col-header-check'),
  
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

  // 사이트 전체화면 요소들
  btnFullscreenSite: document.getElementById('btn-fullscreen-site'),
  iconFullscreenSite: document.getElementById('icon-fullscreen-site'),
  btnNavFullscreen: document.getElementById('btn-nav-fullscreen'),
  iconNavFullscreen: document.getElementById('icon-nav-fullscreen'),
  btnMobileFullscreen: document.getElementById('btn-mobile-fullscreen'),
  iconMobileFullscreen: document.getElementById('icon-mobile-fullscreen'),

  // 플리만 보기 (감상 모드) 요소들
  btnFocusMode: document.getElementById('btn-focus-mode'),
  btnFocusModeBar: document.getElementById('btn-focus-mode-bar'),
  btnMobileFocus: document.getElementById('btn-mobile-focus'),
  focusOverlay: document.getElementById('focus-mode-overlay'),
  btnCloseFocus: document.getElementById('btn-close-focus'),
  btnFocusFullscreen: document.getElementById('btn-focus-fullscreen'),
  iconFocusFullscreen: document.getElementById('icon-focus-fullscreen'),
  focusPlName: document.getElementById('focus-pl-name'),
  focusBadge: document.getElementById('focus-badge'),
  focusCarouselViewport: document.getElementById('focus-carousel-viewport'),
  focusTrackList: document.getElementById('focus-track-list'),
  btnFocusPlayPause: document.getElementById('btn-focus-play-pause'),
  iconFocusPlayPause: document.getElementById('icon-focus-play-pause'),
  btnFocusPrev: document.getElementById('btn-focus-prev'),
  btnFocusNext: document.getElementById('btn-focus-next'),
  btnFocusShuffle: document.getElementById('btn-focus-shuffle'),
  btnFocusRepeat: document.getElementById('btn-focus-repeat'),
  focusRepeatBadge: document.getElementById('focus-repeat-badge'),
  focusProgressBar: document.getElementById('focus-progress-bar'),
  focusProgressFilled: document.getElementById('focus-progress-filled'),
  focusTimeCurrent: document.getElementById('focus-time-current'),
  focusTimeTotal: document.getElementById('focus-time-total'),
  btnFocusMute: document.getElementById('btn-focus-mute'),
  iconFocusVolume: document.getElementById('icon-focus-volume'),
  focusVolumeSlider: document.getElementById('focus-volume-slider'),

  // 실시간 가사 싱크 요소들
  btnFocusLyrics: document.getElementById('btn-focus-lyrics'),
  iconFocusLyrics: document.getElementById('icon-focus-lyrics'),
  btnBarLyrics: document.getElementById('btn-bar-lyrics'),
  btnMobileLyrics: document.getElementById('btn-mobile-lyrics'),
  focusLyricsViewport: document.getElementById('focus-lyrics-viewport'),
  focusLyricsTitle: document.getElementById('focus-lyrics-title'),
  focusLyricsArtist: document.getElementById('focus-lyrics-artist'),
  btnLyricsOffsetMinus2: document.getElementById('btn-lyrics-offset-minus-2'),
  btnLyricsOffsetMinus: document.getElementById('btn-lyrics-offset-minus'),
  btnLyricsOffsetPlus: document.getElementById('btn-lyrics-offset-plus'),
  btnLyricsOffsetPlus2: document.getElementById('btn-lyrics-offset-plus-2'),
  btnLyricsOffsetReset: document.getElementById('btn-lyrics-offset-reset'),
  lyricsOffsetVal: document.getElementById('lyrics-offset-val'),
  btnLyricsSearchToggle: document.getElementById('btn-lyrics-search-toggle'),
  btnLyricsCustomToggle: document.getElementById('btn-lyrics-custom-toggle'),
  focusLyricsCustomPanel: document.getElementById('focus-lyrics-custom-panel'),
  btnCloseLyricsCustom: document.getElementById('btn-close-lyrics-custom'),
  textareaCustomLyrics: document.getElementById('textarea-custom-lyrics'),
  btnCustomLyricsSave: document.getElementById('btn-custom-lyrics-save'),
  btnCustomLyricsDelete: document.getElementById('btn-custom-lyrics-delete'),
  focusLyricsSearchBox: document.getElementById('focus-lyrics-search-box'),
  inputLyricsQuery: document.getElementById('input-lyrics-query'),
  btnLyricsQuerySubmit: document.getElementById('btn-lyrics-query-submit'),
  btnLyricsSettingsToggle: document.getElementById('btn-lyrics-settings-toggle'),
  focusLyricsSettingsPanel: document.getElementById('focus-lyrics-settings-panel'),
  btnCloseLyricsSettings: document.getElementById('btn-close-lyrics-settings'),
  btnLyricsFontSmaller: document.getElementById('btn-lyrics-font-smaller'),
  btnLyricsFontNormal: document.getElementById('btn-lyrics-font-normal'),
  btnLyricsFontLarger: document.getElementById('btn-lyrics-font-larger'),
  focusLyricsScroll: document.getElementById('focus-lyrics-scroll'),
  focusLyricsList: document.getElementById('focus-lyrics-list'),

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
  syncStatusMsg: document.getElementById('sync-status-msg'),

  // ☁️ 연동할 플레이리스트 선택 뷰 요소
  syncSelectPlaylistsView: document.getElementById('sync-select-playlists-view'),
  btnSyncSelectAll: document.getElementById('btn-sync-select-all'),
  btnSyncDeselectAll: document.getElementById('btn-sync-deselect-all'),
  syncPlaylistChecklist: document.getElementById('sync-playlist-checklist'),
  btnCancelSyncSelect: document.getElementById('btn-cancel-sync-select'),
  btnConfirmCreateSync: document.getElementById('btn-confirm-create-sync'),
  syncSelectedCountLabel: document.getElementById('sync-selected-count-label')
};

/* ==================== 🧹 플레이리스트 중복 제거 및 이름 정규화 유틸 ==================== */
function cleanPlaylistName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.replace(/\s*\((?:로컬|보존됨)\)+$/gi, '').trim();
}

function deduplicateLocalPlaylists() {
  if (!appState.playlists || !Array.isArray(appState.playlists) || appState.playlists.length <= 1) return;

  const map = new Map();
  const result = [];

  for (const pl of appState.playlists) {
    if (!pl) continue;
    const clean = cleanPlaylistName(pl.name);
    pl.name = clean; // 이름 정규화

    if (!map.has(clean)) {
      map.set(clean, pl);
      result.push(pl);
    } else {
      // 이미 동일한 이름의 플레이리스트가 존재하면: 곡 병합 (중복 곡 제외)
      const existing = map.get(clean);
      const existingTracks = existing.tracks || [];
      const currentTracks = pl.tracks || [];

      const seenIds = new Set(existingTracks.map(t => t.videoId || t.id));
      currentTracks.forEach(t => {
        const vid = t.videoId || t.id;
        if (vid && !seenIds.has(vid)) {
          seenIds.add(vid);
          existingTracks.push(t);
        }
      });
      existing.tracks = existingTracks;
    }
  }

  appState.playlists = result;

  // 활성 플레이리스트 검증
  if (appState.activePlaylistId && !appState.playlists.some(p => p.id === appState.activePlaylistId)) {
    appState.activePlaylistId = appState.playlists[0] ? appState.playlists[0].id : null;
  }
}

/* ==================== 데이터 영속성 (LocalStorage) ==================== */
function loadState() {
  try {
    const saved = localStorage.getItem('my_yt_playlist_hub_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      appState.playlists = parsed.playlists || [];

      // 🧹 기존에 중복 생성되었던 모든 복제 플리 일괄 정리 및 병합
      deduplicateLocalPlaylists();

      appState.activePlaylistId = parsed.activePlaylistId || (appState.playlists[0] ? appState.playlists[0].id : null);
      if (appState.playlists.length > 0 && !appState.playlists.some(p => p.id === appState.activePlaylistId)) {
        appState.activePlaylistId = appState.playlists[0].id;
      }
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

/* ==================== 유연하고 안전한 YouTube ID 추출 (모든 링크 및 모바일 공유 포맷 지원) ==================== */
function extractStrictYouTubeId(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const trimmed = inputUrl.trim();

  // 1. 순수 11자리 비디오 ID 직접 입력 (예: JGwWNGJdvx8)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. watch?v= (youtube.com, music.youtube.com, m.youtube.com, youtube-nocookie.com 등)
  const watchMatch = trimmed.match(/(?:youtube(?:-nocookie)?\.com|music\.youtube\.com|m\.youtube\.com)\/watch\?(?:[^&\s]*&)*v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // 3. youtu.be/ (모바일 공유 링크, 파라미터 포함)
  const youtuMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuMatch && youtuMatch[1]) return youtuMatch[1];

  // 4. shorts/ 또는 live/ 또는 embed/
  const pathMatch = trimmed.match(/(?:youtube(?:-nocookie)?\.com|music\.youtube\.com|m\.youtube\.com)\/(?:shorts|live|embed|v)\/([a-zA-Z0-9_-]{11})/i);
  if (pathMatch && pathMatch[1]) return pathMatch[1];

  return null;
}

async function fetchVideoMetadata(videoId) {
  const defaultResult = {
    title: `YouTube 영상 (${videoId})`,
    author: 'YouTube',
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  };

  // 1. 로컬 초고속 프록시 (/api/youtube-meta) 최우선 조회 (CORS 없음, 30ms 초고속)
  try {
    const localRes = await fetch(`/api/youtube-meta?v=${encodeURIComponent(videoId)}`);
    if (localRes.ok) {
      const localData = await localRes.json();
      if (localData && localData.success && localData.title) {
        return {
          title: localData.title,
          author: localData.author || 'YouTube',
          thumbnail: localData.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
      }
    }
  } catch (e) {}

  const fetchWithTimeout = async (url, timeoutMs = 1800) => {
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
    const noembedData = await fetchWithTimeout(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, 1800);
    if (noembedData && noembedData.title) {
      return {
        title: noembedData.title,
        author: noembedData.author_name || 'YouTube',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      };
    }
  } catch (e) {}

  try {
    const oembedData = await fetchWithTimeout(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, 1800);
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
    host: 'https://www.youtube-nocookie.com', // 🛡️ 쿠키 및 맞춤형 광고 트래커 원천 차단 (광고 빈도 최소화)
    playerVars: {
      playsinline: 1,
      autoplay: 1,
      controls: 1,
      rel: 0,
      enablejsapi: 1,
      modestbranding: 1,
      origin: originUrl,
      widget_referrer: originUrl,
      iv_load_policy: 3, // 영상 내 배너 주석 및 프로모션 카드 비활성화
      cc_load_policy: 0, // 불필요한 광고/자막 로드 차단
      fs: 1,
      disablekb: 0
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
  if (el.focusVolumeSlider) el.focusVolumeSlider.value = appState.settings.volume;
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

let lastMediaSessionSec = -1;
let isUserInitiatedPause = false;

// 10초 무음 PCM WAV Blob 생성 (모바일 및 백그라운드 잠금화면 AudioSession 유지용)
function initSilentAudioDriver() {
  if (!el.silentAudioDriver) {
    el.silentAudioDriver = document.getElementById('silent-audio-driver');
  }
  if (!el.silentAudioDriver) return;
  try {
    const sampleRate = 8000;
    const durationSec = 10;
    const numSamples = sampleRate * durationSec;
    const buffer = new ArrayBuffer(44 + numSamples);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate, true);
    view.setUint16(32, 1, true);
    view.setUint16(34, 8, true); // 8-bit
    writeStr(36, 'data');
    view.setUint32(40, numSamples, true);

    const samples = new Uint8Array(buffer, 44, numSamples);
    samples.fill(128); // 8-bit silence

    const blob = new Blob([buffer], { type: 'audio/wav' });
    el.silentAudioDriver.src = URL.createObjectURL(blob);
    el.silentAudioDriver.loop = true;
    el.silentAudioDriver.volume = 0.01;
  } catch (e) {
    console.warn('initSilentAudioDriver error:', e);
  }
}

function startSilentAudioDriver() {
  if (!el.silentAudioDriver) {
    el.silentAudioDriver = document.getElementById('silent-audio-driver');
  }
  if (el.silentAudioDriver) {
    try {
      if (!el.silentAudioDriver.src || el.silentAudioDriver.src === '' || el.silentAudioDriver.src.startsWith('data:')) {
        initSilentAudioDriver();
      }
      el.silentAudioDriver.play().catch(() => {});
    } catch (e) {}
  }
}

function pauseSilentAudioDriver() {
  if (!el.silentAudioDriver) {
    el.silentAudioDriver = document.getElementById('silent-audio-driver');
  }
  if (el.silentAudioDriver) {
    try {
      el.silentAudioDriver.pause();
    } catch (e) {}
  }
}

// 최초 사용자 제스처(터치/클릭) 시 모바일 브라우저 오디오 세션 즉각 언락
const unlockAudioOnGesture = () => {
  startSilentAudioDriver();
  window.removeEventListener('click', unlockAudioOnGesture);
  window.removeEventListener('touchstart', unlockAudioOnGesture);
};
window.addEventListener('click', unlockAudioOnGesture, { once: true });
window.addEventListener('touchstart', unlockAudioOnGesture, { once: true });

// 📱 [잠금화면 미디어 컨트롤러 완벽 연동]
function updateMediaSession(track) {
  if (!('mediaSession' in navigator) || !track) return;
  try {
    const currentPl = getCurrentPlaylist();
    const plName = currentPl ? currentPl.name : 'My Playlist';
    const artistName = track.author || plName || 'YouTube Music';
    const vid = track.videoId || track.id;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: artistName,
      album: plName,
      artwork: [
        { src: `https://i.ytimg.com/vi/${vid}/default.jpg`, sizes: '120x90', type: 'image/jpeg' },
        { src: `https://i.ytimg.com/vi/${vid}/mqdefault.jpg`, sizes: '320x180', type: 'image/jpeg' },
        { src: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' },
        { src: `https://i.ytimg.com/vi/${vid}/sddefault.jpg`, sizes: '640x480', type: 'image/jpeg' },
        { src: `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`, sizes: '1280x720', type: 'image/jpeg' },
        { src: track.thumbnail || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.playbackState = appState.isPlaying ? 'playing' : 'paused';

    const safeSetAction = (action, handler) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {}
    };

    // 1. 재생
    safeSetAction('play', () => {
      playCurrentTrack();
    });

    // 2. 일시정지
    safeSetAction('pause', () => {
      pauseCurrentTrack();
    });

    // 3. 이전곡
    safeSetAction('previoustrack', () => {
      playPrevTrack();
    });

    // 4. 다음곡
    safeSetAction('nexttrack', () => {
      playNextTrack();
    });

    // 5. 시크바 탐색
    safeSetAction('seekto', (details) => {
      if (details.seekTime !== undefined && ytPlayer && isPlayerReady) {
        ytPlayer.seekTo(details.seekTime, true);
        lastMediaSessionSec = -1;
        updateMediaSessionPositionState();
      }
    });

    // 6. 10초 뒤로 가기
    safeSetAction('seekbackward', (details) => {
      if (!ytPlayer || !isPlayerReady) return;
      const cur = ytPlayer.getCurrentTime() || 0;
      const offset = (details && details.seekOffset) ? details.seekOffset : 10;
      ytPlayer.seekTo(Math.max(0, cur - offset), true);
      lastMediaSessionSec = -1;
      updateMediaSessionPositionState();
    });

    // 7. 10초 앞으로 가기
    safeSetAction('seekforward', (details) => {
      if (!ytPlayer || !isPlayerReady) return;
      const cur = ytPlayer.getCurrentTime() || 0;
      const dur = ytPlayer.getDuration() || 0;
      const offset = (details && details.seekOffset) ? details.seekOffset : 10;
      ytPlayer.seekTo(Math.min(dur, cur + offset), true);
      lastMediaSessionSec = -1;
      updateMediaSessionPositionState();
    });

    // 8. 정지
    safeSetAction('stop', () => {
      pauseCurrentTrack();
    });

    lastMediaSessionSec = -1;
    updateMediaSessionPositionState();
  } catch (err) {
    console.warn('updateMediaSession error:', err);
  }
}

function updateMediaSessionPositionState() {
  if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
  if (!ytPlayer || !isPlayerReady) return;
  try {
    const duration = ytPlayer.getDuration() || 0;
    const curTime = ytPlayer.getCurrentTime() || 0;
    const currentSec = Math.floor(curTime);

    if (currentSec !== lastMediaSessionSec && duration > 0 && curTime >= 0 && curTime <= duration) {
      lastMediaSessionSec = currentSec;
      const rate = (ytPlayer.getPlaybackRate && typeof ytPlayer.getPlaybackRate === 'function') ? ytPlayer.getPlaybackRate() : 1;
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: rate || 1,
        position: Math.min(curTime, duration)
      });
    }
  } catch (e) {}
}

let isAdPlaying = false;
let adWatchdogTimer = null;
let adDetectionFailCount = 0;

// 🛡️ [광고 방어 및 무음 가드 엔진]
// 잘못된 duration 추정으로 인한 무한 광고 루프와 오탐을 원천 차단하고,
// 유튜브가 공식 제공하는 광고 상태 플래그를 정밀 감지하여 광고 구간 동안 무음 처리 및 안전하게 복구합니다.
function checkAndHandleAdStream() {
  if (!ytPlayer || !isPlayerReady) return false;
  try {
    let isAd = false;

    // 1. YouTube Iframe 내부 getVideoData().isAd 확인 (공식 비공개 API 플래그)
    if (typeof ytPlayer.getVideoData === 'function') {
      const vData = ytPlayer.getVideoData();
      if (vData && vData.isAd === true) {
        isAd = true;
      }
    }

    // 2. getPlayerResponse의 공식 광고 슬롯 정보 확인
    if (!isAd && typeof ytPlayer.getPlayerResponse === 'function') {
      const resp = ytPlayer.getPlayerResponse();
      if (resp && (resp.adPlacements?.length > 0 || resp.adSlots?.length > 0)) {
        // 현재 재생 중인 시점이 광고 슬롯에 해당하는지 확인
        const curTime = ytPlayer.getCurrentTime() || 0;
        if (curTime < 1) {
          isAd = true;
        }
      }
    }

    // 3. 광고 상태 전환 처리
    if (isAd) {
      if (!isAdPlaying) {
        isAdPlaying = true;
        adDetectionFailCount = 0;
        try {
          ytPlayer.mute(); // 광고 소리 즉각 무음 처리
          // 4배속으로 안전하게 가속 (16배속이나 임의 seekTo는 유튜브 광고 차단 감지 트리거를 유발하므로 4배속 사용)
          if (typeof ytPlayer.setPlaybackRate === 'function') {
            ytPlayer.setPlaybackRate(2);
          }
        } catch (e) {}
      }
      return true;
    } else if (isAdPlaying) {
      // 광고가 끝나고 본 영상으로 정상 복귀
      adDetectionFailCount++;
      if (adDetectionFailCount >= 2) {
        isAdPlaying = false;
        adDetectionFailCount = 0;
        try {
          if (typeof ytPlayer.setPlaybackRate === 'function') {
            ytPlayer.setPlaybackRate(1);
          }
          if (appState.settings.volume > 0) {
            ytPlayer.unMute();
            ytPlayer.setVolume(appState.settings.volume);
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
  return false;
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    appState.isPlaying = true;
    isUserInitiatedPause = false;
    updatePlayPauseUI(true);
    startProgressTimer();
    setVisualizerState(true);
    preloadUpcomingTracks();
    requestScreenWakeLock();
    startSilentAudioDriver();

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'playing';
      } catch (e) {}
    }
    updateMediaSessionPositionState();

    // 광고 상태 확인
    checkAndHandleAdStream();
  } else if (event.data === YT.PlayerState.PAUSED) {
    // 🛑 모바일 화면 꺼짐(잠금화면 전환) 시 브라우저 강제 pause 방지 및 백그라운드 재생 유지
    if (document.visibilityState === 'hidden' && !isUserInitiatedPause) {
      startSilentAudioDriver();
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.playbackState = 'playing';
        } catch (e) {}
      }
      setTimeout(() => {
        if (!isUserInitiatedPause && ytPlayer && isPlayerReady) {
          try {
            ytPlayer.playVideo();
          } catch (e) {}
        }
      }, 100);
      return;
    }

    appState.isPlaying = false;
    updatePlayPauseUI(false);
    stopProgressTimer();
    setVisualizerState(false);
    pauseSilentAudioDriver();

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'paused';
      } catch (e) {}
    }
    updateMediaSessionPositionState();
  } else if (event.data === YT.PlayerState.ENDED) {
    // 광고가 끝났을 때와 본 영상이 끝났을 때 분기
    if (isAdPlaying) {
      isAdPlaying = false;
      try {
        if (typeof ytPlayer.setPlaybackRate === 'function') ytPlayer.setPlaybackRate(1);
        if (appState.settings.volume > 0) {
          ytPlayer.unMute();
          ytPlayer.setVolume(appState.settings.volume);
        }
      } catch (e) {}
      return;
    }
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

function playCurrentTrack() {
  isUserInitiatedPause = false;
  if (appState.currentTrackIndex === -1) {
    const currentPl = getCurrentPlaylist();
    if (currentPl && currentPl.tracks.length > 0) {
      playTrackByIndex(0);
      return;
    }
  }
  startSilentAudioDriver();
  if (ytPlayer && isPlayerReady) {
    try {
      ytPlayer.playVideo();
    } catch (e) {}
  }
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = 'playing';
    } catch (e) {}
  }
  updatePlayPauseUI(true);
}

function pauseCurrentTrack() {
  isUserInitiatedPause = true;
  if (ytPlayer && isPlayerReady) {
    try {
      ytPlayer.pauseVideo();
    } catch (e) {}
  }
  pauseSilentAudioDriver();
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = 'paused';
    } catch (e) {}
  }
  updatePlayPauseUI(false);
}

function togglePlayPause() {
  if (appState.isPlaying) {
    pauseCurrentTrack();
  } else {
    playCurrentTrack();
  }
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

  isUserInitiatedPause = false;
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
  startSilentAudioDriver();

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

  // 🎤 실시간 싱크 가사 업데이트 또는 백그라운드 프리로드
  if (isLyricsViewActive) {
    loadAndRenderLyrics(track);
  } else {
    fetchLyrics(track);
  }
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
let wasSiteFullscreenBeforeFocus = false;

let focusScrollTimeout = null;
let isUserTouchingFocus = false;

function openFocusMode(targetView = 'carousel') {
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
  wasSiteFullscreenBeforeFocus = isSiteFullscreen();

  if (el.videoWrapper) el.videoWrapper.classList.add('minimized');
  if (el.contentBody) el.contentBody.classList.add('video-minimized');

  isFocusModeOpen = true;
  if (el.focusOverlay) el.focusOverlay.classList.remove('hidden');
  if (el.focusPlName) el.focusPlName.textContent = currentPl.name;

  renderFocusTrackList();
  
  // 요청받은 뷰(기본값: 'carousel' 감상 모드 또는 'lyrics' 가사 모드)로 초기 전환
  switchFocusView(targetView === 'lyrics');

  updatePlayPauseUI(appState.isPlaying);
  updateRepeatUI();
  updateShuffleUI();
  if (el.focusVolumeSlider) el.focusVolumeSlider.value = appState.settings.volume;
  updateVolumeIcon(appState.settings.volume);

  // 🖥️ 감상/가사 모드 실행 시 전체화면으로 자동 전환
  requestFullscreenMode();
}

// 🌟 감상 모드(캐러셀)와 가사 모드(실시간 싱크) 뷰 명확한 분리 및 전환 함수
function switchFocusView(showLyrics) {
  isLyricsViewActive = !!showLyrics;

  if (el.focusCarouselViewport) {
    el.focusCarouselViewport.classList.toggle('hidden', isLyricsViewActive);
  }
  if (el.focusLyricsViewport) {
    el.focusLyricsViewport.classList.toggle('hidden', !isLyricsViewActive);
  }

  // 상단 헤더 배지 및 전환 버튼 상태 업데이트
  if (el.focusBadge) {
    el.focusBadge.innerHTML = isLyricsViewActive
      ? '<i class="fa-solid fa-microphone-lines"></i> 가사 모드'
      : '<i class="fa-solid fa-compact-disc"></i> 감상 모드';
  }
  if (el.btnFocusLyrics) {
    el.btnFocusLyrics.title = isLyricsViewActive ? '감상 모드로 전환 (L)' : '가사 모드로 전환 (L)';
    if (el.iconFocusLyrics) {
      el.iconFocusLyrics.className = isLyricsViewActive ? 'fa-solid fa-compact-disc' : 'fa-solid fa-microphone-lines';
    }
    el.btnFocusLyrics.classList.toggle('active', isLyricsViewActive);
  }

  // 플레이어 바 감상모드 / 가사모드 버튼 활성화 분리
  if (el.btnFocusMode) el.btnFocusMode.classList.toggle('active', !isLyricsViewActive);
  if (el.btnFocusModeBar) el.btnFocusModeBar.classList.toggle('active', !isLyricsViewActive);
  if (el.btnMobileFocus) el.btnMobileFocus.classList.toggle('active', !isLyricsViewActive);

  if (el.btnBarLyrics) el.btnBarLyrics.classList.toggle('active', isLyricsViewActive);
  if (el.btnMobileLyrics) el.btnMobileLyrics.classList.toggle('active', isLyricsViewActive);

  if (isLyricsViewActive) {
    const currentPl = getCurrentPlaylist();
    const currentTrack = currentPl ? currentPl.tracks[appState.currentTrackIndex] : null;
    if (currentTrack) loadAndRenderLyrics(currentTrack);
  } else {
    setTimeout(() => {
      centerActiveFocusTrack(false);
    }, 80);
  }
}

function closeFocusMode() {
  isFocusModeOpen = false;
  isLyricsViewActive = false;
  isUserScrollingLyrics = false;
  isUserInteractingWithLyrics = false;
  isProgrammaticLyricsScrolling = false;

  if (userLyricsScrollTimer) {
    clearTimeout(userLyricsScrollTimer);
    userLyricsScrollTimer = null;
  }
  if (programmaticScrollResetTimer) {
    clearTimeout(programmaticScrollResetTimer);
    programmaticScrollResetTimer = null;
  }
  if (focusScrollTimeout) {
    clearTimeout(focusScrollTimeout);
    focusScrollTimeout = null;
  }
  if (el.focusOverlay) el.focusOverlay.classList.add('hidden');
  if (el.btnFocusMode) el.btnFocusMode.classList.remove('active');
  if (el.btnFocusModeBar) el.btnFocusModeBar.classList.remove('active');
  if (el.btnMobileFocus) el.btnMobileFocus.classList.remove('active');
  if (el.btnFocusLyrics) el.btnFocusLyrics.classList.remove('active');
  if (el.btnBarLyrics) el.btnBarLyrics.classList.remove('active');
  if (el.btnMobileLyrics) el.btnMobileLyrics.classList.remove('active');
  if (el.focusCarouselViewport) el.focusCarouselViewport.classList.remove('hidden');
  if (el.focusLyricsViewport) el.focusLyricsViewport.classList.add('hidden');

  // 감상모드 진입 전 이미 사이트 전체화면 상태가 아니었던 경우에만 종료 시 전체화면 해제
  if (!wasSiteFullscreenBeforeFocus) {
    exitFullscreenMode();
  }

  // 감상모드 닫힐 때 원래 영상 표시 설정 복원
  if (wasVideoVisibleBeforeFocus && appState.settings.isVideoVisible) {
    if (el.videoWrapper) el.videoWrapper.classList.remove('minimized');
    if (el.contentBody) el.contentBody.classList.remove('video-minimized');
  }
}

function isSiteFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function requestFullscreenMode() {
  const docEl = document.documentElement;
  try {
    if (!isSiteFullscreen()) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    }
  } catch (e) {
    console.log('Fullscreen request ignored or unsupported:', e);
  }
  updateAllFullscreenIcons();
}

function exitFullscreenMode() {
  try {
    if (isSiteFullscreen()) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  } catch (e) {
    console.log('Exit fullscreen error:', e);
  }
  updateAllFullscreenIcons();
}

function toggleSiteFullscreen() {
  if (isSiteFullscreen()) {
    exitFullscreenMode();
  } else {
    requestFullscreenMode();
  }
}

function toggleFocusFullscreen() {
  toggleSiteFullscreen();
}

function updateAllFullscreenIcons() {
  const isFs = isSiteFullscreen();

  // 1. 감상모드 상단 전체화면 아이콘
  if (el.iconFocusFullscreen) {
    el.iconFocusFullscreen.className = isFs ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
  }
  if (el.btnFocusFullscreen) {
    el.btnFocusFullscreen.title = isFs ? '전체화면 종료' : '전체화면으로 보기';
    el.btnFocusFullscreen.classList.toggle('active', isFs);
  }

  // 2. 데스크탑 하단 플레이어 바 사이트 전체화면
  if (el.iconFullscreenSite) {
    el.iconFullscreenSite.className = isFs ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
  }
  if (el.btnFullscreenSite) {
    el.btnFullscreenSite.title = isFs ? '전체화면 종료 (F 또는 클릭)' : '사이트 전체화면 (F 또는 클릭)';
    el.btnFullscreenSite.classList.toggle('active', isFs);
  }

  // 3. 상단 네비 바 전체화면
  if (el.iconNavFullscreen) {
    el.iconNavFullscreen.className = isFs ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
  }
  if (el.btnNavFullscreen) {
    el.btnNavFullscreen.title = isFs ? '전체화면 종료' : '사이트 전체화면';
    el.btnNavFullscreen.classList.toggle('active', isFs);
  }

  // 4. 모바일 하단 보조 제어 바 전체화면
  if (el.iconMobileFullscreen) {
    el.iconMobileFullscreen.className = isFs ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
  }
  if (el.btnMobileFullscreen) {
    el.btnMobileFullscreen.title = isFs ? '전체화면 종료' : '전체화면';
    el.btnMobileFullscreen.classList.toggle('active', isFs);
  }
}

function updateFocusFullscreenIcon() {
  updateAllFullscreenIcons();
}

// 1. 감상 모드 전용 토글 (앨범아트/플리 캐러셀)
function toggleCarouselFocusMode() {
  if (!isFocusModeOpen) {
    openFocusMode('carousel');
  } else if (isLyricsViewActive) {
    switchFocusView(false);
  } else {
    closeFocusMode();
  }
}

// 2. 가사 모드 전용 토글 (실시간 싱크 가사)
function toggleLyricsMode() {
  if (!isFocusModeOpen) {
    openFocusMode('lyrics');
  } else if (!isLyricsViewActive) {
    switchFocusView(true);
  } else {
    closeFocusMode();
  }
}

// 3. 오버레이 내부 상단 전환 버튼 (가사 <-> 감상 상호 전환)
function toggleInsideFocusView() {
  if (!isFocusModeOpen) {
    openFocusMode('lyrics');
  } else {
    switchFocusView(!isLyricsViewActive);
  }
}

function toggleFocusMode() {
  toggleCarouselFocusMode();
}

function updateFocusCardDistances() {
  if (!el.focusTrackList) return;
  const cards = el.focusTrackList.querySelectorAll('.focus-track-card');
  const activeIdx = appState.currentTrackIndex;

  cards.forEach((card, idx) => {
    const diff = Math.abs(idx - activeIdx);
    card.setAttribute('data-diff', Math.min(diff, 4));

    if (diff === 0) {
      card.style.opacity = '1';
      card.style.filter = 'blur(0px)';
      card.style.transform = 'scale(1.04)';
      card.style.pointerEvents = 'auto';
    } else if (diff === 1) {
      card.style.opacity = '0.75';
      card.style.filter = 'blur(0.3px)';
      card.style.transform = 'scale(0.92)';
      card.style.pointerEvents = 'auto';
    } else if (diff === 2) {
      card.style.opacity = '0.52';
      card.style.filter = 'blur(0.8px)';
      card.style.transform = 'scale(0.84)';
      card.style.pointerEvents = 'auto';
    } else if (diff === 3) {
      card.style.opacity = '0.38';
      card.style.filter = 'blur(1.2px)';
      card.style.transform = 'scale(0.78)';
      card.style.pointerEvents = 'auto';
    } else {
      card.style.opacity = '0.28';
      card.style.filter = 'blur(1.5px)';
      card.style.transform = 'scale(0.74)';
      card.style.pointerEvents = 'auto';
    }
  });
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

  updateFocusCardDistances();
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

  updateFocusCardDistances();
  centerActiveFocusTrack(true);
}

function centerActiveFocusTrack(smooth = true) {
  if (!el.focusCarouselViewport || !el.focusTrackList) return;
  const activeCard = el.focusTrackList.querySelector('.focus-track-card.active');
  if (!activeCard) return;

  requestAnimationFrame(() => {
    // 뷰포트 내 수직 중앙 정확 계산
    const viewportHeight = el.focusCarouselViewport.clientHeight;
    const cardTop = activeCard.offsetTop;
    const cardHeight = activeCard.offsetHeight;

    const targetScrollTop = cardTop - (viewportHeight / 2) + (cardHeight / 2);

    el.focusCarouselViewport.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: smooth ? 'smooth' : 'auto'
    });
  });
}

/* ==================== 🎤 실시간 싱크 가사 시스템 (Synced Lyrics Engine) ==================== */
let isLyricsViewActive = false;
let currentLyricsData = null; // { type: 'synced'|'plain', lyrics: [{time, text}], trackName, artistName }
let currentLyricsTrackId = null;
let activeLyricLineIndex = -1;
let lyricsSyncOffset = 0; // 초 단위 오프셋
let isUserScrollingLyrics = false;
let isProgrammaticLyricsScrolling = false;
let programmaticScrollResetTimer = null;
let userLyricsScrollTimer = null;
let isUserInteractingWithLyrics = false;

// ⚡ 가사 듀얼 캐시 시스템 (메모리 Map + localStorage 영구 보관으로 0ms 초고속 즉각 응답 & 재방문 시 영구 유지)
const lyricsCache = new Map();
const LYRICS_CACHE_PREFIX = 'ply_lyrics_perm_v2_';

function getCachedLyrics(key) {
  if (!key) return null;
  const k = String(key).trim();
  if (!k) return null;
  if (lyricsCache.has(k)) return lyricsCache.get(k);
  try {
    const stored = localStorage.getItem(`${LYRICS_CACHE_PREFIX}${k}`) ||
                   sessionStorage.getItem(`ply_lrc_online_${k}`) ||
                   localStorage.getItem(`ply_lrc_online_${k}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.lyrics) && parsed.lyrics.length > 0) {
        lyricsCache.set(k, parsed);
        return parsed;
      }
    }
  } catch (e) {}
  return null;
}

function setCachedLyrics(key, data) {
  if (!key || !data || !Array.isArray(data.lyrics) || data.lyrics.length === 0) return;
  const k = String(key).trim();
  if (!k) return;
  lyricsCache.set(k, data);
  try {
    localStorage.setItem(`${LYRICS_CACHE_PREFIX}${k}`, JSON.stringify(data));
  } catch (e) {}
}

// ⚡ 비동기 검색 경쟁 상태(Race Condition) 원천 차단 시퀀스 & 요청 취소 제어자
let lyricsRequestSequence = 0;
let activeLyricsAbortController = null;

// 0. 한국 주요 아티스트 별칭 매핑 (한/영 표기 상호 변환 및 그룹/솔로 확장)
const COMMON_ARTIST_MAP = {
  '아이유': ['IU', '아이유 (IU)', 'IU (아이유)'],
  'iu': ['아이유', 'IU (아이유)'],
  '뉴진스': ['NewJeans', 'New Jeans'],
  'newjeans': ['뉴진스', 'New Jeans'],
  '데이식스': ['DAY6', 'Day6'],
  'day6': ['데이식스'],
  '에스파': ['aespa', 'Aespa'],
  'aespa': ['에스파'],
  '르세라핌': ['LE SSERAFIM', 'LESSERAFIM', 'Le Sserafim'],
  'le sserafim': ['르세라핌', 'LESSERAFIM'],
  '아이브': ['IVE', 'Ive'],
  'ive': ['아이브'],
  '아일릿': ['ILLIT', 'Illit'],
  'illit': ['아일릿'],
  '키스오브라이프': ['KISS OF LIFE', 'KISSOFLIFE'],
  'kiss of life': ['키스오브라이프'],
  '베이비몬스터': ['BABYMONSTER', 'BabyMonster'],
  'babymonster': ['베이비몬스터'],
  '투어스': ['TWS'],
  'tws': ['투어스'],
  '라이즈': ['RIIZE', 'Riize'],
  'riize': ['라이즈'],
  '보이넥스트도어': ['BOYNEXTDOOR'],
  'boynextdoor': ['보이넥스트도어'],
  '제로베이스원': ['ZEROBASEONE', 'ZB1'],
  'zerobaseone': ['제로베이스원'],
  '방탄소년단': ['BTS', '방탄소년단 (BTS)', 'BTS (방탄소년단)'],
  'bts': ['방탄소년단'],
  '세븐틴': ['SEVENTEEN', 'Seventeen'],
  'seventeen': ['세븐틴'],
  '태연': ['TAEYEON', 'Taeyeon', '소녀시대 태연'],
  'taeyeon': ['태연'],
  '로제': ['ROSÉ', 'ROSE', 'Rose'],
  'rose': ['로제', 'ROSÉ'],
  '제니': ['JENNIE', 'Jennie'],
  '프로미스나인': ['fromis_9', 'fromis 9', 'fromis9', 'Fromis_9'],
  'fromis_9': ['프로미스나인', 'fromis 9', 'fromis9'],
  'fromis 9': ['프로미스나인', 'fromis_9'],
  'fromis9': ['프로미스나인', 'fromis_9'],
  'jennie': ['제니'],
  '지수': ['JISOO', 'Jisoo'],
  'jisoo': ['지수'],
  '리사': ['LISA', 'Lisa'],
  'lisa': ['리사'],
  '블랙핑크': ['BLACKPINK', 'Blackpink'],
  'blackpink': ['블랙핑크'],
  '트와이스': ['TWICE', 'Twice'],
  'twice': ['트와이스'],
  '레드벨벳': ['Red Velvet', 'red velvet'],
  'red velvet': ['레드벨벳'],
  '있지': ['ITZY', 'Itzy'],
  'itzy': ['있지'],
  '엔믹스': ['NMIXX', 'Nmixx'],
  'nmixx': ['엔믹스'],
  '아이들': ['(G)I-DLE', 'GIDLE', '(여자)아이들'],
  'gidle': ['(G)I-DLE', '아이들'],
  '임영웅': ['Lim Young Woong', 'Lim Youngwoong'],
  '성시경': ['Sung Si Kyung'],
  '폴킴': ['Paul Kim'],
  'paul kim': ['폴킴'],
  'qwer': ['QWER'],
  '이클립스': ['ECLIPSE', 'Eclipse'],
  'eclipse': ['이클립스'],
  '윤하': ['YOUNHA', 'Younha'],
  'younha': ['윤하'],
  '투모로우바이투게더': ['TXT', 'TOMORROW X TOGETHER'],
  'txt': ['투모로우바이투게더', 'TOMORROW X TOGETHER'],
  '스트레이키즈': ['Stray Kids', '스키즈'],
  'stray kids': ['스트레이키즈'],
  '잔나비': ['JANNABI', 'Jannabi'],
  '악뮤': ['AKMU', '악동뮤지션'],
  'akmu': ['악뮤', '악동뮤지션'],
  '백예린': ['Yerin Baek'],
  'yerin baek': ['백예린'],
  '볼빨간사춘기': ['BOL4'],
  'bol4': ['볼빨간사춘기'],
  '10cm': ['십센치'],
  '십센치': ['10CM'],
  '이무진': ['Lee Mujin'],
  '박효신': ['Park Hyo Shin'],
  '박재정': ['Parc Jae Jung', 'Park Jae Jung', '박재정 (Parc Jae Jung)'],
  'parc jae jung': ['박재정'],
  'park jae jung': ['박재정'],
  '로이킴': ['Roy Kim'],
  'roy kim': ['로이킴'],
  '멜로망스': ['MeloMance'],
  'melomance': ['멜로망스'],
  '우디': ['Woody'],
  '크러쉬': ['Crush'],
  'crush': ['크러쉬'],
  '헤이즈': ['Heize'],
  'heize': ['헤이즈'],
  '이영지': ['Lee Young Ji'],
  '비비': ['BIBI'],
  'bibi': ['비비'],
  '릴러말즈': ['Leellamarz', '릴러말즈 (Leellamarz)'],
  'leellamarz': ['릴러말즈'],
  '애쉬아일랜드': ['ASH ISLAND', '애쉬 아일랜드'],
  'ash island': ['애쉬아일랜드'],
  '창모': ['CHANGMO', '창모 (CHANGMO)'],
  'changmo': ['창모'],
  '비오': ["BE'O", "비오 (BE'O)", 'BEO'],
  'be\'o': ['비오'],
  'beo': ['비오'],
  '호미들': ['Homidle'],
  'homidle': ['호미들'],
  '빅나티': ['BIG Naughty', '서동현'],
  'big naughty': ['빅나티', '서동현'],
  '지코': ['ZICO'],
  'zico': ['지코'],
  '우원재': ['Woo', 'Woo Won Jae'],
  'woo': ['우원재'],
  '기리보이': ['GIRIBOY'],
  'giriboy': ['기리보이'],
  '식케이': ['Sik-K'],
  'sik-k': ['식케이'],
  '키드밀리': ['Kid Milli'],
  'kid milli': ['키드밀리'],
  '저스디스': ['JUSTHIS'],
  'justhis': ['저스디스'],
  // --- CCM / 찬양 / 워십 대표 아티스트 ---
  '마커스워십': ['마커스', 'Markers Worship', 'MARKERS WORSHIP', '마커스 워십', 'Markers'],
  '마커스': ['마커스워십', 'Markers Worship', 'MARKERS WORSHIP', 'Markers'],
  'markers worship': ['마커스워십', '마커스', 'Markers'],
  'markers': ['마커스워십', '마커스'],
  '위러브': ['WELOVE', 'Welove', '위 러브'],
  'welove': ['위러브', 'WELOVE'],
  '피아워십': ['F.I.A Worship', 'FIA Worship', '피아 워십', 'F.I.A', 'FIA WORSHIP'],
  'f.i.a worship': ['피아워십', 'FIA Worship'],
  'fia worship': ['피아워십', 'F.I.A Worship'],
  '제이어스': ['J-US', 'JUS', 'J-Us', '제이 어스'],
  'j-us': ['제이어스', 'JUS'],
  '어노인팅': ['Anointing', 'ANOINTING', '어노인팅 미니스트리'],
  'anointing': ['어노인팅'],
  '아이자야씩스티원': ['아이자야 씩스티원', 'Isaiah6tyOne', 'Isaiah 6tyOne', 'Isaiah61', '아이자야'],
  'isaiah6tyone': ['아이자야씩스티원', '아이자야 씩스티원'],
  '손경민': ['손경민 목사', '손경민(목사)'],
  '염평안': ['염평안 (HIS NAME)', '히즈네임 염평안'],
  '찬미워십': ['Chanmi Worship', '민호기', '민호기 목사'],
  '예수전도단': ['YWAM', '캠퍼스워십', 'Campus Worship'],
  '캠퍼스워십': ['예수전도단', 'Campus Worship'],
  '히즈네임': ['His Name', '염평안'],
  '팀룩원': ['Team Look One'],
  '달빛마을': ['Moonlight Village'],
  '예람워십': ['Yeram Worship', '예람 워십'],
  '시와그림': ['시와 그림'],
  '소리엘': ['Soriel'],
  '다윗의장막': ['다윗의 장막', 'Scott Brenner', '스캇 브래너'],
  '헤리티지': ['Heritage', '헤리티지 매스콰이어'],
  '한웅재': ['꿈이있는자유', '한웅재 목사'],
  '꿈이있는자유': ['한웅재'],
  '조수아': ['Joshua'],
  '강찬': ['Kang Chan'],
  'hillsong': ['힐송', 'Hillsong Worship', 'Hillsong UNITED', 'Hillsong Young & Free'],
  'hillsong worship': ['힐송', 'Hillsong', 'Hillsong UNITED'],
  'bethel music': ['베델뮤직', 'Bethel'],
  'elevation worship': ['엘리베이션 워십', 'Elevation'],
  'phil wickham': ['필 윅햄'],
  'cory asbury': ['코리 애즈베리'],
  'matt redman': ['맷 레드맨'],
  'chris tomlin': ['크리스 탐린'],
  'lauren daigle': ['로렌 다이글'],
  'kari jobe': ['카리 조브'],
  'leeland': ['릴랜드', 'Leeland'],
  'sinach': ['시낙', 'Sinach'],
  'planetshakers': ['플래닛쉐이커스']
};

// 0-1. 한국 대표 곡명 한/영 상호 변환 매핑 (LRCLIB 글로벌 영문 원제 정밀 매칭)
const COMMON_TITLE_MAP = {
  // --- CCM / 찬양 / 워십 대표 곡명 ---
  '시간을 뚫고': ['Through the Time', 'Break Through the Time'],
  'through the time': ['시간을 뚫고'],
  '꽃들도': ['Flowers', '花も'],
  'flowers': ['꽃들도'],
  '은혜': ['Grace'],
  'grace': ['은혜'],
  '원하고 바라고 기도합니다': ['I Want, Hope and Pray', 'I Hope and Pray'],
  '공감하시네': ['He Empathizes', 'Empathize'],
  '요게벳의 노래': ['Song of Jochebed', 'Jochebed'],
  'song of jochebed': ['요게벳의 노래'],
  '예수 늘 함께 하시네': ['Jesus, Always with Me', 'Jesus Always With Me'],
  'jesus, always with me': ['예수 늘 함께 하시네'],
  '내 모습 이대로': ['Just As I Am'],
  'just as i am': ['내 모습 이대로'],
  '광야를 지나며': ['Passing Through the Wilderness', 'Wilderness'],
  '주의 자비가 내려와': ['Mercy Is Falling'],
  '아무것도 두려워 말라': ['Do Not Fear Anything', 'Don\'t Be Afraid'],
  'way maker': ['웨이 메이커'],
  '웨이 메이커': ['Way Maker'],
  'goodness of god': ['하나님의 선하심', '주의 선하심'],
  '하나님의 선하심': ['Goodness of God'],
  'living hope': ['산 소망'],
  '산 소망': ['Living Hope'],
  '10,000 reasons': ['만 가지 이유', 'Bless the Lord'],
  'reckless love': ['무조건적인 사랑'],
  'what a beautiful name': ['아름다우신 이름'],
  'oceans': ['오션스', 'Oceans (Where Feet May Fail)'],
  '한 페이지가 될 수 있게': ['Time of Our Life'],
  'time of our life': ['한 페이지가 될 수 있게'],
  '예뻤어': ['You Were Beautiful'],
  'you were beautiful': ['예뻤어'],
  '녹아내려요': ['Melt Down'],
  'melt down': ['녹아내려요'],
  'welcome to the show': ['Welcome to the Show'],
  '해피': ['HAPPY', 'Happy'],
  'happy': ['해피'],
  '밤편지': ['Through the Night'],
  'through the night': ['밤편지'],
  '사건의 지평선': ['Event Horizon'],
  'event horizon': ['사건의 지평선'],
  '첫 만남은 계획대로 되지 않아': ['plot twist'],
  'plot twist': ['첫 만남은 계획대로 되지 않아'],
  '주저하는 연인들을 위해': ['for lovers who hesitate'],
  'for lovers who hesitate': ['주저하는 연인들을 위해'],
  '모든 날 모든 순간': ['Every day, Every Moment'],
  'every day, every moment': ['모든 날 모든 순간'],
  '너를 만나': ['Me After You'],
  'me after you': ['너를 만나'],
  '봄날': ['Spring Day'],
  'spring day': ['봄날'],
  '작은 것들을 위한 시': ['Boy With Luv'],
  'boy with luv': ['작은 것들을 위한 시'],
  '거리에서': ['On the Street'],
  'on the street': ['거리에서'],
  '헤어지자 말해요': ['Let\'s Say Goodbye'],
  'let\'s say goodbye': ['헤어지자 말해요'],
  '소나기': ['Sudden Shower'],
  'sudden shower': ['소나기'],
  '좋은 날': ['Good Day'],
  'good day': ['좋은 날'],
  '너랑 나': ['YOU&I', 'You & I'],
  '스물셋': ['Twenty-three'],
  '팔레트': ['Palette'],
  '에잇': ['eight'],
  '러브 윈스 올': ['Love wins all'],
  '라일락': ['LILAC'],
  '디토': ['Ditto'],
  'ditto': ['디토'],
  '하입보이': ['Hype Boy'],
  'hype boy': ['하입보이'],
  '어텐션': ['Attention'],
  'attention': ['어텐션'],
  '슈퍼노바': ['Supernova'],
  'supernova': ['슈퍼노바'],
  '아마겟돈': ['Armageddon'],
  'armageddon': ['아마겟돈'],
  '고민중독': ['T.B.H'],
  't.b.h': ['고민중독'],
  '마니또': ['MANITO'],
  '마그네틱': ['Magnetic'],
  'magnetic': ['마그네틱'],
  '아이엠': ['I AM'],
  'i am': ['아이엠'],
  '러브 다이브': ['LOVE DIVE'],
  'love dive': ['러브 다이브'],
  '키치': ['Kitsch'],
  'kitsch': ['키치']
};

function expandArtistNames(clean) {
  if (!clean) return [];
  const list = [];
  const pushUnique = (str) => {
    const s = (str || '').trim();
    if (s && s.length >= 1 && !list.some(x => x.toLowerCase() === s.toLowerCase())) {
      list.push(s);
    }
  };

  pushUnique(clean);

  // 괄호 분리 (예: "IU(아이유)" -> ["IU", "아이유"])
  const m = clean.match(/^([^\(\)]+)\s*\(([^\)]+)\)/);
  if (m) {
    pushUnique(m[1]);
    pushUnique(m[2]);
  }

  // 해외 팝송 & K-POP 다중 협업 아티스트 분리 (예: "Lady Gaga, Bruno Mars", "ROSE & Bruno Mars", "The Kid LAROI, Justin Bieber")
  const splitArtists = clean.split(/[,/／]|\s+(?:&|and|feat\.?|ft\.?|x|with)\s+/i);
  if (splitArtists.length > 1) {
    splitArtists.forEach(a => pushUnique(a));
  }

  const currentItems = [...list];
  for (const item of currentItems) {
    const lower = item.toLowerCase();
    for (const [key, aliases] of Object.entries(COMMON_ARTIST_MAP)) {
      if (lower === key.toLowerCase() || lower.includes(key.toLowerCase())) {
        aliases.forEach(al => pushUnique(al));
        pushUnique(key);
      }
    }
  }

  // 영문/로마자 표기를 앞에 배치 (LRCLIB 및 글로벌 인덱스가 영문명 우선 매칭됨)
  list.sort((a, b) => {
    const aIsAscii = /^[A-Za-z0-9\s'&.\-]+$/.test(a) ? 1 : 0;
    const bIsAscii = /^[A-Za-z0-9\s'&.\-]+$/.test(b) ? 1 : 0;
    return bIsAscii - aIsAscii;
  });

  return list;
}

function expandTitleNames(clean) {
  if (!clean) return [];
  const list = [];
  const pushUnique = (str) => {
    const s = (str || '').trim();
    if (s && s.length >= 1 && !list.some(x => x.toLowerCase() === s.toLowerCase())) {
      list.push(s);
    }
  };

  pushUnique(clean);

  // 괄호 분리 (예: "밤편지(Through the Night)" -> ["Through the Night", "밤편지"])
  const m = clean.match(/^([^\(\)]+)\s*\(([^\)]+)\)/);
  if (m) {
    pushUnique(m[2]);
    pushUnique(m[1]);
  }

  // 끝부분 버전/수식어 괄호 제거 (예: "Attention (Live)", "Cruel Summer (Official Audio)" -> "Attention", "Cruel Summer")
  const noParen = clean.replace(/\s*\([^\)]*\)\s*$/g, '').trim();
  if (noParen && noParen !== clean) {
    pushUnique(noParen);
  }

  const currentItems = [...list];
  for (const item of currentItems) {
    const lower = item.toLowerCase();
    for (const [key, aliases] of Object.entries(COMMON_TITLE_MAP)) {
      if (lower === key.toLowerCase() || lower.includes(key.toLowerCase())) {
        aliases.forEach(al => pushUnique(al));
        pushUnique(key);
      }
    }
  }

  // 영문/원제 표기 우선 정렬
  list.sort((a, b) => {
    const aIsAscii = /^[A-Za-z0-9\s'&.\-]+$/.test(a) ? 1 : 0;
    const bIsAscii = /^[A-Za-z0-9\s'&.\-]+$/.test(b) ? 1 : 0;
    return bIsAscii - aIsAscii;
  });

  return list;
}

// 유튜브 채널/배급사/방송국 필터링 (아티스트명으로 오인되어 검색어 오염되는 현상 원천 방지)
const CHANNEL_PUBLISHERS = [
  '1thek', '원더케이', 'smtown', 'jyp entertainment', 'jyp', 'hybe labels', 'hybe', 'mnet k-pop', 'mnet',
  'dingo music', 'dingo', 'stone music entertainment', 'stone music', 'genie music', 'genie',
  'kbs kpop', 'mbckpop', 'sbs kpop', 'cj enm', '워너뮤직코리아', '소니뮤직코리아',
  'bighit music', 'yg entertainment', 'starship', 'cube entertainment', 'fnc joy',
  'official charts', 'vevo', '스브스케이팝', 'warner music', 'sony music', 'universal music'
];

function isChannelPublisher(author) {
  if (!author) return false;
  const a = author.toLowerCase().replace(/[\s\-_\[\]\(\)]/g, '');
  return CHANNEL_PUBLISHERS.some(p => a.includes(p.replace(/[\s\-_\[\]\(\)]/g, '')));
}

// 0-2. 일반(Plain) 가사 지능형 자동 타임싱크 변환기 (영상 길이에 맞춰 자연스러운 라인별 싱크 생성)
function applySmartPlainSync(data, durationSec = 0) {
  if (!data || !data.lyrics || data.lyrics.length === 0) return data;
  if (data.type === 'synced' && !data.isSmartSync) return data;

  let dur = durationSec;
  if ((!dur || dur <= 30) && typeof ytPlayer !== 'undefined' && ytPlayer && typeof ytPlayer.getDuration === 'function') {
    try {
      const pDur = ytPlayer.getDuration();
      if (pDur && pDur > 30) dur = pDur;
    } catch (e) {}
  }
  if (!dur || dur <= 30) dur = 235; // 기본 3분 55초 기준 초기 배치

  const introSec = Math.min(15, Math.max(7, dur * 0.065));
  const outroSec = Math.min(20, Math.max(10, dur * 0.08));
  const usableSpan = Math.max(30, dur - introSec - outroSec);

  const weights = data.lyrics.map(l => Math.max(6, Math.min(28, (l.text || '').length)));
  const totalWeight = weights.reduce((acc, w) => acc + w, 0) || 1;

  let accSec = introSec;
  data.lyrics.forEach((line, idx) => {
    line.time = Math.round(accSec * 10) / 10;
    accSec += (weights[idx] / totalWeight) * usableSpan;
  });

  data.type = 'synced';
  data.isSmartSync = true;
  data.smartSyncDuration = dur;
  return data;
}

// 1. 특수문자 및 기호 정제 (Cloudflare WAF 503 방지 및 깨끗한 검색어 생성)
function sanitizeForQuery(text) {
  if (!text) return '';
  return text
    .replace(/[\[\]\(\)\{\}<>_~`!@#\$%\^&\*\+=\\|;:'",\/?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 2. 영상 제목이 '플레이리스트 / 모음 / 1시간 연속재생 / 찬양모음' 다곡 합본 영상인지 감지
function isCompilationVideo(title) {
  if (!title) return false;
  return /(playlist|플레이리스트|노동요|모음|연속재생|1시간|2시간|3시간|hour\s*loop|100곡|top\s*\d+|노래\s*모음|bgm\s*모음|찬양\s*모음|ccm\s*모음|워십\s*모음|worship\s*collection)/i.test(title);
}

// 2-1. YouTube 영상 제목에서 불필요한 부제목, 가사/자막 태그, kpop lyric 등을 완벽히 걸러내는 노이즈 제거 엔진
function cleanTitleNoise(str) {
  if (!str || typeof str !== 'string') return '';
  let s = str;
  // 1. 태그/수식어 대괄호만 제거하고, 아티스트/곡명 대괄호([마커스워십], [피아워십], [아이유] 등)는 보존
  const bracketTagNoise = /\[\s*(?:ccm|찬양|워십\s*(?:라이브|영상|실황)?|은혜로운\s*찬양|주일\s*예배|예배\s*실황|실황|특송|성가|worship\s*live|live\s*worship|praise|gospel|mv|m\/v|official(?:\s*(?:video|audio|mv|music\s*video))?|video|audio|가사(?:\s*자막)?|자막|발음|lyrics?|color\s*coded|live(?:\s*clip)?|4k|hd|full\s*ver|풀버전|교차편집|stage|sub|단독|선공개|mr|ar|inst|instrumental|cover|커버|playlist|k-?pop)[^\]]*\]/gi;
  s = s.replace(bracketTagNoise, ' ');

  // 시작 부분의 [아티스트] 형태는 아티스트 분리를 위해 '아티스트 - ' 형태로 치환
  s = s.replace(/^\[([^\]]+)\]\s*/, '$1 - ');

  // 2. 괄호 속 부제목 중 가사/자막/수식어 계열 제거 (단, 워십 아티스트명 마커스, 피아워십, 찬미워십 등은 절대 삭제하지 않음)
  const parenNoise = /\([^\)]*(?:가사|자막|발음|풀버전|교차편집|음원|k-?pop|\b(?:ccm|lyrics?|lyric\s*video|color\s*coded|sub|subs|eng|han|rom|official|audio|video|clip|mv|m\/v|live|ver|remaster|stage|special|prod)\b|찬양\s*(?:모음|영상|실황|연속듣기|라이브|듣기)?|은혜로운\s*찬양|예배\s*(?:실황|라이브|영상)?|주일\s*예배|실황\s*(?:라이브|영상)?|특송|성가)[^\)]*\)/gi;
  const artistCheck = /(마커스|피아|찬미|위러브|welove|제이어스|j-us|어노인팅|anointing|아이자야|isaiah|hillsong|elevation|bethel|손경민|염평안)/i;
  s = s.replace(parenNoise, (match) => {
    return artistCheck.test(match) ? match : ' ';
  });

  // 3. 인라인 공식/수식 단어 제거
  const inlineNoise = /\b(officials?|offcial)(\s*(music|lyric|audio|video|mv|visualizer|release|track|live))?\b|(official\s*(music\s*)?video|official\s*audio|lyric\s*video|m\/v|video\s*clip|performance\s*video|visualizer|live\s*worship|live\s*clip|live\s*ver)/gi;
  s = s.replace(inlineNoise, ' ');

  // 4. 문자열 끝부분에 붙은 쓸데없는 부제목/가사/kpop lyric/자막 반복 제거 (중첩 꼬리말 완전 제거)
  const tailNoise = /(?:[\s\-_|/]+|\b)(?:(?:k-?pop\s*)?(?:lyrics?|lyric\s*video|color\s*coded(?:\s*lyrics?)?|가사(?:\s*자막|\s*첨부|\s*포함)?|자막|발음|한글자막|한글가사|한국어가사|eng\s*sub|sub|official\s*(?:video|audio|mv|music\s*video)?|audio|video|m\/v|mv|live(?:\s*clip)?|full\s*ver|풀버전|교차편집|stage\s*mix|k-?pop))+\s*$/i;
  while (true) {
    const prev = s;
    s = s.replace(tailNoise, ' ').trim();
    if (s === prev) break;
  }

  return s.replace(/\s+/g, ' ').trim();
}

// 2-2. YouTube 영상 제목에서 순수 곡명과 아티스트를 최우선으로 정밀 분리/분석하는 엔진
function analyzeTrackTitle(rawTitle, rawAuthor = '') {
  if (!rawTitle) return { title: '', artist: '', subtitle: '' };
  let str = cleanTitleNoise(rawTitle);

  // 0. 파이프(|) 또는 슬래시 구분 채널명/방송사/쇼 태그 분리 (예: '박재정 - 헤어지자 말해요 | 딩고뮤직', 'Dingo Music | 박재정 - 헤어지자 말해요')
  if (str.includes('|')) {
    const parts = str.split('|').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const isPart0Tag = /(dingo|딩고|1thek|kbs|sbs|mbc|mnet|choom|live|라이브|뮤직|music|official|clip|클립|세로라이브|킬링보이스)/i.test(parts[0]) || isChannelPublisher(parts[0]);
      const isPart1Tag = /(dingo|딩고|1thek|kbs|sbs|mbc|mnet|choom|live|라이브|뮤직|music|official|clip|클립|세로라이브|킬링보이스)/i.test(parts[1]) || isChannelPublisher(parts[1]);
      if (isPart0Tag && !isPart1Tag) {
        str = parts[1];
      } else if (isPart1Tag && !isPart0Tag) {
        str = parts[0];
      } else if (parts[0].includes('-')) {
        str = parts[0];
      } else if (parts[1].includes('-')) {
        str = parts[1];
      }
    }
  }

  // 1. 광고, 태그, MV 수식어 제거 (단, 아티스트명 대괄호/괄호는 보존)
  str = str
    .replace(/\[\s*(?:ccm|찬양|워십\s*(?:라이브|영상|실황)?|은혜로운\s*찬양|주일\s*예배|예배\s*실황|실황|특송|성가|worship\s*live|live\s*worship|praise|gospel|mv|m\/v|official(?:\s*(?:video|audio|mv|music\s*video))?|video|audio|가사(?:\s*자막)?|자막|발음|lyrics?|color\s*coded|live(?:\s*clip)?|4k|hd|full\s*ver|풀버전|교차편집|stage|sub|단독|선공개|mr|ar|inst|instrumental|cover|커버|playlist|k-?pop)[^\]]*\]/gi, ' ')
    .replace(/^\[([^\]]+)\]\s*/, '$1 - ')
    .replace(/\b(officials?|offcial)(\s*(music|lyric|audio|video|mv|visualizer|release|track|live))?\b/gi, ' ')
    .replace(/(official\s*(music\s*)?video|official\s*audio|lyric\s*video|m\/v|video\s*clip|performance\s*video|visualizer|live\s*worship|live\s*clip|live\s*ver)/gi, ' ')
    .trim();

  // 2. 따옴표 속 곡명 확인 (예: fromis_9 (프로미스나인) 'DM', DAY6 "한 페이지가 될 수 있게")
  const qM = str.match(/['"「」『』]([^'"「」『』]+)['"「」『』]/);
  if (qM && qM[1]) {
    const t = sanitizeForQuery(qM[1]);
    const rawA = str.substring(0, qM.index).trim();
    let a = sanitizeForQuery(rawA);
    const pM = rawA.match(/^([^\(\)]+)\s*\(([^\)]+)\)/);
    if (pM) {
      a = /[\uAC00-\uD7AF]/.test(pM[2]) ? sanitizeForQuery(pM[2]) : sanitizeForQuery(pM[1]);
    }
    const authorClean = rawAuthor && !isChannelPublisher(rawAuthor) ? rawAuthor : '';
    if (t) return { title: t, artist: a || authorClean || '', subtitle: '' };
  }

  // 3. 구분자 ' - ', ' – ', ' — ', ' : ', ' | ', ' / ' 분리 (단, fromis_9, (G)I-DLE, DAY-6 같은 단어 내부 구분자는 절대 쪼개지 않음)
  const sepM = str.match(/^(.+?)\s+[\-–—:\/|]\s+(.+)$/);
  if (sepM) {
    let raw1 = sepM[1].trim();
    let raw2 = sepM[2].replace(/\((feat|ft)\.[^\)]*\)/gi, ' ').trim();
    let subTitle = '';

    // 곡명 뒤 괄호 속 부제/영문명 분리 (예: '헤어지자 말해요 (Let\'s Say Goodbye)', '은혜 (Grace)')
    const subM = raw2.match(/^([^\(\)]+)\s*\(([^\)]+)\)/);
    if (subM) {
      raw2 = subM[1].trim();
      subTitle = sanitizeForQuery(subM[2]);
    }
    const subM1 = raw1.match(/^([^\(\)]+)\s*\(([^\)]+)\)/);
    if (subM1) {
      raw1 = subM1[1].trim();
      if (!subTitle) subTitle = sanitizeForQuery(subM1[2]);
    }

    const pM1 = raw1.match(/^([^\(\)]+)\s*\(([^\)]+)\)/);
    if (pM1) {
      raw1 = /[\uAC00-\uD7AF]/.test(pM1[2]) ? pM1[2] : pM1[1];
    }
    const pM2 = raw2.match(/^([^\(\)]+)\s*\(([^\)]+)\)/);
    if (pM2) {
      raw2 = /[\uAC00-\uD7AF]/.test(pM2[2]) ? pM2[2] : pM2[1];
    }

    const s1 = sanitizeForQuery(raw1);
    const s2 = sanitizeForQuery(raw2);

    const authorClean = rawAuthor && !isChannelPublisher(rawAuthor) ? rawAuthor : '';

    // 역방향 (곡명 - 아티스트) 확인: s2가 아티스트이고 s1이 곡명인지 확인
    const isPart2Artist = Object.keys(COMMON_ARTIST_MAP).some(k => s2.toLowerCase() === k.toLowerCase()) ||
                          /(워십|찬양|worship|praise|band|밴드|ministry)/i.test(s2) ||
                          (authorClean && (authorClean.toLowerCase().includes(s2.toLowerCase()) || s2.toLowerCase().includes(authorClean.toLowerCase())));
    const isPart1Artist = Object.keys(COMMON_ARTIST_MAP).some(k => s1.toLowerCase() === k.toLowerCase()) ||
                          /(워십|찬양|worship|praise|band|밴드|ministry)/i.test(s1) ||
                          (authorClean && (authorClean.toLowerCase().includes(s1.toLowerCase()) || s1.toLowerCase().includes(authorClean.toLowerCase())));

    if (isPart2Artist && !isPart1Artist) {
      return { title: s1, artist: s2, subtitle: subTitle };
    } else {
      return { title: s2, artist: s1 || authorClean || '', subtitle: subTitle };
    }
  }

  // 4-1. "곡명 (아티스트)" 형태 분리 (예: "예수 늘 함께 하시네 (피아워십)", "은혜 (손경민)")
  const pEndMatch = str.match(/^([^\(\)]+)\s*\(([^\)]+)\)$/);
  if (pEndMatch) {
    const rawT = sanitizeForQuery(pEndMatch[1]);
    const rawA = sanitizeForQuery(pEndMatch[2]);
    if (rawT && rawA) {
      const isPart2Artist = Object.keys(COMMON_ARTIST_MAP).some(k => rawA.toLowerCase() === k.toLowerCase()) ||
                            /(워십|찬양|worship|praise|band|밴드|ministry)/i.test(rawA);
      const isPart1Artist = Object.keys(COMMON_ARTIST_MAP).some(k => rawT.toLowerCase() === k.toLowerCase());
      if (isPart2Artist || !isPart1Artist) {
        return { title: rawT, artist: rawA, subtitle: '' };
      } else {
        return { title: rawA, artist: rawT, subtitle: '' };
      }
    }
  }

  // 4-2. 일반 괄호 분리 (예: "프로미스나인 (fromis_9) DM")
  const pM2 = str.match(/^([^\(\)]+)\s*\(([^\)]+)\)\s*(.*)$/);
  if (pM2 && pM2[3] && pM2[3].trim().length >= 1) {
    const a = /[\uAC00-\uD7AF]/.test(pM2[1]) ? pM2[1].trim() : pM2[2].trim();
    const t = sanitizeForQuery(pM2[3]);
    if (t) return { title: t, artist: a, subtitle: '' };
  }

  // 5. 구분자 없이 공백으로만 아티스트와 곡명이 이어진 경우 (예: "박재정 헤어지자 말해요", "뉴진스 Hype Boy")
  const cleanFull = sanitizeForQuery(str.replace(/\([^\)]*\)/g, ' '));
  if (cleanFull) {
    const lowerFull = cleanFull.toLowerCase();
    for (const [artistKey, aliases] of Object.entries(COMMON_ARTIST_MAP)) {
      const artLow = artistKey.toLowerCase();
      if (lowerFull.startsWith(artLow + ' ')) {
        const foundTit = cleanFull.substring(artistKey.length).trim();
        if (foundTit.length >= 1) {
          return { title: foundTit, artist: artistKey, subtitle: '' };
        }
      } else if (lowerFull.endsWith(' ' + artLow)) {
        const foundTit = cleanFull.substring(0, cleanFull.length - artistKey.length).trim();
        if (foundTit.length >= 1) {
          return { title: foundTit, artist: artistKey, subtitle: '' };
        }
      }
    }
  }

  // 6. 기본 정제
  const authorClean = rawAuthor && !isChannelPublisher(rawAuthor) ? rawAuthor : '';
  return { title: cleanFull || rawTitle, artist: authorClean || '', subtitle: '' };
}

// 3. YouTube 영상 제목에서 불필요한 태그/수식어 지능형 정제 및 최적의 검색어 후보군 생성
function getLyricsSearchCandidates(track) {
  const titles = [];
  if (track && track.title) titles.push(track.title);

  const analyzed = analyzeTrackTitle(track ? track.title : '', track ? (track.author || '') : '');

  // 현재 YouTube Player 내부의 실제 영상 제목도 함께 조회
  if (ytPlayer && typeof ytPlayer.getVideoData === 'function') {
    try {
      const vData = ytPlayer.getVideoData();
      if (vData && vData.title && !titles.includes(vData.title)) {
        titles.push(vData.title);
      }
    } catch (e) {}
  }

  const exactPairs = []; // [{ artist, title }]
  const queryStrings = []; // ['artist title', 'title']

  const addPair = (a, t) => {
    const artist = sanitizeForQuery(a);
    const title = sanitizeForQuery(t);
    if (artist && title && artist.length >= 1 && title.length >= 1) {
      if (!exactPairs.some(p => p.artist.toLowerCase() === artist.toLowerCase() && p.title.toLowerCase() === title.toLowerCase())) {
        exactPairs.push({ artist, title });
      }
      const combined = `${artist} ${title}`;
      if (!queryStrings.includes(combined)) queryStrings.push(combined);

      const isArtistLike = Object.keys(COMMON_ARTIST_MAP).some(k => title.toLowerCase() === k.toLowerCase()) ||
                           (track && track.author && title.toLowerCase() === track.author.toLowerCase());
      if (!isArtistLike && title.length >= 2 && !queryStrings.includes(title)) {
        queryStrings.push(title);
      }
    }
  };

  // 정밀 분석 엔진의 결과(분석된 아티스트 + 곡명)를 1순위로 즉시 등록 (별칭 및 부제까지 모두 확장)
  if (analyzed.artist && analyzed.title) {
    const artList = expandArtistNames(analyzed.artist);
    const titList = expandTitleNames(analyzed.title);
    for (const a of artList) {
      for (const t of titList) {
        addPair(a, t);
      }
    }
    if (analyzed.subtitle) {
      const subTitles = expandTitleNames(analyzed.subtitle);
      for (const a of artList) {
        for (const st of subTitles) {
          addPair(a, st);
        }
      }
    }
  } else if (analyzed.title) {
    const titList = expandTitleNames(analyzed.title);
    for (const t of titList) {
      if (t.length >= 2 && !queryStrings.includes(t)) queryStrings.push(t);
    }
  }

  for (const raw of titles) {
    if (!raw || raw.startsWith('YouTube 영상')) continue;

    // 1단계: 부제목/가사/자막/kpop lyric 등 수식어 완벽 배제
    let stripped = cleanTitleNoise(raw);

    // 2단계: 따옴표나 홑따옴표로 둘러싸인 곡명 추출 (예: DAY6(데이식스) "한 페이지가 될 수 있게", NewJeans 'Ditto')
    const quoteMatches = stripped.match(/['"「」『』]([^'"「」『』]+)['"「」『』]/);
    if (quoteMatches && quoteMatches[1]) {
      const quotedTitle = sanitizeForQuery(quoteMatches[1]);
      const beforeQuote = sanitizeForQuery(stripped.substring(0, quoteMatches.index));
      if (beforeQuote && quotedTitle) {
        const artists = expandArtistNames(beforeQuote);
        const titles = expandTitleNames(quotedTitle);
        for (const a of artists) {
          for (const t of titles) {
            addPair(a, t);
          }
        }
      }
    }

    // 3단계: 구분자 ' - ', ' – ', ' — ', ' : ', ' | ', ' / ' 분리
    const sepMatch = stripped.match(/^(.+?)\s+[\-–—:\/|]\s+(.+)$/);
    if (sepMatch) {
      const leftPart = sepMatch[1];
      const rightPart = sepMatch[2].replace(/\((feat|ft)\.[^\)]*\)/gi, ' ');
      const artists = expandArtistNames(leftPart);
      const titlesSub = expandTitleNames(rightPart);
      for (const a of artists) {
        for (const t of titlesSub) {
          addPair(a, t);
        }
      }

      // 제목 - 아티스트 역방향도 함께 등록
      const artistsRev = expandArtistNames(rightPart);
      const titlesSubRev = expandTitleNames(leftPart);
      for (const a of artistsRev) {
        for (const t of titlesSubRev) {
          addPair(a, t);
        }
      }
    }

    // 4단계: 괄호 내용 전체 제거한 베이스 스트링 + 공백으로만 구분된 아티스트/곡명 자동 분리
    const cleanFull = sanitizeForQuery(stripped.replace(/\([^\)]*\)/g, ' '));
    if (cleanFull) {
      // 하이픈 없이 "뉴진스 Hype Boy", "아이유 밤편지" 형태 자동 분리
      for (const [artistKey, aliases] of Object.entries(COMMON_ARTIST_MAP)) {
        const lowerFull = cleanFull.toLowerCase();
        let foundArt = null;
        let foundTit = null;
        if (lowerFull.startsWith(artistKey.toLowerCase() + ' ')) {
          foundArt = artistKey;
          foundTit = cleanFull.substring(artistKey.length).trim();
        } else if (lowerFull.endsWith(' ' + artistKey.toLowerCase())) {
          foundArt = artistKey;
          foundTit = cleanFull.substring(0, cleanFull.length - artistKey.length).trim();
        }
        if (foundArt && foundTit && foundTit.length >= 2) {
          const artList = expandArtistNames(foundArt);
          const titList = expandTitleNames(foundTit);
          for (const a of artList) {
            for (const t of titList) {
              addPair(a, t);
            }
          }
        }
      }

      if (!queryStrings.includes(cleanFull)) {
        queryStrings.push(cleanFull);
      }
    }

    // 5단계: author와 조합 (단, 1theK, SMTOWN, HYBE 등 유통사/채널명은 아티스트로 오인되지 않도록 배제)
    if (track && track.author && track.author !== 'YouTube' && !isChannelPublisher(track.author)) {
      const cleanAuthor = sanitizeForQuery(track.author.replace(/ - Topic$/i, '').replace(/Official$/i, ''));
      if (cleanAuthor) {
        const authorAliases = expandArtistNames(cleanAuthor);
        const titleAliases = cleanFull ? expandTitleNames(cleanFull) : [];
        for (const al of authorAliases) {
          if (titleAliases.length > 0) {
            for (const t of titleAliases) {
              addPair(al, t);
            }
          } else if (cleanFull) {
            addPair(al, cleanFull);
          }
        }
        if (cleanFull && !cleanFull.toLowerCase().includes(cleanAuthor.toLowerCase())) {
          queryStrings.push(`${cleanAuthor} ${cleanFull}`);
        }
      }
    }
  }

  // 영문/로마자 아티스트 & 곡명 조합을 최우선으로 정렬 (LRCLIB 글로벌 인덱스가 영문명 우선 매칭됨)
  exactPairs.sort((p1, p2) => {
    const p1Ascii = (/^[A-Za-z0-9\s'&.\-]+$/.test(p1.artist) ? 2 : 0) + (/^[A-Za-z0-9\s'&.\-]+$/.test(p1.title) ? 1 : 0);
    const p2Ascii = (/^[A-Za-z0-9\s'&.\-]+$/.test(p2.artist) ? 2 : 0) + (/^[A-Za-z0-9\s'&.\-]+$/.test(p2.title) ? 1 : 0);
    return p2Ascii - p1Ascii;
  });

  // 중복 제거 및 유효한 검색어만 필터링
  const unique = [];
  for (const q of queryStrings) {
    const trimmed = sanitizeForQuery(q);
    if (trimmed.length >= 2 && !unique.includes(trimmed)) {
      unique.push(trimmed);
    }
  }

  return { exactPairs, queries: unique, analyzed };
}

// 3-9. 가사 라인 정리 및 시간순 정렬 (전주/간주/후주 인위적 가짜 라인 삽입 없이 순수 원곡 싱크 가사 정밀 유지)
function processLyricsWithInterludes(rawLyrics, totalDuration = 0) {
  if (!Array.isArray(rawLyrics) || rawLyrics.length === 0) return [];

  return rawLyrics
    .filter(l => l && typeof l.text === 'string' && l.text.trim().length > 0)
    .map(l => ({
      time: typeof l.time === 'number' ? Math.max(0, l.time) : -1,
      text: l.text.trim(),
      isInterlude: false
    }))
    .sort((a, b) => a.time - b.time);
}

// 4. LRC 타임스탬프 파서 ([mm:ss.xx] 가사)
function parseLRC(lrcText, totalDuration = 0) {
  if (!lrcText) return [];
  const lines = lrcText.split(/\r?\n/);
  const result = [];
  const timeRegex = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  const metaRegex = /^\[(ti|ar|al|by|length|re|ve):/i;

  let offsetSec = 0;
  for (const line of lines) {
    const offM = line.trim().match(/^\[offset:\s*([+-]?\d+)\s*\]/i);
    if (offM) {
      offsetSec = (parseInt(offM[1], 10) || 0) / 1000;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (metaRegex.test(trimmed)) continue;
    if (/^\[offset:/i.test(trimmed)) continue;

    timeRegex.lastIndex = 0;
    const timestamps = [];
    let match;
    while ((match = timeRegex.exec(trimmed)) !== null) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      let ms = 0;
      if (match[3]) {
        if (match[3].length === 1) ms = parseInt(match[3], 10) * 100;
        else if (match[3].length === 2) ms = parseInt(match[3], 10) * 10;
        else ms = parseInt(match[3].substring(0, 3), 10);
      }
      const finalTime = Math.max(0, (min * 60 + sec + ms / 1000) + offsetSec);
      timestamps.push(finalTime);
    }

    const text = trimmed.replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g, '').trim();
    if (timestamps.length > 0 && text) {
      for (const t of timestamps) {
        // 초반부 (<=4.5초)에 아티스트/곡명/크레딧/안내 라인이 포함된 경우 가사 라인에서 제외
        if (t <= 4.5 && isLrcHeaderOrCreditLine(text)) {
          continue;
        }
        result.push({ time: t, text });
      }
    }
  }

  result.sort((a, b) => a.time - b.time);
  return processLyricsWithInterludes(result, totalDuration);
}

function isLrcHeaderOrCreditLine(str) {
  if (!str) return false;
  const s = str.trim().toLowerCase();
  // 단순 섹션 표시 [intro], (intro) 등
  if (/^(\(|\[)?(intro|verse|chorus|outro|bridge|hook)(\)|\])?$/i.test(s)) return true;
  // 크레딧 표시 (작사, 작곡, 편곡, vocal, composer 등)
  if (/(작사|작곡|편곡|lyrics|composer|composed|arranged|produced|arranger)\s*[:：\/]/i.test(s)) return true;
  if (/^(작사|작곡|편곡|lyrics|arranger)\b/i.test(s)) return true;
  // "아티스트 - 곡명" 또는 "곡명 - 아티스트" 구분자 (공백 동반 하이픈)
  if (/\s+[-–—]\s+/.test(s) && (s.includes('feat') || s.includes('prod') || s.includes('(') || s.length < 50)) return true;
  return false;
}

function clearCachedLyrics(key) {
  if (!key) return;
  const k = String(key);
  lyricsCache.delete(k);
  try {
    sessionStorage.removeItem(`${LYRICS_CACHE_PREFIX}${k}`);
  } catch (e) {}
}

// 4-1. 한국 대표 음원(Bugs Music) 타임스탬프 실시간 싱크 가사 파서 (<초>|<가사>＃... 포맷)
function parseBugsLyrics(rawLyrics, trackTitle = '', artist = '', totalDuration = 0) {
  if (!rawLyrics) return null;
  const lines = rawLyrics.split(/[\n\r＃\uFF03]/).map(l => l.trim()).filter(Boolean);
  const parsed = [];
  for (const line of lines) {
    const pipeIdx = line.indexOf('|');
    if (pipeIdx > 0) {
      const time = parseFloat(line.substring(0, pipeIdx).trim());
      const text = line.substring(pipeIdx + 1).trim();
      if (!isNaN(time) && text) {
        parsed.push({ time, text });
      }
    } else if (line) {
      parsed.push({ time: -1, text: line });
    }
  }
  if (parsed.length === 0) return null;
  parsed.sort((a, b) => a.time - b.time);
  const isSynced = parsed.some(p => p.time >= 0);
  const processed = isSynced ? processLyricsWithInterludes(parsed, totalDuration) : parsed;
  return {
    type: isSynced ? 'synced' : 'plain',
    isSmartSync: !isSynced,
    lyrics: processed,
    trackName: trackTitle || '',
    artistName: artist || '',
    source: 'online-bugs'
  };
}

// 4-2. 한국 음원 대표사(Bugs 싱크 + Melon 전곡) 가사 API 호출 (로컬 프록시 연동)
async function fetchKoreanLyricsApi(query, abortSignal = null) {
  if (!query) return null;
  try {
    const controller = new AbortController();
    const onParentAbort = () => controller.abort();
    if (abortSignal) {
      if (abortSignal.aborted) return null;
      abortSignal.addEventListener('abort', onParentAbort, { once: true });
    }
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`/api/korean-lyrics?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (abortSignal) abortSignal.removeEventListener('abort', onParentAbort);

    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.success && data.rawLyrics) {
      if (data.source === 'melon' || data.type === 'plain') {
        const plainLines = data.rawLyrics.split('\n').map(l => l.trim()).filter(Boolean);
        if (plainLines.length > 0) {
          return applySmartPlainSync({
            type: 'plain',
            isSmartSync: true,
            lyrics: plainLines.map(text => ({ time: -1, text })),
            trackName: data.trackTitle || '',
            artistName: data.artist || '',
            source: 'online-melon'
          });
        }
      }
      return parseBugsLyrics(data.rawLyrics, data.trackTitle, data.artist);
    }
  } catch (e) {}
  return null;
}

// 4-3. 글로벌 가사 플랫폼 Genius 가사 API 호출 (로컬 프록시 연동)
async function fetchGeniusLyricsApi(query, abortSignal = null) {
  if (!query) return null;
  try {
    const controller = new AbortController();
    const onParentAbort = () => controller.abort();
    if (abortSignal) {
      if (abortSignal.aborted) return null;
      abortSignal.addEventListener('abort', onParentAbort, { once: true });
    }
    const timer = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(`/api/genius-lyrics?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (abortSignal) abortSignal.removeEventListener('abort', onParentAbort);

    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.success && data.lyrics) {
      const plainLines = data.lyrics.split('\n').map(l => l.trim()).filter(Boolean);
      if (plainLines.length > 0) {
        return applySmartPlainSync({
          type: 'plain',
          isSmartSync: true,
          lyrics: plainLines.map(text => ({ time: -1, text })),
          trackName: data.trackTitle || '',
          artistName: data.artist || '',
          source: 'online-genius'
        });
      }
    }
  } catch (e) {}
  return null;
}

// 5. 전 세계 온라인 가사 클라우드 초고속 통합 실시간 검색 (한국 음원 API 1순위 + LRCLIB 정밀 매칭 + 스마트 캐시)
async function fetchLyrics(track, manualQuery = null, abortSignal = null) {
  if (!track && !manualQuery) return null;
  const vid = track ? (track.videoId || track.id) : null;
  const qClean = manualQuery ? sanitizeForQuery(manualQuery) : '';
  const qCacheKey = qClean ? `q_${qClean.toLowerCase()}` : null;

  // 1. 사용자 커스텀 등록 가사 최우선 확인 (0ms)
  if (vid) {
    try {
      const customStr = localStorage.getItem('ply_custom_lyrics_' + vid);
      if (customStr) {
        const customData = JSON.parse(customStr);
        if (customData && customData.rawText) {
          const raw = customData.rawText;
          if (/\[\d{2}:\d{2}/.test(raw)) {
            const parsed = parseLRC(raw);
            if (parsed.length > 0) {
              return {
                type: 'synced',
                isSmartSync: false,
                isCustom: true,
                lyrics: parsed,
                trackName: track ? track.title : (customData.trackTitle || '직접 등록한 가사'),
                artistName: track ? (track.author || '') : '',
                source: 'custom'
              };
            }
          }
          const plainLines = raw.split('\n').map(l => l.trim()).filter(Boolean);
          if (plainLines.length > 0) {
            return applySmartPlainSync({
              type: 'plain',
              isSmartSync: true,
              isCustom: true,
              lyrics: plainLines.map(text => ({ time: -1, text })),
              trackName: track ? track.title : (customData.trackTitle || '직접 등록한 가사'),
              artistName: track ? (track.author || '') : '',
              source: 'custom'
            });
          }
        }
      }
    } catch (e) {}
  }

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  // 헬퍼: 검색 결과 정합성 정밀 검증 (오매칭 원천 차단 & 커버/MR 배제, 유연하고 신속한 매칭)
  const isValidCandidate = (item, trk, mQuery) => {
    if (!item) return false;
    const rawItemTitle = (item.trackName || item.name || '').trim();
    if (!rawItemTitle) return false;
    const rawArtist = (item.artistName || '').trim();

    const norm = (str) => (str || '').toLowerCase().replace(/[\s\-_\[\]\(\)\{\}'",\.!?]/g, '');
    const tNorm = norm(rawItemTitle);
    const aNorm = norm(rawArtist);
    if (!tNorm) return false;

    // 1. Inst / MR / 피아노 커버 감점 및 배제 (원곡 검색 시 커버/반주곡 오매칭 원천 차단)
    const isCandInst = /[\(\[]\s*(?:inst|instrumental|mr|반주|cover|커버|piano|피아노)\b/i.test(rawItemTitle);
    const rawContext = `${trk ? trk.title : ''} ${trk ? (trk.author || '') : ''} ${mQuery || ''}`;
    const isTargetInst = /[\(\[]\s*(?:inst|instrumental|mr|반주)\b/i.test(rawContext);
    if (isCandInst && !isTargetInst) return false;

    // 2. 목표 곡명 및 아티스트 추출
    let targetTitle = '';
    let targetArtist = '';
    let subtitle = '';

    if (mQuery) {
      const qAnalyzed = analyzeTrackTitle(mQuery);
      targetTitle = qAnalyzed.title || mQuery;
      targetArtist = qAnalyzed.artist || '';
      subtitle = qAnalyzed.subtitle || '';
    } else if (trk) {
      const analyzed = analyzeTrackTitle(trk.title, trk.author);
      targetTitle = analyzed.title || trk.title || '';
      targetArtist = analyzed.artist || (trk.author && !isChannelPublisher(trk.author) ? trk.author : '');
      subtitle = analyzed.subtitle || '';
    }

    const expTitleNorm = norm(targetTitle);
    const rawFullNorm = norm(rawContext);
    const expArtNorm = norm(targetArtist);

    // 3. 제목 일치도 검증
    let isTitleMatch = false;

    // 3-1. 원본 영상 제목/검색어에 후보 곡명이 포함되어 있거나 그 반대인 경우 (길이 2 이상)
    if (tNorm.length >= 2 && rawFullNorm.includes(tNorm)) {
      isTitleMatch = true;
    } else if (expTitleNorm.length >= 2 && (tNorm.includes(expTitleNorm) || expTitleNorm.includes(tNorm))) {
      isTitleMatch = true;
    } else if (subtitle && norm(subtitle).length >= 2 && (tNorm.includes(norm(subtitle)) || norm(subtitle).includes(tNorm))) {
      isTitleMatch = true;
    } else if (expArtNorm && tNorm === expArtNorm) {
      // 아티스트와 곡명이 뒤바뀐 경우
      isTitleMatch = true;
    } else {
      // 3-2. 동의어 / 번역명 확장 확인
      const expectedTitleList = expandTitleNames(targetTitle);
      if (subtitle) {
        expandTitleNames(subtitle).forEach(st => {
          if (!expectedTitleList.some(x => x.toLowerCase() === st.toLowerCase())) expectedTitleList.push(st);
        });
      }
      for (const expT of expectedTitleList) {
        const etNorm = norm(expT);
        if (etNorm && tNorm) {
          if (etNorm.includes(tNorm) || tNorm.includes(etNorm)) {
            isTitleMatch = true;
            break;
          }
        }
      }
      // 3-3. 단어 토큰 매칭
      if (!isTitleMatch) {
        const STOPWORDS = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'it', 'me', 'my', 'you', 'your', 'with', 'by', 'mv', 'ver', 'version', 'official', 'audio', 'video']);
        const itemTokens = rawItemTitle.toLowerCase().replace(/[^\w\uAC00-\uD7AF\u1100-\u11FF]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !STOPWORDS.has(w));
        const hasTokenMatch = itemTokens.some(tok => rawFullNorm.includes(tok));
        if (hasTokenMatch && itemTokens.length > 0) {
          isTitleMatch = true;
        }
      }
    }

    if (!isTitleMatch) return false;

    // 4. 아티스트 정합성 검증
    // 채널 배급사이거나 타겟 아티스트 정보가 없는 경우 패스
    if (!expArtNorm || expArtNorm.length < 2 || isChannelPublisher(targetArtist)) {
      return true;
    }
    // 원본 영상 제목이나 채널명에 후보 아티스트명이 포함되어 있으면 100% 매칭
    if (aNorm && aNorm.length >= 2 && rawFullNorm.includes(aNorm)) {
      return true;
    }

    const expectedArtists = expandArtistNames(targetArtist);
    const normArtists = expectedArtists.map(a => norm(a)).filter(Boolean);
    const isArtCompatible = normArtists.some(na => na === aNorm || na.includes(aNorm) || aNorm.includes(na));

    if (isArtCompatible) return true;

    // CCM / 찬양 / 워십 또는 커버 영상의 경우, 다른 워십팀/교회의 찬양 실황이나 커버 영상이더라도 원곡/원작자의 가사를 온전히 수용
    const isWorshipContext = /[\s\-_\[\]\(\)](?:ccm|찬양|워십|예배|특송|성가|worship|praise|gospel)\b/i.test(rawContext) ||
                             /(워십|찬양|교회|미니스트리|찬양단|찬양팀|worship|praise|ministry|choir)/i.test(targetArtist) ||
                             /(워십|찬양|교회|미니스트리|찬양단|찬양팀|worship|praise|ministry|choir)/i.test(rawArtist) ||
                             /(마커스|위러브|피아워십|제이어스|어노인팅|아이자야|손경민|염평안|찬미워십|예수전도단|hillsong|bethel|elevation)/i.test(targetArtist) ||
                             /(마커스|위러브|피아워십|제이어스|어노인팅|아이자야|손경민|염평안|찬미워십|예수전도단|hillsong|bethel|elevation)/i.test(rawArtist);
    const isCoverContext = /(?:cover|커버|가창|노래)/i.test(rawContext);

    if (isWorshipContext || isCoverContext) {
      return true;
    }

    // 만약 영상 제목에 후보 아티스트명이 전혀 없고 타겟 아티스트와 완전히 충돌하는 경우에만 배제
    if (expArtNorm.length >= 3 && aNorm.length >= 3 && !rawFullNorm.includes(aNorm) && !aNorm.includes(expArtNorm)) {
      return false;
    }

    return true;
  };

  // 2. 캐시 확인 시 분석된 곡명/아티스트와 일치하는지 엄격 검증 (오매칭된 과거 캐시 즉각 무효화 & 실시간 검색 보장)
  if (qCacheKey) {
    const cached = getCachedLyrics(qCacheKey);
    if (cached && cached.lyrics && cached.lyrics.length > 0) {
      if (isValidCandidate({ trackName: cached.trackName, artistName: cached.artistName }, track, manualQuery)) {
        return cached;
      }
      clearCachedLyrics(qCacheKey);
    }
  }
  if (!manualQuery && vid) {
    const cached = getCachedLyrics(vid);
    if (cached && cached.lyrics && cached.lyrics.length > 0) {
      if (isValidCandidate({ trackName: cached.trackName, artistName: cached.artistName }, track, null)) {
        return cached;
      }
      clearCachedLyrics(vid);
    }
  }

  // Helper: LRCLIB API 호출 (Lrclib-Client 헤더 및 503/429 시 지능형 백오프 재시도)
  const fetchLrclibJson = async (url, retryCount = 1) => {
    try {
      const controller = new AbortController();
      const onParentAbort = () => controller.abort();
      if (abortSignal) {
        if (abortSignal.aborted) return null;
        abortSignal.addEventListener('abort', onParentAbort, { once: true });
      }
      const timer = setTimeout(() => controller.abort(), 5500);

      let res;
      try {
        res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Lrclib-Client': 'PlySite/2.9.4 (https://github.com/plysite)'
          }
        });
      } catch (err) {
        if (abortSignal && abortSignal.aborted) return null;
        res = await fetch(url, { signal: controller.signal });
      }

      clearTimeout(timer);
      if (abortSignal) abortSignal.removeEventListener('abort', onParentAbort);

      if (res.status === 503 || res.status === 429) {
        if (retryCount > 0 && (!abortSignal || !abortSignal.aborted)) {
          let waitMs = 1200;
          try {
            const ra = res.headers.get('retry-after');
            if (ra && !isNaN(parseInt(ra, 10))) {
              waitMs = Math.max(1000, parseInt(ra, 10) * 1000 + 200);
            }
          } catch (e) {}
          await delay(waitMs);
          return await fetchLrclibJson(url, retryCount - 1);
        }
        return null;
      }

      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  };

  // Helper: 파싱 및 통일된 데이터 구조 반환
  const buildResult = (item, type = 'synced') => {
    if (!item) return null;
    if (type === 'synced') {
      if (item.syncedLyrics && item.syncedLyrics.trim().length > 0) {
        const parsed = parseLRC(item.syncedLyrics, item.duration || 0);
        if (parsed.length > 0) {
          return {
            type: 'synced',
            isSmartSync: false,
            lyrics: parsed,
            trackName: item.trackName || item.name || (track ? track.title : ''),
            artistName: item.artistName || (track ? track.author : ''),
            duration: item.duration || 0,
            source: 'online-lrclib'
          };
        }
      }
      return null;
    }
    if (item.plainLyrics && item.plainLyrics.trim().length > 0) {
      const plainLines = item.plainLyrics.split('\n').map(l => l.trim()).filter(Boolean);
      if (plainLines.length > 0) {
        return applySmartPlainSync({
          type: 'plain',
          isSmartSync: true,
          lyrics: plainLines.map(text => ({ time: -1, text })),
          trackName: item.trackName || item.name || (track ? track.title : ''),
          artistName: item.artistName || (track ? track.author : ''),
          duration: item.duration || 0,
          source: 'online-lrclib'
        }, item.duration || 0);
      }
    }
    return null;
  };

  // --- [A] 수동 검색 모드 ---
  if (manualQuery) {
    const rawQ = manualQuery.trim();
    if (!rawQ) return null;
    const cleanedQ = cleanTitleNoise(rawQ);

    // 1단계: 국내 음원 포털 (Bugs 실시간 싱크 + Melon 전곡 DB) 초고속 프록시 조회 (~200ms)
    const krRes = await fetchKoreanLyricsApi(cleanedQ, abortSignal);
    if (krRes && krRes.lyrics && krRes.lyrics.length > 0) {
      if (isValidCandidate({ trackName: krRes.trackName, artistName: krRes.artistName }, track, manualQuery)) {
        setCachedLyrics(qCacheKey, krRes);
        if (vid) setCachedLyrics(vid, krRes);
        return krRes;
      }
    }

    // 2단계: LRCLIB (글로벌 싱크) + Genius (세계 최대 170만+ DB) 초고속 병렬 동시 요청 (~300ms)
    const lrclibPromise = (async () => {
      try {
        const list = await fetchLrclibJson(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanedQ)}`);
        if (Array.isArray(list) && list.length > 0) {
          const valid = list.filter(it => isValidCandidate(it, track, manualQuery));
          const withSync = valid.find(it => it.syncedLyrics && it.syncedLyrics.trim().length > 0);
          if (withSync) return buildResult(withSync, 'synced');
          const withPlain = valid.find(it => it.plainLyrics && it.plainLyrics.trim().length > 0);
          if (withPlain) return buildResult(withPlain, 'plain');
        }
      } catch (e) {}
      return null;
    })();

    const geniusPromise = (async () => {
      try {
        const gRes = await fetchGeniusLyricsApi(cleanedQ, abortSignal);
        if (gRes && gRes.lyrics && gRes.lyrics.length > 0 && isValidCandidate({ trackName: gRes.trackName, artistName: gRes.artistName }, track, manualQuery)) {
          return gRes;
        }
      } catch (e) {}
      return null;
    })();

    const [lrclibOut, geniusOut] = await Promise.allSettled([lrclibPromise, geniusPromise]);
    const lRes = lrclibOut.status === 'fulfilled' ? lrclibOut.value : null;
    const gRes = geniusOut.status === 'fulfilled' ? geniusOut.value : null;

    if (lRes && lRes.type === 'synced') {
      setCachedLyrics(qCacheKey, lRes);
      if (vid) setCachedLyrics(vid, lRes);
      return lRes;
    }
    if (gRes && gRes.lyrics) {
      setCachedLyrics(qCacheKey, gRes);
      if (vid) setCachedLyrics(vid, gRes);
      return gRes;
    }
    if (lRes && lRes.lyrics) {
      setCachedLyrics(qCacheKey, lRes);
      if (vid) setCachedLyrics(vid, lRes);
      return lRes;
    }

    return null;
  }

  // --- [B] 자동 온라인 매칭 모드 (유튜브 제목 자동 분석) ---
  const { exactPairs, queries, analyzed } = getLyricsSearchCandidates(track);

  let bestArtist = '';
  let bestTitle = '';
  let bestQuery = '';

  if (exactPairs.length > 0) {
    bestArtist = exactPairs[0].artist;
    bestTitle = exactPairs[0].title;
    bestQuery = `${bestArtist} ${bestTitle}`.trim();
  } else if (analyzed.title) {
    bestTitle = analyzed.title;
    bestArtist = analyzed.artist || '';
    bestQuery = bestArtist ? `${bestArtist} ${bestTitle}` : bestTitle;
  } else if (queries.length > 0) {
    bestQuery = queries[0];
    bestTitle = queries[0];
  } else {
    bestQuery = cleanTitleNoise(track ? track.title : '');
    bestTitle = bestQuery;
  }

  // 1단계: Bugs(싱크) + Melon(전곡) 국내 음원사 초고속 단일 조회 (평균 150~300ms)
  if (bestQuery) {
    if (abortSignal && abortSignal.aborted) return null;
    const krRes = await fetchKoreanLyricsApi(bestQuery, abortSignal);
    if (krRes && krRes.lyrics && krRes.lyrics.length > 0) {
      if (isValidCandidate({ trackName: krRes.trackName, artistName: krRes.artistName }, track, null)) {
        if (vid) setCachedLyrics(vid, krRes);
        return krRes;
      }
    }

    // 곡명 단독 보조 1회 (아티스트 오매칭 가능성 배제)
    if (bestTitle && bestTitle !== bestQuery && bestTitle.length >= 2) {
      if (abortSignal && abortSignal.aborted) return null;
      const krRes2 = await fetchKoreanLyricsApi(bestTitle, abortSignal);
      if (krRes2 && krRes2.lyrics && krRes2.lyrics.length > 0) {
        if (isValidCandidate({ trackName: krRes2.trackName, artistName: krRes2.artistName }, track, null)) {
          if (vid) setCachedLyrics(vid, krRes2);
          return krRes2;
        }
      }
    }
  }

  // 2단계: LRCLIB (글로벌 싱크) + Genius (세계 최대 170만+ 가사 DB) 초고속 병렬 동시 요청 (~300ms)
  const lrclibPromise = (async () => {
    try {
      // 1) 구조화 /api/get 시도
      if (bestArtist && bestTitle) {
        const item = await fetchLrclibJson(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(bestArtist)}&track_name=${encodeURIComponent(bestTitle)}`);
        if (item && item.syncedLyrics && isValidCandidate(item, track, null)) {
          const res = buildResult(item, 'synced');
          if (res) return res;
        }
      }
      // 2) 텍스트 쿼리 /api/search?q=
      const qToSearch = bestQuery || bestTitle;
      if (qToSearch) {
        const list = await fetchLrclibJson(`https://lrclib.net/api/search?q=${encodeURIComponent(qToSearch)}`);
        if (Array.isArray(list) && list.length > 0) {
          const valid = list.filter(it => isValidCandidate(it, track, null));
          const withSync = valid.find(it => it.syncedLyrics && it.syncedLyrics.trim().length > 0);
          if (withSync) return buildResult(withSync, 'synced');
          const withPlain = valid.find(it => it.plainLyrics && it.plainLyrics.trim().length > 0);
          if (withPlain) return buildResult(withPlain, 'plain');
        }
      }
    } catch (e) {}
    return null;
  })();

  const geniusPromise = (async () => {
    try {
      const gq = bestQuery || bestTitle;
      if (gq) {
        const gRes = await fetchGeniusLyricsApi(gq, abortSignal);
        if (gRes && gRes.lyrics && gRes.lyrics.length > 0 && isValidCandidate({ trackName: gRes.trackName, artistName: gRes.artistName }, track, null)) {
          return gRes;
        }
      }
    } catch (e) {}
    return null;
  })();

  const [lrclibOut, geniusOut] = await Promise.allSettled([lrclibPromise, geniusPromise]);
  const lRes = lrclibOut.status === 'fulfilled' ? lrclibOut.value : null;
  const gRes = geniusOut.status === 'fulfilled' ? geniusOut.value : null;

  // 싱크 가사 우선 반환, 그 다음 일반 가사
  if (lRes && lRes.type === 'synced') {
    if (vid) setCachedLyrics(vid, lRes);
    return lRes;
  }
  if (gRes && gRes.lyrics) {
    if (vid) setCachedLyrics(vid, gRes);
    return gRes;
  }
  if (lRes && lRes.lyrics) {
    if (vid) setCachedLyrics(vid, lRes);
    return lRes;
  }

  // 3단계: 최종 해외 보조 lyrics.ovh
  if (bestArtist && bestTitle) {
    try {
      const ovhRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(bestArtist)}/${encodeURIComponent(bestTitle)}`, { signal: abortSignal });
      if (ovhRes.ok) {
        const ovhData = await ovhRes.json();
        if (ovhData && ovhData.lyrics && ovhData.lyrics.trim().length > 0) {
          const plainLines = ovhData.lyrics.split('\n').map(l => l.trim()).filter(Boolean);
          const res = applySmartPlainSync({
            type: 'plain',
            isSmartSync: true,
            lyrics: plainLines.map(text => ({ time: -1, text })),
            trackName: bestTitle,
            artistName: bestArtist,
            source: 'online-lyricsovh'
          });
          if (vid) setCachedLyrics(vid, res);
          return res;
        }
      }
    } catch (e) {}
  }

  return null;
}

// 5. 가사 렌더링 (경쟁 상태 방지 & 요청 취소 제어 & 영구 캐시 즉시 복원)
function renderLyricsSuccess(data, track, vid) {
  if (!el.focusLyricsList) return;
  if (el.focusLyricsTitle && data.trackName) el.focusLyricsTitle.textContent = data.trackName;
  if (el.focusLyricsArtist) {
    const artistStr = data.artistName || (track ? track.author : '');
    el.focusLyricsArtist.textContent = artistStr;
  }

  // 영상 고유의 이전 싱크 오프셋 설정값 복원
  if (vid) {
    try {
      const savedOffset = localStorage.getItem('ply_offset_' + vid);
      lyricsSyncOffset = savedOffset !== null ? (parseFloat(savedOffset) || 0) : 0;
    } catch (e) {
      lyricsSyncOffset = 0;
    }
  } else {
    lyricsSyncOffset = 0;
  }
  updateLyricsOffsetUI();

  el.focusLyricsList.innerHTML = '';

  // 가사 엘리먼트 생성
  data.lyrics.forEach((line, index) => {
    const lineEl = document.createElement('div');
    lineEl.dataset.index = index;
    lineEl.dataset.time = line.time;

    lineEl.className = 'lyric-line';
    lineEl.textContent = line.text;

    // 싱크 가사인 경우 클릭 시 해당 구간으로 즉각 점프 (Seek-to)
    if (data.type === 'synced' && line.time >= 0) {
      lineEl.title = `${formatTime(line.time)} 구간으로 점프`;
      lineEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ytPlayer && isPlayerReady) {
          const currentLineTime = (currentLyricsData && currentLyricsData.lyrics[index])
            ? currentLyricsData.lyrics[index].time
            : line.time;
          const targetTime = Math.max(0, currentLineTime - lyricsSyncOffset);
          ytPlayer.seekTo(targetTime, true);
          isUserInteractingWithLyrics = false;
          isUserScrollingLyrics = false;
          updateLyricsHighlight(index, true);
        }
      });
    }

    el.focusLyricsList.appendChild(lineEl);
  });

  // 현재 재생 중인 시점으로 즉각 스크롤
  if (ytPlayer && isPlayerReady && data.type === 'synced') {
    try {
      const cur = ytPlayer.getCurrentTime() || 0;
      updateLyricsSync(cur);
    } catch (e) {}
  }
}

async function loadAndRenderLyrics(track, manualQuery = null) {
  if (!el.focusLyricsList) return;
  const vid = track ? (track.videoId || track.id) : null;
  currentLyricsTrackId = vid;
  activeLyricLineIndex = -1;

  // 이전 진행 중이던 가사 네트워크 요청 즉시 중단 (경쟁 상태 원천 차단)
  if (activeLyricsAbortController) {
    try { activeLyricsAbortController.abort(); } catch (e) {}
  }
  activeLyricsAbortController = new AbortController();
  const reqSeq = ++lyricsRequestSequence;
  const signal = activeLyricsAbortController.signal;

  // 실제 유튜브 플레이어 내부 메타데이터가 있다면 트랙 타이틀 갱신
  if (ytPlayer && typeof ytPlayer.getVideoData === 'function') {
    try {
      const vd = ytPlayer.getVideoData();
      if (vd && vd.title && (!track || !track.title || track.title.startsWith('YouTube 영상'))) {
        if (track) track.title = vd.title;
      }
    } catch (e) {}
  }

  // 1. 영상 제목을 즉시 정밀 분석하여 순수 곡명과 아티스트명 도출
  const analyzed = analyzeTrackTitle(track ? track.title : '', track ? (track.author || '') : '');
  const cleanTitle = analyzed.title || (track ? track.title : (manualQuery || '가사'));
  const cleanArtist = analyzed.artist || (track ? (track.author || '') : '');

  if (el.focusLyricsTitle) {
    el.focusLyricsTitle.textContent = cleanTitle;
  }
  if (el.focusLyricsArtist) {
    el.focusLyricsArtist.textContent = cleanArtist;
  }

  // ⚡ [중요] 이미 찾은 가사는 다시 나갔다 와도 영구 유지 (가사 검색은 최초 1회만!)
  if (!manualQuery) {
    let fastLyrics = (track && track.cachedLyrics) ? track.cachedLyrics : null;
    if (!fastLyrics && vid) {
      fastLyrics = getCachedLyrics(vid);
    }
    if (!fastLyrics && cleanTitle) {
      fastLyrics = getCachedLyrics(cleanTitle);
    }

    if (fastLyrics && Array.isArray(fastLyrics.lyrics) && fastLyrics.lyrics.length > 0) {
      // 이미 찾은 가사가 있으므로 네트워크 재검색 및 스피너 없이 0ms 즉각 표시
      if (track && !track.cachedLyrics) {
        track.cachedLyrics = fastLyrics;
        saveState();
      }
      if (fastLyrics.type === 'plain') {
        fastLyrics = applySmartPlainSync(fastLyrics);
      }
      currentLyricsData = fastLyrics;
      renderLyricsSuccess(fastLyrics, track, vid);
      return;
    }
  }

  // 2. 가사를 먼저 띄우지 않고, 제목 분석 결과 기반 온라인 실시간 검색 중 상태 표시 (오매칭 방지)
  el.focusLyricsList.innerHTML = `
    <div class="lyrics-status-box">
      <div class="lyrics-spinner"></div>
      <p style="font-weight: 600;">'${escapeHtml(cleanTitle)}' 온라인 가사 검색 중...</p>
      <span style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">${escapeHtml(cleanArtist ? cleanArtist + ' • ' : '')}영상 제목 분석 기반 최적 싱크 가사를 조회하고 있습니다</span>
    </div>
  `;

  let data = await fetchLyrics(track, manualQuery, signal);

  // 최신 요청이 아니거나 트랙이 변경된 경우 stale 응답 폐기
  if (reqSeq !== lyricsRequestSequence || currentLyricsTrackId !== vid) return;

  if (data && data.trackName && el.focusLyricsTitle) {
    el.focusLyricsTitle.textContent = data.trackName;
  }
  if (data && data.artistName && el.focusLyricsArtist) {
    el.focusLyricsArtist.textContent = data.artistName;
  }

  if (data && data.type === 'plain') {
    data = applySmartPlainSync(data);
  }

  currentLyricsData = data;
  el.focusLyricsList.innerHTML = '';

  if (!data || !data.lyrics || data.lyrics.length === 0) {
    const rawTitle = track ? track.title : '';
    const isComp = isCompilationVideo(rawTitle);
    const { exactPairs, queries } = getLyricsSearchCandidates(track);
    const topKeywords = [];
    if (Array.isArray(exactPairs)) {
      exactPairs.slice(0, 3).forEach(p => {
        const s = `${p.artist} ${p.title}`;
        if (!topKeywords.includes(s)) topKeywords.push(s);
      });
    }
    if (Array.isArray(queries)) {
      queries.forEach(q => {
        if (!topKeywords.includes(q)) topKeywords.push(q);
      });
    }
    const bestKeyword = topKeywords[0] || sanitizeForQuery(rawTitle) || '음악';
    const googleQuery = encodeURIComponent(bestKeyword + ' 가사');

    let compilationNoticeHtml = '';
    if (isComp) {
      compilationNoticeHtml = `
        <div class="lyrics-compilation-notice">
          <i class="fa-solid fa-circle-info" style="margin-right: 4px;"></i>
          <strong>모음/플레이리스트 영상 안내</strong><br>
          이 영상은 여러 곡이 합쳐진 모음 영상입니다. 특정 곡의 가사를 원하시면 아래 추천 키워드를 클릭하거나 곡명을 직접 검색해주세요!
        </div>
      `;
    }

    let chipsHtml = '';
    if (topKeywords.length > 0) {
      chipsHtml = `
        <p style="font-size: 0.82rem; color: rgba(255,255,255,0.6); margin-top: 6px;">💡 원클릭 온라인 검색 추천:</p>
        <div class="lyrics-chip-group">
          ${topKeywords.map(k => `<button class="lyrics-chip" data-query="${escapeHtml(k)}">${escapeHtml(k)}</button>`).join('')}
        </div>
      `;
    }

    el.focusLyricsList.innerHTML = `
      <div class="lyrics-status-box">
        <i class="fa-solid fa-microphone-slash"></i>
        <p style="font-weight: 700; font-size: 1.05rem;">일치하는 온라인 가사를 찾지 못했습니다.</p>
        ${compilationNoticeHtml}
        <button id="btn-status-custom-lyrics" class="lyrics-custom-btn">
          <i class="fa-solid fa-pen-to-square"></i> 가사 직접 등록 / 붙여넣기
        </button>
        <p style="font-size: 0.85rem; color: rgba(255,255,255,0.65); margin-top: 10px;">전 세계 온라인 가사 데이터베이스를 검색할 키워드를 입력해보세요:</p>
        <div style="display: flex; gap: 8px; width: 100%; max-width: 400px; margin-top: 6px;">
          <input type="text" id="inline-lyrics-query" value="${escapeHtml(topKeywords[0] || sanitizeForQuery(rawTitle))}" placeholder="예: 뉴진스 Hype Boy" style="flex: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.22); border-radius: 12px; color: #fff; padding: 8px 14px; font-size: 0.88rem; outline: none;" />
          <button id="btn-inline-lyrics-submit" class="btn-primary-sm" style="padding: 8px 16px;">온라인 검색</button>
        </div>
        ${chipsHtml}
        <a href="https://www.google.com/search?q=${googleQuery}" target="_blank" rel="noopener noreferrer" class="lyrics-external-btn">
          <i class="fa-brands fa-google"></i> Google에서 가사 검색하기 <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.75rem;"></i>
        </a>
      </div>
    `;

    const statusCustomBtn = document.getElementById('btn-status-custom-lyrics');
    if (statusCustomBtn) {
      statusCustomBtn.addEventListener('click', () => openCustomLyricsPanel(track));
    }

    // 추천 키워드 클릭 시 즉시 온라인 재검색
    el.focusLyricsList.querySelectorAll('.lyrics-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.query;
        if (q) loadAndRenderLyrics(track, q);
      });
    });

    const inlineInput = document.getElementById('inline-lyrics-query');
    const inlineSubmit = document.getElementById('btn-inline-lyrics-submit');
    const doInlineSearch = () => {
      if (inlineInput && inlineInput.value.trim()) {
        loadAndRenderLyrics(track, inlineInput.value.trim());
      }
    };

    if (inlineSubmit) inlineSubmit.addEventListener('click', doInlineSearch);
    if (inlineInput) {
      inlineInput.addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
          e.preventDefault();
          doInlineSearch();
        }
      });
      inlineInput.focus();
    }
    return;
  }

  // ⚡ 가사 발견 시 영구 보관 (트랙 객체 및 localStorage 영구 동시 저장)
  if (track) {
    track.cachedLyrics = data;
    saveState();
  }
  if (vid) setCachedLyrics(vid, data);
  if (cleanTitle) setCachedLyrics(cleanTitle, data);

  renderLyricsSuccess(data, track, vid);
}

// 5. 실시간 가사 하이라이트 & 오토 스크롤 업데이트 (정밀 원곡 싱크 동기화)
function updateLyricsSync(currentTime) {
  if (!isLyricsViewActive || !currentLyricsData || currentLyricsData.type !== 'synced') return;
  const lyrics = currentLyricsData.lyrics;
  if (!lyrics || lyrics.length === 0) return;

  // 스마트 싱크 가사인 경우 실제 YouTube 영상 길이가 로드되었을 때 타임스탬프 정밀 재보정
  if (currentLyricsData.isSmartSync && ytPlayer && typeof ytPlayer.getDuration === 'function') {
    try {
      const realDur = ytPlayer.getDuration() || 0;
      if (realDur > 30 && Math.abs(realDur - (currentLyricsData.smartSyncDuration || 0)) > 3) {
        applySmartPlainSync(currentLyricsData, realDur);
        if (el.focusLyricsList) {
          const lineEls = el.focusLyricsList.querySelectorAll('.lyric-line');
          lineEls.forEach((lineEl, idx) => {
            if (lyrics[idx]) {
              lineEl.dataset.time = lyrics[idx].time;
              lineEl.title = `${formatTime(lyrics[idx].time)} 구간으로 점프`;
            }
          });
        }
      }
    } catch (e) {}
  }

  const effectiveTime = currentTime + lyricsSyncOffset;
  let newIdx = -1;

  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= effectiveTime) {
      newIdx = i;
    } else {
      break;
    }
  }

  if (newIdx !== activeLyricLineIndex) {
    updateLyricsHighlight(newIdx, !isUserScrollingLyrics);
  }
}

// 5-1. 활성 가사 라인을 뷰포트 정확한 수직 정중앙으로 스무스하게 이동
function scrollActiveLyricToCenter(lineElement, smooth = true) {
  if (!lineElement || !el.focusLyricsScroll) return;
  const container = el.focusLyricsScroll;
  const lineRect = lineElement.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // 컨테이너 중앙 좌표와 해당 가사 라인 중앙 좌표의 상대적 차이 계산
  const lineCenter = lineRect.top + (lineRect.height / 2);
  const containerCenter = containerRect.top + (containerRect.height / 2);
  const delta = lineCenter - containerCenter;

  if (Math.abs(delta) < 2) return; // 오차가 2px 이내면 이미 정중앙

  // 자동 스크롤 진행 중임을 표시하여 scroll 이벤트가 사용자 개입으로 오인되지 않게 차단
  isProgrammaticLyricsScrolling = true;
  if (programmaticScrollResetTimer) {
    clearTimeout(programmaticScrollResetTimer);
  }

  const targetTop = Math.max(0, container.scrollTop + delta);
  container.scrollTo({
    top: targetTop,
    behavior: smooth ? 'smooth' : 'auto'
  });

  programmaticScrollResetTimer = setTimeout(() => {
    isProgrammaticLyricsScrolling = false;
  }, smooth ? 650 : 80);
}

function updateLyricsHighlight(idx, shouldScroll = true) {
  if (!el.focusLyricsList) return;
  activeLyricLineIndex = idx;
  const lines = el.focusLyricsList.querySelectorAll('.lyric-line');

  let activeLineEl = null;
  lines.forEach((line, i) => {
    if (i === idx) {
      line.classList.add('active');
      line.classList.remove('passed');
      activeLineEl = line;
    } else if (i < idx) {
      line.classList.remove('active');
      line.classList.add('passed');
    } else {
      line.classList.remove('active');
      line.classList.remove('passed');
    }
  });

  if (activeLineEl && shouldScroll && el.focusLyricsScroll) {
    requestAnimationFrame(() => {
      scrollActiveLyricToCenter(activeLineEl, true);
    });
  }
}

// 수동 스크롤 후 가만히 있으면 현재 활성 싱크 가사로 부드럽게 자동 복귀
function returnToActiveLyricSync() {
  if (!isLyricsViewActive || !el.focusLyricsList || !el.focusLyricsScroll) return;

  let targetIdx = activeLyricLineIndex;
  if (currentLyricsData && currentLyricsData.lyrics && currentLyricsData.lyrics.length > 0) {
    if (ytPlayer && isPlayerReady) {
      try {
        const curTime = (ytPlayer.getCurrentTime() || 0) + lyricsSyncOffset;
        let found = -1;
        for (let i = 0; i < currentLyricsData.lyrics.length; i++) {
          if (currentLyricsData.lyrics[i].time <= curTime) {
            found = i;
          } else {
            break;
          }
        }
        if (found >= 0) targetIdx = found;
      } catch (e) {}
    }
  }

  if (targetIdx < 0) targetIdx = 0;

  const lines = el.focusLyricsList.querySelectorAll('.lyric-line');
  if (lines && lines[targetIdx]) {
    updateLyricsHighlight(targetIdx, true);
    scrollActiveLyricToCenter(lines[targetIdx], true);
  }
}

// 6. 가사 뷰 토글
function toggleLyricsView(forceState = null) {
  if (forceState !== null) {
    if (!isFocusModeOpen) {
      openFocusMode(forceState ? 'lyrics' : 'carousel');
    } else {
      switchFocusView(forceState);
    }
  } else {
    toggleLyricsMode();
  }
}

// 7. 싱크 오프셋 조절 (-0.5s / +0.5s / 리셋)
function adjustLyricsOffset(delta) {
  if (delta === 0) {
    lyricsSyncOffset = 0;
  } else {
    lyricsSyncOffset = Math.round((lyricsSyncOffset + delta) * 10) / 10;
  }
  updateLyricsOffsetUI();

  // 현재 영상의 고유 오프셋을 영구 보존
  const vid = currentLyricsTrackId;
  if (vid) {
    try {
      if (lyricsSyncOffset === 0) {
        localStorage.removeItem('ply_offset_' + vid);
      } else {
        localStorage.setItem('ply_offset_' + vid, String(lyricsSyncOffset));
      }
    } catch (e) {}
  }

  if (ytPlayer && isPlayerReady) {
    try {
      updateLyricsSync(ytPlayer.getCurrentTime() || 0);
    } catch (e) {}
  }
}

function updateLyricsOffsetUI() {
  if (el.lyricsOffsetVal) {
    const sign = lyricsSyncOffset > 0 ? '+' : '';
    el.lyricsOffsetVal.textContent = `${sign}${lyricsSyncOffset.toFixed(1)}s`;
    el.lyricsOffsetVal.style.color = lyricsSyncOffset !== 0 ? 'var(--dynamic-video-color)' : 'rgba(255,255,255,0.7)';
  }
}

// 8. 수동 가사 검색 실행
function handleManualLyricsSearch() {
  if (!el.inputLyricsQuery) return;
  const q = el.inputLyricsQuery.value.trim();
  if (!q) return;

  const currentPl = getCurrentPlaylist();
  let track = currentPl ? currentPl.tracks[appState.currentTrackIndex] : null;
  if (!track) {
    track = { id: 'manual_search', title: q, author: '' };
  }

  loadAndRenderLyrics(track, q);
}

// 9. 사용자 직접 가사 등록 / 편집 매니저
function openCustomLyricsPanel(track = null) {
  if (!el.focusLyricsCustomPanel) return;
  const currentPl = getCurrentPlaylist();
  const trk = track || (currentPl ? currentPl.tracks[appState.currentTrackIndex] : null);
  const vid = trk ? (trk.videoId || trk.id) : null;

  // 다른 패널 닫기
  if (el.focusLyricsSearchBox) el.focusLyricsSearchBox.classList.add('hidden');
  if (el.focusLyricsSettingsPanel) el.focusLyricsSettingsPanel.classList.add('hidden');

  el.focusLyricsCustomPanel.classList.remove('hidden');

  if (vid) {
    try {
      const saved = localStorage.getItem('ply_custom_lyrics_' + vid);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (el.textareaCustomLyrics) el.textareaCustomLyrics.value = parsed.rawText || '';
        if (el.btnCustomLyricsDelete) el.btnCustomLyricsDelete.classList.remove('hidden');
      } else {
        if (el.textareaCustomLyrics) el.textareaCustomLyrics.value = '';
        if (el.btnCustomLyricsDelete) el.btnCustomLyricsDelete.classList.add('hidden');
      }
    } catch (e) {
      if (el.textareaCustomLyrics) el.textareaCustomLyrics.value = '';
      if (el.btnCustomLyricsDelete) el.btnCustomLyricsDelete.classList.add('hidden');
    }
  } else {
    if (el.textareaCustomLyrics) el.textareaCustomLyrics.value = '';
    if (el.btnCustomLyricsDelete) el.btnCustomLyricsDelete.classList.add('hidden');
  }

  if (el.textareaCustomLyrics) {
    el.textareaCustomLyrics.focus();
  }
}

function closeCustomLyricsPanel() {
  if (el.focusLyricsCustomPanel) {
    el.focusLyricsCustomPanel.classList.add('hidden');
  }
}

function handleCustomLyricsSave() {
  const currentPl = getCurrentPlaylist();
  const trk = currentPl ? currentPl.tracks[appState.currentTrackIndex] : null;
  const vid = trk ? (trk.videoId || trk.id) : null;
  if (!trk || !vid) {
    alert('재생 중인 곡 정보를 확인할 수 없습니다.');
    return;
  }
  const text = el.textareaCustomLyrics ? el.textareaCustomLyrics.value.trim() : '';
  if (!text) {
    alert('등록할 가사 내용을 입력해주세요.');
    return;
  }

  try {
    const payload = {
      rawText: text,
      trackTitle: trk.title || '',
      updatedAt: Date.now()
    };
    localStorage.setItem('ply_custom_lyrics_' + vid, JSON.stringify(payload));
    clearCachedLyrics(vid);
    closeCustomLyricsPanel();
    loadAndRenderLyrics(trk);
  } catch (e) {
    alert('가사 저장 중 오류가 발생했습니다: ' + e.message);
  }
}

function handleCustomLyricsDelete() {
  const currentPl = getCurrentPlaylist();
  const trk = currentPl ? currentPl.tracks[appState.currentTrackIndex] : null;
  const vid = trk ? (trk.videoId || trk.id) : null;
  if (!trk || !vid) return;

  if (confirm('현재 곡에 직접 등록된 가사를 삭제하시겠습니까?')) {
    localStorage.removeItem('ply_custom_lyrics_' + vid);
    clearCachedLyrics(vid);
    closeCustomLyricsPanel();
    loadAndRenderLyrics(trk);
  }
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

      // 실시간 광고 검사 및 초고속 스킵 실행
      checkAndHandleAdStream();

      // 잠금화면 진행률 / 시크바 동기화 (초 단위 쓰로틀링 내장)
      updateMediaSessionPositionState();

      // 🎤 실시간 싱크 가사 업데이트
      if (isLyricsViewActive && currentLyricsData && currentLyricsData.type === 'synced') {
        updateLyricsSync(curTime);
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

/* ==================== 트랙 드래그 앤 드롭 (단일 & 일괄 다중 드래그 지원) ==================== */
function setupTrackDragAndDrop(li, index) {
  li.setAttribute('draggable', 'true');
  const dragHandle = li.querySelector('.drag-handle');

  // 1. 데스크탑 HTML5 Drag & Drop
  li.addEventListener('dragstart', (e) => {
    draggedTrackIndex = index;
    li.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));

    // 만약 드래그 시작한 항목이 일괄 선택된 그룹에 속해 있다면, 선택된 모든 항목에 드래깅 스타일 적용
    if (selectedTrackIndices.has(index) && selectedTrackIndices.size > 1) {
      document.querySelectorAll('.track-item').forEach(item => {
        const itemIdx = parseInt(item.dataset.index, 10);
        if (selectedTrackIndices.has(itemIdx)) {
          item.classList.add('batch-dragging');
        }
      });
    }
  });

  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
    document.querySelectorAll('.track-item').forEach(item => {
      item.classList.remove('dragging', 'batch-dragging', 'drag-over-top', 'drag-over-bottom');
    });
    draggedTrackIndex = null;
  });

  li.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedTrackIndex === null) return;
    // 다중 선택 드래그 중인 그룹 내부 항목 위에서는 드롭 오버 라인 표시 안 함
    if (selectedTrackIndices.has(draggedTrackIndex) && selectedTrackIndices.has(index) && selectedTrackIndices.size > 1) {
      return;
    }
    if (draggedTrackIndex === index) return;

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

    if (draggedTrackIndex === null) return;
    if (selectedTrackIndices.has(draggedTrackIndex) && selectedTrackIndices.has(index) && selectedTrackIndices.size > 1) {
      return;
    }
    if (draggedTrackIndex === index) return;

    const rect = li.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'before' : 'after';

    reorderTracks(draggedTrackIndex, index, position);
  });

  // 2. 모바일 터치 스와이프 순서 변경 지원
  if (dragHandle) {
    let touchStartY = 0;
    let currentDropTarget = null;
    let currentPosition = 'before';

    dragHandle.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      touchStartY = e.touches[0].clientY;
      draggedTrackIndex = index;
      li.classList.add('dragging');

      if (selectedTrackIndices.has(index) && selectedTrackIndices.size > 1) {
        document.querySelectorAll('.track-item').forEach(item => {
          const itemIdx = parseInt(item.dataset.index, 10);
          if (selectedTrackIndices.has(itemIdx)) {
            item.classList.add('batch-dragging');
          }
        });
      }
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
        const targetIdx = parseInt(targetLi.dataset.index, 10);
        if (selectedTrackIndices.has(draggedTrackIndex) && selectedTrackIndices.has(targetIdx) && selectedTrackIndices.size > 1) {
          currentDropTarget = null;
          return;
        }

        currentDropTarget = targetLi;
        const rect = targetLi.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (touch.clientY < midY) {
          targetLi.classList.add('drag-over-top');
          currentPosition = 'before';
        } else {
          targetLi.classList.add('drag-over-bottom');
          currentPosition = 'after';
        }
      } else {
        currentDropTarget = null;
      }
    }, { passive: false });

    const finishTouchDrag = () => {
      if (draggedTrackIndex === null) return;
      li.classList.remove('dragging');

      if (currentDropTarget) {
        const targetIdx = parseInt(currentDropTarget.dataset.index, 10);
        if (!isNaN(targetIdx) && targetIdx !== draggedTrackIndex) {
          reorderTracks(draggedTrackIndex, targetIdx, currentPosition);
        }
      }

      document.querySelectorAll('.track-item').forEach(item => {
        item.classList.remove('dragging', 'batch-dragging', 'drag-over-top', 'drag-over-bottom');
      });

      draggedTrackIndex = null;
      currentDropTarget = null;
    };

    dragHandle.addEventListener('touchend', finishTouchDrag);
    dragHandle.addEventListener('touchcancel', finishTouchDrag);
  }
}

// 🔀 트랙 순서 재배치 (단일 드래그 및 일괄 선택 다중 드래그 동시 완벽 지원)
function reorderTracks(fromIndex, targetIndex, position = 'before') {
  const currentPl = getCurrentPlaylist();
  if (!currentPl || !Array.isArray(currentPl.tracks)) return;
  const tracks = currentPl.tracks;
  const len = tracks.length;
  if (fromIndex < 0 || fromIndex >= len || targetIndex < 0 || targetIndex >= len) return;

  // 드래그된 항목이 선택된 그룹에 속하는 경우: 선택된 전체 그룹 이동
  const isBatchMove = selectedTrackIndices.has(fromIndex) && selectedTrackIndices.size > 1;
  const movingIndices = isBatchMove 
    ? Array.from(selectedTrackIndices).sort((a, b) => a - b)
    : [fromIndex];

  // 드롭 타깃이 이동할 그룹에 포함되어 있으면 아무것도 하지 않음
  if (movingIndices.includes(targetIndex)) return;

  const targetTrack = tracks[targetIndex];
  const movingSet = new Set(movingIndices);
  const movingItems = movingIndices.map(i => tracks[i]);

  // 이동할 트랙들을 제외한 나머지 트랙들
  const remainingTracks = tracks.filter((_, idx) => !movingSet.has(idx));

  // 나머지 트랙들 중 타깃 트랙의 새 위치 탐색
  const targetInRemaining = remainingTracks.indexOf(targetTrack);
  if (targetInRemaining === -1) return;

  // position에 따라 앞/뒤 삽입 지점 결정
  const insertIndex = position === 'after' ? targetInRemaining + 1 : targetInRemaining;

  // 새로운 트랙 배열 구성
  const newTracks = [
    ...remainingTracks.slice(0, insertIndex),
    ...movingItems,
    ...remainingTracks.slice(insertIndex)
  ];
  currentPl.tracks = newTracks;

  // 현재 재생 중인 트랙 인덱스 보정
  const activeTrackObj = (appState.currentTrackIndex >= 0 && appState.currentTrackIndex < len)
    ? tracks[appState.currentTrackIndex]
    : null;
  if (activeTrackObj) {
    const newActiveIdx = newTracks.indexOf(activeTrackObj);
    if (newActiveIdx !== -1) {
      appState.currentTrackIndex = newActiveIdx;
    }
  }

  // 일괄 선택된 인덱스 Set을 새로운 위치로 갱신하여 선택 상태 유지
  if (isBatchMove) {
    selectedTrackIndices.clear();
    for (let i = 0; i < movingItems.length; i++) {
      selectedTrackIndices.add(insertIndex + i);
    }
    updateBatchActionBarUI();
  }

  // 동기화 및 저장
  if (isCloudPlaylist(currentPl.id)) {
    syncLinkedLocalPlaylistsFromCloud();
    scheduleCloudPush();
  } else {
    syncLinkedLocalToCloudPlaylist(currentPl);
    saveState();
  }

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
      // 💡 연동 조건: 현재 기기가 동기화 방에 연결되어 있고,
      // 해당 로컬 플리가 클라우드 플리로 선택/연동되었거나 클라우드에서 내려받은 경우에만 연동 표시!
      const isCloudLinked = !!(
        activeSyncRoomId &&
        (
          (pl.originCloudPlId && (appState.cloudPlaylists || []).some(cp => cp.id === pl.originCloudPlId)) ||
          (appState.cloudPlaylists || []).some(cp => cp.originLocalPlId === pl.id)
        )
      );
      const li = document.createElement('li');
      li.className = `playlist-item ${pl.id === appState.activePlaylistId ? 'active' : ''}`;
      li.innerHTML = `
        <div class="playlist-item-left">
          <i class="fa-solid fa-compact-disc"></i>
          <span>${escapeHtml(pl.name)}</span>
          ${isCloudLinked ? '<span class="cloud-linked-pill" title="클라우드 업데이트와 연동됨">클라우드 연동</span>' : ''}
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

  const cleanName = cleanPlaylistName(cloudPl.name);

  // 이미 로컬에 동일한 이름이나 출처를 가진 플리가 있는지 확인
  const existing = (appState.playlists || []).find(lp =>
    (cloudPl.originLocalPlId && lp.id === cloudPl.originLocalPlId) ||
    (lp.originCloudPlId && lp.originCloudPlId === cloudPl.id) ||
    cleanPlaylistName(lp.name) === cleanName
  );

  if (existing) {
    existing.tracks = JSON.parse(JSON.stringify(cloudPl.tracks || []));
    existing.originCloudPlId = cloudPl.id;
    existing.syncWithCloud = true;
    existing.name = cleanName;
    deduplicateLocalPlaylists();
    saveState();
    renderPlaylists();
    alert(`'${existing.name}' 플레이리스트가 최신 곡 목록으로 안전하게 동기화되었습니다!`);
    return;
  }

  const newLocalPl = {
    id: 'pl-' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name: cleanName,
    tracks: JSON.parse(JSON.stringify(cloudPl.tracks || [])),
    originCloudPlId: cloudPl.id,
    syncWithCloud: true
  };

  if (!appState.playlists) appState.playlists = [];
  appState.playlists.push(newLocalPl);
  deduplicateLocalPlaylists();
  saveState();
  renderPlaylists();
  alert(`'${newLocalPl.name}' 플레이리스트가 내 로컬 플레이리스트에 안전하게 저장되었습니다!\n\n(클라우드에 새 곡이 추가되거나 변경되면 이 로컬 플레이리스트에도 자동으로 반영됩니다.)`);
}

/* ==================== 📋 트랙 일괄 선택 & 순서 변경 & 삭제 상태 관리 ==================== */
let isTrackSelectionMode = false;
let selectedTrackIndices = new Set();

function toggleTrackSelectionMode(forceState = null) {
  isTrackSelectionMode = forceState !== null ? forceState : !isTrackSelectionMode;
  if (!isTrackSelectionMode) {
    selectedTrackIndices.clear();
  }

  if (el.btnToggleSelectMode) {
    el.btnToggleSelectMode.classList.toggle('active', isTrackSelectionMode);
    el.btnToggleSelectMode.innerHTML = isTrackSelectionMode 
      ? '<i class="fa-solid fa-xmark"></i> <span>완료</span>' 
      : '<i class="fa-solid fa-list-check"></i> <span>선택</span>';
  }

  if (el.tracksSection) {
    el.tracksSection.classList.toggle('selection-mode', isTrackSelectionMode);
  }

  if (el.batchActionBar) {
    el.batchActionBar.classList.toggle('hidden', !isTrackSelectionMode);
  }

  if (el.colHeaderCheck) {
    el.colHeaderCheck.classList.toggle('hidden', !isTrackSelectionMode);
  }

  updateBatchActionBarUI();
  renderTracks();
}

function updateBatchActionBarUI() {
  const currentPl = getCurrentPlaylist();
  const totalCount = currentPl && Array.isArray(currentPl.tracks) ? currentPl.tracks.length : 0;
  const selCount = selectedTrackIndices.size;

  if (el.trackCountBadge) {
    el.trackCountBadge.textContent = `${totalCount}곡`;
  }

  if (el.batchSelectedCount) {
    el.batchSelectedCount.textContent = `${selCount}개 선택`;
  }

  if (el.chkSelectAllTracks) {
    el.chkSelectAllTracks.checked = totalCount > 0 && selCount === totalCount;
    el.chkSelectAllTracks.indeterminate = selCount > 0 && selCount < totalCount;
  }

  const hasSelection = selCount > 0;
  if (el.btnBatchMoveUp) el.btnBatchMoveUp.disabled = !hasSelection;
  if (el.btnBatchMoveDown) el.btnBatchMoveDown.disabled = !hasSelection;
  if (el.btnBatchMoveTop) el.btnBatchMoveTop.disabled = !hasSelection;
  if (el.btnBatchMoveBottom) el.btnBatchMoveBottom.disabled = !hasSelection;
  if (el.btnBatchDelete) el.btnBatchDelete.disabled = !hasSelection;
}

function handleSelectAllTracks(checked) {
  const currentPl = getCurrentPlaylist();
  if (!currentPl || !Array.isArray(currentPl.tracks)) return;

  selectedTrackIndices.clear();
  if (checked) {
    currentPl.tracks.forEach((_, idx) => selectedTrackIndices.add(idx));
  }
  updateBatchActionBarUI();
  renderTracks();
}

function toggleTrackSelect(index, isChecked) {
  if (isChecked) {
    selectedTrackIndices.add(index);
  } else {
    selectedTrackIndices.delete(index);
  }
  updateBatchActionBarUI();

  // 해당 행 스타일 업데이트
  const items = el.trackList.querySelectorAll('.track-item');
  if (items[index]) {
    items[index].classList.toggle('selected', isChecked);
    const chk = items[index].querySelector('.track-select-chk');
    if (chk) chk.checked = isChecked;
  }
}

// 🔼 선택된 트랙들 일괄 이동 함수
function batchMoveTracks(direction) {
  const currentPl = getCurrentPlaylist();
  if (!currentPl || !Array.isArray(currentPl.tracks) || selectedTrackIndices.size === 0) return;

  const tracks = currentPl.tracks;
  const len = tracks.length;
  let sortedSelected = Array.from(selectedTrackIndices).sort((a, b) => a - b);

  let activeTrackObj = (appState.currentTrackIndex >= 0 && appState.currentTrackIndex < len)
    ? tracks[appState.currentTrackIndex]
    : null;

  if (direction === 'top') {
    // 이미 맨 위에 붙어있으면 불필요
    const selectedItems = sortedSelected.map(i => tracks[i]);
    const unselectedItems = tracks.filter((_, i) => !selectedTrackIndices.has(i));
    currentPl.tracks = [...selectedItems, ...unselectedItems];

    // 새 선택 인덱스: 0부터 selectedItems.length - 1
    selectedTrackIndices.clear();
    for (let i = 0; i < selectedItems.length; i++) {
      selectedTrackIndices.add(i);
    }
  } else if (direction === 'bottom') {
    const selectedItems = sortedSelected.map(i => tracks[i]);
    const unselectedItems = tracks.filter((_, i) => !selectedTrackIndices.has(i));
    currentPl.tracks = [...unselectedItems, ...selectedItems];

    // 새 선택 인덱스: unselectedItems.length 부터 끝까지
    selectedTrackIndices.clear();
    for (let i = 0; i < selectedItems.length; i++) {
      selectedTrackIndices.add(unselectedItems.length + i);
    }
  } else if (direction === 'up') {
    // 위로 1칸 이동 (맨 위 인덱스 0이 포함되어 있고 그 위로 못 가면 전체 블록 이동 불가 시 스킵)
    if (sortedSelected[0] === 0) {
      // 첫 번째 선택 곡이 맨 위라면, 맨 위 블록을 제외하고 이동 가능한 곡들만 이동
    }
    const newTracks = [...tracks];
    const newSelected = new Set();

    for (let i = 0; i < len; i++) {
      if (selectedTrackIndices.has(i)) {
        if (i > 0 && !selectedTrackIndices.has(i - 1)) {
          // 앞 곡과 swap
          const temp = newTracks[i - 1];
          newTracks[i - 1] = newTracks[i];
          newTracks[i] = temp;
          newSelected.add(i - 1);
        } else {
          newSelected.add(i);
        }
      }
    }
    currentPl.tracks = newTracks;
    selectedTrackIndices = newSelected;
  } else if (direction === 'down') {
    // 아래로 1칸 이동 (뒤에서부터 탐색하여 swap)
    const newTracks = [...tracks];
    const newSelected = new Set();

    for (let i = len - 1; i >= 0; i--) {
      if (selectedTrackIndices.has(i)) {
        if (i < len - 1 && !selectedTrackIndices.has(i + 1)) {
          // 뒷 곡과 swap
          const temp = newTracks[i + 1];
          newTracks[i + 1] = newTracks[i];
          newTracks[i] = temp;
          newSelected.add(i + 1);
        } else {
          newSelected.add(i);
        }
      }
    }
    currentPl.tracks = newTracks;
    selectedTrackIndices = newSelected;
  }

  // 현재 재생 중인 트랙 인덱스 보정
  if (activeTrackObj) {
    const newActiveIdx = currentPl.tracks.indexOf(activeTrackObj);
    if (newActiveIdx !== -1) {
      appState.currentTrackIndex = newActiveIdx;
    }
  }

  // 저장 및 동기화
  if (isCloudPlaylist(currentPl.id)) {
    syncLinkedLocalPlaylistsFromCloud();
    scheduleCloudPush();
  } else {
    syncLinkedLocalToCloudPlaylist(currentPl);
    saveState();
  }

  updateBatchActionBarUI();
  renderTracks();
}

// 🗑️ 선택된 트랙들 일괄 삭제 함수
function batchDeleteTracks() {
  const currentPl = getCurrentPlaylist();
  if (!currentPl || !Array.isArray(currentPl.tracks) || selectedTrackIndices.size === 0) return;

  const count = selectedTrackIndices.size;
  if (!confirm(`선택한 ${count}개의 노래를 플레이리스트에서 일괄 삭제하시겠습니까?`)) {
    return;
  }

  const activeTrackObj = (appState.currentTrackIndex >= 0 && appState.currentTrackIndex < currentPl.tracks.length)
    ? currentPl.tracks[appState.currentTrackIndex]
    : null;

  // 선택되지 않은 트랙들만 유지
  const remainingTracks = currentPl.tracks.filter((_, idx) => !selectedTrackIndices.has(idx));
  currentPl.tracks = remainingTracks;
  selectedTrackIndices.clear();

  // 현재 재생 트랙 인덱스 갱신
  if (activeTrackObj) {
    const newIdx = currentPl.tracks.indexOf(activeTrackObj);
    if (newIdx !== -1) {
      appState.currentTrackIndex = newIdx;
    } else {
      if (currentPl.tracks.length > 0) {
        playTrackByIndex(0);
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
    }
  }

  if (isCloudPlaylist(currentPl.id)) {
    syncLinkedLocalPlaylistsFromCloud();
    scheduleCloudPush();
  } else {
    syncLinkedLocalToCloudPlaylist(currentPl);
    saveState();
  }

  updateBatchActionBarUI();
  renderTracks();
  renderPlaylists();
  showStatusMsg(`🗑️ ${count}개의 곡이 삭제되었습니다.`, 'info', 2500);
}

function renderTracks() {
  const currentPl = getCurrentPlaylist();
  el.trackList.innerHTML = '';

  const totalCount = currentPl && Array.isArray(currentPl.tracks) ? currentPl.tracks.length : 0;
  if (el.trackCountBadge) {
    el.trackCountBadge.textContent = `${totalCount}곡`;
  }

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
  el.currentPlaylistMeta.textContent = `총 ${totalCount}개의 트랙 ${isCloud ? '• 다른 기기와 실시간 동기화 중' : '• 로컬 전용'}`;

  if (!currentPl.tracks || currentPl.tracks.length === 0) {
    el.emptyTrackMsg.classList.remove('hidden');
    el.emptyStateText.innerHTML = `<strong>'${escapeHtml(currentPl.name)}'</strong> 플레이리스트가 비어있습니다.<br>상단 입력창에 유튜브 영상 링크(URL)를 입력하여 추가해보세요!`;
    return;
  } else {
    el.emptyTrackMsg.classList.add('hidden');
  }

  currentPl.tracks.forEach((track, idx) => {
    const videoId = track.videoId || track.id;
    const thumbUrl = track.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const isSelected = selectedTrackIndices.has(idx);

    const li = document.createElement('li');
    li.className = `track-item ${idx === appState.currentTrackIndex ? 'active' : ''} ${isSelected ? 'selected' : ''}`;
    li.dataset.index = idx;

    li.innerHTML = `
      ${isTrackSelectionMode ? `
        <div class="col-check">
          <input type="checkbox" class="track-select-chk" data-index="${idx}" ${isSelected ? 'checked' : ''}>
        </div>
      ` : ''}
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
      if (isTrackSelectionMode) {
        // 선택 모드일 때는 클릭으로 선택 토글
        const nowChecked = !selectedTrackIndices.has(idx);
        toggleTrackSelect(idx, nowChecked);
      } else {
        playTrackByIndex(idx);
      }
    });

    const chkBox = li.querySelector('.track-select-chk');
    if (chkBox) {
      chkBox.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      chkBox.addEventListener('change', (e) => {
        toggleTrackSelect(idx, e.target.checked);
      });
    }

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
    if (isNone) {
      el.btnFocusRepeat.classList.remove('active');
      if (el.focusRepeatBadge) el.focusRepeatBadge.classList.add('hidden');
      el.btnFocusRepeat.title = '반복 끔';
    } else {
      el.btnFocusRepeat.classList.add('active');
      if (el.focusRepeatBadge) el.focusRepeatBadge.classList.toggle('hidden', !isOne);
      el.btnFocusRepeat.title = isOne ? '한 곡 반복' : '전체 반복';
    }
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
  if (el.iconFocusVolume) el.iconFocusVolume.className = iconClass;
  if (el.focusVolumeSlider && parseInt(el.focusVolumeSlider.value, 10) !== vol) {
    el.focusVolumeSlider.value = vol;
  }
  if (el.volumeSlider && parseInt(el.volumeSlider.value, 10) !== vol) {
    el.volumeSlider.value = vol;
  }
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

let statusMsgTimer = null;
function showStatusMsg(msg, type = 'error', durationMs = 4500) {
  if (!el.urlStatus) return;
  el.urlStatus.textContent = msg;
  el.urlStatus.className = `status-msg ${type}`;
  el.urlStatus.classList.remove('hidden');
  if (statusMsgTimer) clearTimeout(statusMsgTimer);
  if (durationMs > 0) {
    statusMsgTimer = setTimeout(() => {
      el.urlStatus.classList.add('hidden');
      el.urlStatus.textContent = '';
    }, durationMs);
  }
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
  selectedTrackIndices.clear();
  if (isTrackSelectionMode) {
    toggleTrackSelectionMode(false);
  }
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

/* ==================== 트랙 관리 기능 (링크 입력 & 노래 제목 검색 동시 지원) ==================== */
let isAddingTrack = false;
let addingTrackTimer = null;
async function addTrackFromUrl(url) {
  if (isAddingTrack) return;
  if (!url || typeof url !== 'string' || !url.trim()) {
    showStatusMsg('❌ 추가할 유튜브 영상 링크(URL)를 입력해주세요.', 'error');
    if (el.inputYoutubeUrl) el.inputYoutubeUrl.focus();
    return;
  }

  const rawInput = url.trim();
  const videoId = extractStrictYouTubeId(rawInput);
  if (!videoId) {
    showStatusMsg('❌ 올바른 유튜브 영상 링크(URL)를 입력해주세요.', 'error');
    if (el.inputYoutubeUrl) el.inputYoutubeUrl.focus();
    return;
  }

  isAddingTrack = true;
  if (addingTrackTimer) clearTimeout(addingTrackTimer);
  addingTrackTimer = setTimeout(() => { isAddingTrack = false; }, 6000);

  let resolvedTitle = null;
  let resolvedAuthor = null;

  let currentPl = getCurrentPlaylist();
  if (!currentPl) {
    const defaultPlName = '🎵 나의 플레이리스트';
    const newPl = {
      id: 'pl-' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: defaultPlName,
      tracks: []
    };
    if (!appState.playlists) appState.playlists = [];
    appState.playlists.push(newPl);
    appState.activePlaylistId = newPl.id;
    saveState();
    currentPl = newPl;
  } else {
    appState.activePlaylistId = currentPl.id;
  }

  if (!Array.isArray(currentPl.tracks)) {
    currentPl.tracks = [];
  }

  if (el.btnSubmitAdd) {
    el.btnSubmitAdd.disabled = true;
    el.btnSubmitAdd.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
  }

  try {

    // 메타데이터 확인 (로컬 프록시 / oembed)
    let meta = { title: resolvedTitle, author: resolvedAuthor };
    if (!meta.title || meta.title.startsWith('YouTube 영상')) {
      const fetchedMeta = await fetchVideoMetadata(videoId);
      meta.title = fetchedMeta.title || meta.title || `YouTube 영상 (${videoId})`;
      meta.author = fetchedMeta.author || meta.author || 'YouTube';
    }

    const newTrack = {
      id: videoId,
      videoId: videoId,
      title: meta.title,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      author: meta.author || 'YouTube'
    };

    currentPl.tracks.push(newTrack);

    if (isCloudPlaylist(currentPl.id)) {
      syncLinkedLocalPlaylistsFromCloud();
      scheduleCloudPush();
    } else {
      syncLinkedLocalToCloudPlaylist(currentPl);
      saveState();
    }

    renderPlaylists();
    renderTracks();

    if (el.inputYoutubeUrl) el.inputYoutubeUrl.value = '';
    showStatusMsg(`✅ '${newTrack.title}' 곡이 플레이리스트에 추가되었습니다!`, 'success', 3500);

    // 첫 곡이거나 현재 재생 중인 곡이 없는 경우 즉시 재생
    if (appState.currentTrackIndex === -1 || currentPl.tracks.length === 1) {
      playTrackByIndex(currentPl.tracks.length - 1);
    }
  } catch (err) {
    showStatusMsg('곡 추가 중 오류가 발생했습니다: ' + (err.message || err), 'error');
  } finally {
    if (addingTrackTimer) clearTimeout(addingTrackTimer);
    isAddingTrack = false;
    if (el.btnSubmitAdd) {
      el.btnSubmitAdd.disabled = false;
      el.btnSubmitAdd.innerHTML = '<i class="fa-solid fa-plus"></i> <span class="btn-add-text">추가</span>';
    }
  }
}
window.addTrackFromUrl = addTrackFromUrl;

function deleteTrack(index) {
  const currentPl = getCurrentPlaylist();
  if (!currentPl) return;

  const track = currentPl.tracks[index];
  if (!confirm(`'${track.title}' 영상을 목록에서 삭제하시겠습니까?`)) {
    return;
  }

  currentPl.tracks.splice(index, 1);

  if (isCloudPlaylist(currentPl.id)) {
    // 클라우드 플리에서 삭제 -> 클라우드에서 받아온 로컬 플리에도 동일하게 반영
    syncLinkedLocalPlaylistsFromCloud();
    scheduleCloudPush();
  } else {
    // 로컬 플리에서 삭제 -> 만약 클라우드에서 받아온 로컬 플리라면 클라우드 플리에도 반영
    syncLinkedLocalToCloudPlaylist(currentPl);
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
let isSyncHost = false;

const SYNC_STORAGE_KEY = 'my_yt_sync_room_code_v3';
const SYNC_HOST_KEY = 'my_yt_sync_is_host_v3';

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

  // 플레이리스트 선택 뷰는 기본적으로 숨김 처리
  if (el.syncSelectPlaylistsView) {
    el.syncSelectPlaylistsView.classList.add('hidden');
  }

  if (isConnected) {
    if (el.syncDisconnectedView) el.syncDisconnectedView.classList.add('hidden');
    if (el.syncConnectedView) el.syncConnectedView.classList.remove('hidden');
    if (el.displaySyncCode) el.displaySyncCode.textContent = activeSyncRoomId;

    const deviceTag = document.querySelector('.sync-device-tag');
    if (deviceTag) {
      deviceTag.textContent = isSyncHost ? '방장 기기 (동기화 생성)' : '연결된 기기 (동기화 참여)';
    }

    if (el.btnDisconnectSync) {
      el.btnDisconnectSync.innerHTML = isSyncHost
        ? '<i class="fa-solid fa-power-off"></i> 동기화 종료 (모든 기기 해제)'
        : '<i class="fa-solid fa-link-slash"></i> 동기화 연결 해제';
      el.btnDisconnectSync.title = isSyncHost
        ? '방장이 동기화를 종료하면 연결된 모든 기기의 동기화도 함께 안전하게 해제됩니다.'
        : '이 기기의 동기화 연결만 해제합니다.';
    }
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
    if (el.syncSelectPlaylistsView) el.syncSelectPlaylistsView.classList.add('hidden');
    if (!activeSyncRoomId && el.syncDisconnectedView) el.syncDisconnectedView.classList.remove('hidden');
  }
}

// ☁️ 연동할 플레이리스트 선택 단계 열기 (방장 전용)
function openPlaylistSelectionForSync() {
  deduplicateLocalPlaylists();

  if (!appState.playlists || appState.playlists.length === 0) {
    showSyncStatus('연동할 로컬 플레이리스트가 없습니다. 먼저 플레이리스트를 만들어주세요.', 'error', 4000);
    return;
  }

  if (el.syncDisconnectedView) el.syncDisconnectedView.classList.add('hidden');
  if (el.syncSelectPlaylistsView) el.syncSelectPlaylistsView.classList.remove('hidden');

  renderSyncPlaylistChecklist();
}

function renderSyncPlaylistChecklist() {
  if (!el.syncPlaylistChecklist) return;
  el.syncPlaylistChecklist.innerHTML = '';

  appState.playlists.forEach(pl => {
    const item = document.createElement('label');
    item.className = 'sync-check-item selected';
    item.innerHTML = `
      <input type="checkbox" class="sync-pl-checkbox" value="${escapeHtml(pl.id)}" checked>
      <span class="sync-check-name">${escapeHtml(pl.name)}</span>
      <span class="sync-check-count">${(pl.tracks || []).length}곡</span>
    `;

    const cb = item.querySelector('input');
    cb.addEventListener('change', () => {
      if (cb.checked) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
      updateSyncSelectedCount();
    });

    el.syncPlaylistChecklist.appendChild(item);
  });

  updateSyncSelectedCount();
}

function updateSyncSelectedCount() {
  if (!el.syncPlaylistChecklist) return;
  const checked = el.syncPlaylistChecklist.querySelectorAll('.sync-pl-checkbox:checked');
  const count = checked.length;

  if (el.syncSelectedCountLabel) {
    el.syncSelectedCountLabel.textContent = `${count}개`;
  }
  if (el.btnConfirmCreateSync) {
    el.btnConfirmCreateSync.disabled = (count === 0);
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
      name: cleanPlaylistName(pl.name),
      originLocalPlId: pl.originLocalPlId || null,
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

const SYNC_KV_APP_KEY = '6b24tpc8';
let lastSyncedPasteKey = null;

function generateCleanRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 클라우드 업로드: 1. 전체 JSON을 pastes.dev/dpaste에 업로드 -> 2. 고정된 방 코드에 pasteKey 포인터 저장!
async function uploadSyncPayloadToCloud(jsonStr, targetRoomCode = null) {
  let pasteKey = null;

  // 1. pastes.dev 업로드 (대용량 JSON 완벽 지원)
  try {
    const res = await fetch('https://api.pastes.dev/post', {
      method: 'POST',
      headers: { 'Content-Type': 'text/json' },
      body: jsonStr
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.key) {
        pasteKey = data.key;
      }
    }
  } catch (e) {
    console.warn('pastes.dev upload error, trying dpaste fallback:', e);
  }

  // 2. dpaste.com 폴백
  if (!pasteKey) {
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
        const rawK = parts[parts.length - 1] || parts[parts.length - 2];
        if (rawK) {
          pasteKey = 'DP-' + rawK;
        }
      }
    } catch (e) {
      console.error('dpaste fallback error:', e);
    }
  }

  if (!pasteKey) {
    throw new Error('클라우드 저장소 업로드에 실패했습니다. 인터넷 연결을 확인해주세요.');
  }

  const roomCode = targetRoomCode || ('PL-' + generateCleanRoomCode());

  // 3. KV Store에 roomCode -> pasteKey 포인터 매핑 저장 (초고속, 방 코드 영구 불변!)
  try {
    const kvUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${SYNC_KV_APP_KEY}/${encodeURIComponent(roomCode)}/${encodeURIComponent(pasteKey)}`;
    const kvRes = await fetch(kvUrl, { method: 'POST', body: '' });
    if (kvRes.ok) {
      lastSyncedPasteKey = pasteKey;
      return roomCode;
    }
  } catch (e) {
    console.warn('KV store pointer update error:', e);
  }

  lastSyncedPasteKey = pasteKey;
  return roomCode;
}

// 클라우드 다운로드 (방 코드 -> 포인터 해석 -> 데이터 로드)
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

  let resolvedPasteKey = null;

  // 1. KV Store 포인터 조회 (대소문자 유연 지원, 캐시 방지)
  const candidateKeys = [
    cleanCode,
    cleanCode.toUpperCase(),
    cleanCode.startsWith('PL-') ? cleanCode.slice(3) : 'PL-' + cleanCode,
    (cleanCode.startsWith('PL-') ? cleanCode.slice(3) : 'PL-' + cleanCode).toUpperCase()
  ].filter(Boolean);

  for (const cKey of candidateKeys) {
    try {
      const kvUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${SYNC_KV_APP_KEY}/${encodeURIComponent(cKey)}`;
      const res = await fetch(kvUrl, { cache: 'no-store' });
      if (res.ok) {
        const rawText = (await res.text() || '').trim().replace(/^"|"$/g, '');
        if (rawText === 'ROOM_CLOSED' || rawText === 'DISCONNECTED') {
          return { isClosed: true, rawKey: cleanCode };
        }
        if (rawText && rawText !== 'null' && rawText.length >= 3) {
          resolvedPasteKey = rawText;
          break;
        }
      }
    } catch (e) {}
  }

  // 2. 포인터가 없으면 직접 입력된 코드 자체를 pasteKey로 취급
  const targetKey = resolvedPasteKey || cleanCode;
  if (targetKey === 'ROOM_CLOSED' || targetKey === 'DISCONNECTED') {
    return { isClosed: true, rawKey: cleanCode };
  }

  const isDpaste = targetKey.startsWith('DP-') || /^DP-/i.test(cleanCode);
  const pureKey = targetKey.replace(/^(PL|DP)-/i, '').trim();

  let textData = null;
  if (isDpaste) {
    try {
      const res = await fetch(`https://dpaste.com/${pureKey}.txt`, { cache: 'no-store' });
      if (res.ok) textData = await res.text();
    } catch (e) {}
  } else {
    try {
      const res = await fetch(`https://api.pastes.dev/${pureKey}`, { cache: 'no-store' });
      if (res.ok) textData = await res.text();
    } catch (e) {}

    if (!textData) {
      try {
        const res = await fetch(`https://dpaste.com/${pureKey}.txt`, { cache: 'no-store' });
        if (res.ok) textData = await res.text();
      } catch (e) {}
    }
  }

  if (!textData) {
    throw new Error('동기화 코드를 찾을 수 없습니다. 코드를 다시 확인해주세요.');
  }

  let parsed = null;
  try {
    parsed = JSON.parse(textData);
  } catch (e) {
    throw new Error('동기화 데이터 형식이 올바르지 않습니다.');
  }

  if (parsed && (parsed.status === 'ROOM_CLOSED' || parsed.isClosed === true)) {
    return { isClosed: true, rawKey: cleanCode, parsed };
  }

  return { parsed, rawKey: cleanCode, pasteKey: targetKey, isClosed: false };
}

async function createSyncRoom(selectedIds = null) {
  if (isSyncingNow) return;
  isSyncingNow = true;

  if (el.btnConfirmCreateSync) {
    el.btnConfirmCreateSync.disabled = true;
    el.btnConfirmCreateSync.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 코드 생성 중...';
  }
  if (el.btnCreateSyncRoom) {
    el.btnCreateSyncRoom.disabled = true;
  }
  showSyncStatus('선택한 플레이리스트로 동기화 코드를 안전하게 발급받고 있습니다...', 'info', 0);

  try {
    deduplicateLocalPlaylists();

    // 사용자가 체크박스로 선택한 플레이리스트만 엄선 (선택값이 없으면 전체 로컬 플리)
    let targets = appState.playlists || [];
    if (Array.isArray(selectedIds) && selectedIds.length > 0) {
      targets = targets.filter(pl => selectedIds.includes(pl.id));
    }

    if (targets.length === 0) {
      throw new Error('선택된 플레이리스트가 없습니다. 최소 1개 이상 선택해주세요.');
    }

    // 선택된 로컬 플리만 클라우드 플리로 변환하고 원본 ID(originLocalPlId)를 명시적으로 연동!
    appState.cloudPlaylists = targets.map(pl => {
      const cId = 'cpl-' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      pl.originCloudPlId = cId;
      pl.syncWithCloud = true;
      return {
        id: cId,
        name: cleanPlaylistName(pl.name),
        originLocalPlId: pl.id, // 🔗 방장 기기의 원본 로컬 플리 ID 기억!
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
      };
    });

    // 선택되지 않은 나머지 로컬 플리는 동기화 연동 해제
    appState.playlists.forEach(pl => {
      if (!targets.some(t => t.id === pl.id)) {
        pl.syncWithCloud = false;
        pl.originCloudPlId = null;
      }
    });

    // 방장 기기의 활성 플레이리스트를 선택된 첫 번째 클라우드 플리로 전환
    if (appState.cloudPlaylists.length > 0) {
      appState.activePlaylistId = appState.cloudPlaylists[0].id;
    }

    const jsonPayload = serializeSyncPayload();
    const roomCode = await uploadSyncPayloadToCloud(jsonPayload);

    activeSyncRoomId = roomCode;
    isSyncHost = true;
    localStorage.setItem(SYNC_STORAGE_KEY, activeSyncRoomId);
    localStorage.setItem(SYNC_HOST_KEY, 'true');
    lastSyncedTimestamp = Date.now();
    
    saveState();
    updateSyncUI();
    renderPlaylists();
    renderTracks();
    startCloudSyncPolling();
    showSyncStatus(`동기화 코드가 발급되었습니다 (${targets.length}개 연동): ${roomCode}`, 'success', 5000);
  } catch (err) {
    console.error('Create sync room error:', err);
    showSyncStatus('동기화 코드 생성 실패: ' + err.message, 'error', 5000);
  } finally {
    isSyncingNow = false;
    if (el.btnConfirmCreateSync) {
      el.btnConfirmCreateSync.disabled = false;
      el.btnConfirmCreateSync.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span id="sync-selected-count-label">0개</span> 동기화 시작';
    }
    if (el.btnCreateSyncRoom) {
      el.btnCreateSyncRoom.disabled = false;
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
    const result = await downloadSyncPayloadFromCloud(inputRawCode);
    if (result && result.isClosed) {
      throw new Error('해당 동기화 방은 방장에 의해 이미 종료(해제)되었습니다.');
    }

    const { parsed, rawKey, pasteKey } = result;

    if (parsed && Array.isArray(parsed.playlists)) {
      // 썸네일 완전 복원 및 데이터 매핑 (로컬 플레이리스트는 100% 보존!)
      appState.cloudPlaylists = parsed.playlists.map(pl => ({
        id: pl.id || `cpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: cleanPlaylistName(pl.name) || '클라우드 플레이리스트',
        originLocalPlId: pl.originLocalPlId || null,
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
      lastSyncedPasteKey = pasteKey;
      activeSyncRoomId = rawKey.startsWith('PL-') || rawKey.startsWith('DP-') ? rawKey : 'PL-' + rawKey;
      isSyncHost = false;
      localStorage.setItem(SYNC_STORAGE_KEY, activeSyncRoomId);
      localStorage.setItem(SYNC_HOST_KEY, 'false');

      // 🌟 클라우드에서 받아온 로컬 플리만 골라서 동일하게 트랙 업데이트!
      syncLinkedLocalPlaylistsFromCloud();
      deduplicateLocalPlaylists();

      saveState();
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
  }, 350);
}

// 🔗 클라우드에서 업데이트된 트랙 데이터를 '연동된 로컬 플레이리스트'에만 정확히 동기화
function syncLinkedLocalPlaylistsFromCloud() {
  if (!activeSyncRoomId || !appState.playlists || !appState.cloudPlaylists) return;
  let hasLocalChange = false;

  appState.playlists.forEach(localPl => {
    // 💡 방장 기기의 originLocalPlId 일치 또는 게스트 기기의 originCloudPlId 일치
    const matchingCloudPl = appState.cloudPlaylists.find(cp => 
      (cp.originLocalPlId && cp.originLocalPlId === localPl.id) ||
      (localPl.originCloudPlId && cp.id === localPl.originCloudPlId)
    );

    if (matchingCloudPl && Array.isArray(matchingCloudPl.tracks)) {
      localPl.syncWithCloud = true;
      localPl.tracks = JSON.parse(JSON.stringify(matchingCloudPl.tracks));
      hasLocalChange = true;
    }
  });

  if (hasLocalChange) {
    saveState(false); // 로컬 저장 (중복 클라우드 푸시 방지)
  }
}

// 🔗 연동된 로컬 플리에서 곡이 추가/삭제/이동된 경우 클라우드 플리에도 반영
function syncLinkedLocalToCloudPlaylist(localPl) {
  if (!activeSyncRoomId || !localPl || !appState.cloudPlaylists) return false;

  const matchingCloudPl = appState.cloudPlaylists.find(cp => 
    (cp.originLocalPlId && cp.originLocalPlId === localPl.id) ||
    (localPl.originCloudPlId && cp.id === localPl.originCloudPlId)
  );

  if (matchingCloudPl) {
    matchingCloudPl.tracks = JSON.parse(JSON.stringify(localPl.tracks || []));
    scheduleCloudPush();
    return true;
  }
  return false;
}

// 💡 곡 추가/삭제 시에도 방 코드는 절대 변경되지 않고 포인터 덮어쓰기 저장!
async function pushStateToCloud(showToast = false) {
  if (!activeSyncRoomId || isSyncingNow) return;
  isSyncingNow = true;

  if (showToast) {
    showSyncStatus('클라우드에 데이터를 올리는 중...', 'info', 0);
  }

  try {
    const jsonPayload = serializeSyncPayload();
    // activeSyncRoomId를 전달하여 동일한 방 코드에 포인터 덮어쓰기 저장!
    await uploadSyncPayloadToCloud(jsonPayload, activeSyncRoomId);
    
    lastSyncedTimestamp = Date.now();
    updateSyncUI();

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

  if (showToast) {
    showSyncStatus('클라우드에서 최신 데이터를 가져오는 중...', 'info', 0);
  }

  try {
    const result = await downloadSyncPayloadFromCloud(activeSyncRoomId);

    // 🛑 방장이 동기화를 해제(종료)한 경우 -> 연결된 기기에서도 안전하게 자동 연결 해제!
    if (result && result.isClosed) {
      handleRemoteSyncClosed();
      return;
    }

    const { parsed, pasteKey } = result;

    if (parsed && Array.isArray(parsed.playlists)) {
      const remoteUpdatedAt = parsed.updatedAt || 0;
      const isNewer = remoteUpdatedAt > lastSyncedTimestamp || (pasteKey && pasteKey !== lastSyncedPasteKey);

      if (isNewer) {
        const currentTrack = getCurrentPlaylist()?.tracks?.[appState.currentTrackIndex];

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

        // 🌟 클라우드에서 받아온 로컬 플리만 골라서 동일하게 트랙 업데이트! (다른 로컬 플리는 전혀 건드리지 않음)
        syncLinkedLocalPlaylistsFromCloud();

        if (!isCloudPlaylist(appState.activePlaylistId) && appState.cloudPlaylists.length > 0) {
          appState.activePlaylistId = appState.cloudPlaylists[0].id;
        }

        // 재생 중인 곡 인덱스 보정 (음악이 끊기거나 첫곡으로 튀지 않도록)
        if (currentTrack) {
          const activePl = getCurrentPlaylist();
          if (activePl && activePl.tracks) {
            const newIdx = activePl.tracks.findIndex(t => (t.videoId || t.id) === (currentTrack.videoId || currentTrack.id));
            if (newIdx !== -1) {
              appState.currentTrackIndex = newIdx;
            }
          }
        }

        lastSyncedTimestamp = remoteUpdatedAt || Date.now();
        lastSyncedPasteKey = pasteKey;

        renderPlaylists();
        renderTracks();
        highlightActiveTrack();

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
  }
}

// 🛡️ [동기화 해제 시 데이터 정리]
// 1. 이미 사용자가 '내 로컬에 영구 복사'했거나 이름/ID가 일치하는 로컬 플리가 있는 경우: 최신 트랙만 동기화하고 연동 해제
// 2. 일치하는 로컬 플리가 없는 경우 (방장이 공유한 플리를 게스트가 로컬에 복사하지 않고 감상만 하던 경우):
//    - 로컬에 절대 새 플레이리스트를 복제/추가(push)하지 않음! (방장 기기, 연결된 기기 모두 무한 복제 원천 차단)
//    - 게스트 기기의 기존 원래 로컬 플레이리스트들은 100% 그대로 안전하게 보존됨
function preserveCloudPlaylistsToLocal(isHost = false) {
  if (!appState.cloudPlaylists || appState.cloudPlaylists.length === 0) return false;
  if (!appState.playlists) appState.playlists = [];

  let hasChanges = false;

  appState.cloudPlaylists.forEach(cloudPl => {
    const cleanPlName = cleanPlaylistName(cloudPl.name);

    // 이미 연동된 로컬 플리가 있거나 동일한 이름을 가진 로컬 플리가 있는지 확인
    const linkedLocal = appState.playlists.find(lp => 
      (cloudPl.originLocalPlId && lp.id === cloudPl.originLocalPlId) ||
      (lp.originCloudPlId && lp.originCloudPlId === cloudPl.id) ||
      cleanPlaylistName(lp.name) === cleanPlName
    );

    if (linkedLocal) {
      // 이미 로컬에 연동해 둔 플리가 있다면 최신 트랙 반영 후 연동 해제 (새 플리 절대 생성 안 함)
      if (Array.isArray(cloudPl.tracks)) {
        linkedLocal.tracks = JSON.parse(JSON.stringify(cloudPl.tracks));
      }
      linkedLocal.name = cleanPlName;
      linkedLocal.originCloudPlId = null;
      linkedLocal.syncWithCloud = false;
      hasChanges = true;
    }
    // 🛑 일치하는 로컬 플리가 없는 경우:
    // 사용자가 명시적으로 '내 로컬에 영구 복사'를 누른 적이 없는 클라우드 전용 플리이므로,
    // 동기화 해제 시 로컬에 절대 추가(push)하지 않습니다! (복제 생성 방지)
  });

  // 모든 로컬 플리의 이름 정규화 및 syncWithCloud 플래그 해제
  appState.playlists.forEach(lp => {
    lp.name = cleanPlaylistName(lp.name);
    lp.syncWithCloud = false;
    lp.originCloudPlId = null;
  });

  // 🧹 모든 중복 플리 병합 및 중복 제거
  deduplicateLocalPlaylists();

  return hasChanges;
}

// 🛑 방장이 동기화를 종료했을 때 연결된 다른 기기에서 안전하게 자동 해제 처리 (다른 기기 데이터 100% 보존)
function handleRemoteSyncClosed() {
  if (syncPollingTimer) {
    clearInterval(syncPollingTimer);
    syncPollingTimer = null;
  }

  // 🛡️ [다른 기기에서 삭제 방지] 참여 기기이므로 isHost = false
  preserveCloudPlaylistsToLocal(false);

  activeSyncRoomId = null;
  lastSyncedPasteKey = null;
  isSyncHost = false;
  appState.cloudPlaylists = [];
  localStorage.removeItem(SYNC_STORAGE_KEY);
  localStorage.removeItem(SYNC_HOST_KEY);

  // 활성 플레이리스트를 안전한 로컬 플레이리스트로 복귀
  if (appState.playlists && appState.playlists.length > 0) {
    const stillValid = appState.playlists.some(p => p.id === appState.activePlaylistId);
    if (!stillValid) {
      appState.activePlaylistId = appState.playlists[0].id;
      appState.currentTrackIndex = -1;
    }
  } else {
    appState.activePlaylistId = null;
    appState.currentTrackIndex = -1;
  }

  saveState(false);
  updateSyncUI();
  renderPlaylists();
  renderTracks();

  showSyncStatus('방장이 동기화를 종료하여 연결이 해제되었습니다. 모든 플레이리스트는 로컬에 안전하게 보존되었습니다.', 'warning', 7000);
  alert('📢 동기화 종료 알림\n\n방장이 동기화를 해제하여 기기 간 동기화 연결이 자동으로 종료되었습니다.\n\n플레이리스트와 수록곡들은 삭제되지 않고 내 로컬 플레이리스트에 100% 안전하게 보존되었습니다.');
}

async function disconnectSyncRoom() {
  const confirmMsg = isSyncHost
    ? '정말 동기화를 해제하시겠습니까?\n\n* 방장이 동기화를 해제하면 연결된 다른 기기들도 동기화가 함께 안전하게 해제됩니다.\n* 모든 기기의 플레이리스트는 로컬에 100% 안전하게 보존되며 삭제되지 않습니다.'
    : '정말 동기화를 해제하시겠습니까?\n\n* 내 플레이리스트는 로컬에 100% 안전하게 보존됩니다.\n* 클라우드 동기화 연결만 해제됩니다.';

  if (!confirm(confirmMsg)) {
    return;
  }

  const roomToClose = activeSyncRoomId;
  const wasHost = isSyncHost;

  // 1. 방장(Host)인 경우, 연결된 다른 기기들이 인지할 수 있도록 KV 스토어에 방 종료 신호(ROOM_CLOSED) 전송
  if (wasHost && roomToClose) {
    const bareCode = roomToClose.replace(/^PL-/, '');
    try {
      showSyncStatus('동기화 방을 안전하게 종료하는 중...', 'info', 0);
      await Promise.allSettled([
        fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${SYNC_KV_APP_KEY}/${encodeURIComponent(roomToClose)}/ROOM_CLOSED`, { method: 'POST', body: '' }),
        fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${SYNC_KV_APP_KEY}/${encodeURIComponent(bareCode)}/ROOM_CLOSED`, { method: 'POST', body: '' })
      ]);
    } catch (e) {
      console.warn('Failed to broadcast room closure:', e);
    }
  }

  // 2. 🛡️ [삭제 및 중복 복제 방지]
  // wasHost 여부를 전달하여 방장 기기에서는 중복/보존 플리가 새로 생성되지 않도록 철저히 차단!
  preserveCloudPlaylistsToLocal(wasHost);

  if (syncPollingTimer) {
    clearInterval(syncPollingTimer);
    syncPollingTimer = null;
  }

  activeSyncRoomId = null;
  lastSyncedPasteKey = null;
  isSyncHost = false;
  appState.cloudPlaylists = [];
  localStorage.removeItem(SYNC_STORAGE_KEY);
  localStorage.removeItem(SYNC_HOST_KEY);

  // 3. 만약 선택된 플레이리스트가 클라우드였다면 로컬 플레이리스트로 복귀
  if (appState.playlists && appState.playlists.length > 0) {
    const stillValid = appState.playlists.some(p => p.id === appState.activePlaylistId);
    if (!stillValid) {
      appState.activePlaylistId = appState.playlists[0].id;
      appState.currentTrackIndex = -1;
    }
  } else {
    appState.activePlaylistId = null;
    appState.currentTrackIndex = -1;
  }

  saveState();
  updateSyncUI();
  renderPlaylists();
  renderTracks();

  if (wasHost) {
    showSyncStatus('방 동기화가 종료되었습니다. 연결된 모든 기기에서도 안전하게 해제됩니다.', 'info', 5000);
  } else {
    showSyncStatus('동기화 연결이 해제되었습니다. 로컬 플레이리스트 모드로 작동합니다.', 'info', 4000);
  }
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
    if (activeSyncRoomId) {
      pullStateFromCloud(false);
    }
  }, 3500);
}

function initCloudSync() {
  const savedIsHost = localStorage.getItem(SYNC_HOST_KEY);
  isSyncHost = (savedIsHost === 'true');

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

  // 트랙 일괄 선택 및 이동/삭제 이벤트 리스너 등록
  if (el.btnToggleSelectMode) {
    el.btnToggleSelectMode.addEventListener('click', () => toggleTrackSelectionMode());
  }
  if (el.chkSelectAllTracks) {
    el.chkSelectAllTracks.addEventListener('change', (e) => handleSelectAllTracks(e.target.checked));
  }
  if (el.btnBatchMoveUp) {
    el.btnBatchMoveUp.addEventListener('click', () => batchMoveTracks('up'));
  }
  if (el.btnBatchMoveDown) {
    el.btnBatchMoveDown.addEventListener('click', () => batchMoveTracks('down'));
  }
  if (el.btnBatchMoveTop) {
    el.btnBatchMoveTop.addEventListener('click', () => batchMoveTracks('top'));
  }
  if (el.btnBatchMoveBottom) {
    el.btnBatchMoveBottom.addEventListener('click', () => batchMoveTracks('bottom'));
  }
  if (el.btnBatchDelete) {
    el.btnBatchDelete.addEventListener('click', () => batchDeleteTracks());
  }

  if (el.formAddTrack) {
    el.formAddTrack.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = el.inputYoutubeUrl ? el.inputYoutubeUrl.value : '';
      addTrackFromUrl(url);
      return false;
    });
  }
  if (el.btnSubmitAdd) {
    el.btnSubmitAdd.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = el.inputYoutubeUrl ? el.inputYoutubeUrl.value : '';
      addTrackFromUrl(url);
    });
  }
  if (el.inputYoutubeUrl) {
    el.inputYoutubeUrl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        addTrackFromUrl(el.inputYoutubeUrl.value);
      }
    });
  }

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

  if (el.focusVolumeSlider) {
    el.focusVolumeSlider.addEventListener('input', (e) => {
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
        const restoreVol = appState.settings.volume || 80;
        if (el.volumeSlider) el.volumeSlider.value = restoreVol;
        if (el.focusVolumeSlider) el.focusVolumeSlider.value = restoreVol;
        updateVolumeIcon(restoreVol);
      } else {
        ytPlayer.mute();
        if (el.volumeSlider) el.volumeSlider.value = 0;
        if (el.focusVolumeSlider) el.focusVolumeSlider.value = 0;
        updateVolumeIcon(0);
      }
    } catch (e) {}
  };

  el.btnMute.addEventListener('click', toggleMute);
  if (el.btnMobileMute) el.btnMobileMute.addEventListener('click', toggleMute);
  if (el.btnFocusMute) el.btnFocusMute.addEventListener('click', toggleMute);

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
  // 🌟 감상 모드 (앨범아트 캐러셀) 이벤트
  if (el.btnFocusMode) el.btnFocusMode.addEventListener('click', toggleCarouselFocusMode);
  if (el.btnFocusModeBar) el.btnFocusModeBar.addEventListener('click', toggleCarouselFocusMode);
  if (el.btnMobileFocus) el.btnMobileFocus.addEventListener('click', toggleCarouselFocusMode);

  // 🎤 가사 모드 (실시간 싱크 가사) 이벤트
  if (el.btnBarLyrics) el.btnBarLyrics.addEventListener('click', toggleLyricsMode);
  if (el.btnMobileLyrics) el.btnMobileLyrics.addEventListener('click', toggleLyricsMode);

  // 오버레이 내부 상단 가사/감상 상호 전환 버튼
  if (el.btnFocusLyrics) el.btnFocusLyrics.addEventListener('click', toggleInsideFocusView);

  if (el.btnCloseFocus) el.btnCloseFocus.addEventListener('click', closeFocusMode);
  if (el.btnFocusFullscreen) el.btnFocusFullscreen.addEventListener('click', toggleFocusFullscreen);
  if (el.btnFocusPlayPause) el.btnFocusPlayPause.addEventListener('click', togglePlayPause);
  if (el.btnFocusPrev) el.btnFocusPrev.addEventListener('click', playPrevTrack);
  if (el.btnFocusNext) el.btnFocusNext.addEventListener('click', playNextTrack);
  if (el.btnFocusShuffle) el.btnFocusShuffle.addEventListener('click', toggleShuffle);
  if (el.btnFocusRepeat) el.btnFocusRepeat.addEventListener('click', toggleRepeat);
  setupFocusSeekbarDragEvents();

  if (el.btnLyricsOffsetMinus2) el.btnLyricsOffsetMinus2.addEventListener('click', () => adjustLyricsOffset(-2.0));
  if (el.btnLyricsOffsetMinus) el.btnLyricsOffsetMinus.addEventListener('click', () => adjustLyricsOffset(-0.5));
  if (el.btnLyricsOffsetPlus) el.btnLyricsOffsetPlus.addEventListener('click', () => adjustLyricsOffset(0.5));
  if (el.btnLyricsOffsetPlus2) el.btnLyricsOffsetPlus2.addEventListener('click', () => adjustLyricsOffset(2.0));
  if (el.btnLyricsOffsetReset) el.btnLyricsOffsetReset.addEventListener('click', () => adjustLyricsOffset(0));

  // 가사 모드 전용 설정 패널 토글
  if (el.btnLyricsSettingsToggle) {
    el.btnLyricsSettingsToggle.addEventListener('click', () => {
      if (el.focusLyricsSettingsPanel) {
        el.focusLyricsSettingsPanel.classList.toggle('hidden');
        if (!el.focusLyricsSettingsPanel.classList.contains('hidden')) {
          if (el.focusLyricsSearchBox) el.focusLyricsSearchBox.classList.add('hidden');
          if (el.focusLyricsCustomPanel) el.focusLyricsCustomPanel.classList.add('hidden');
        }
      }
    });
  }

  if (el.btnCloseLyricsSettings) {
    el.btnCloseLyricsSettings.addEventListener('click', () => {
      if (el.focusLyricsSettingsPanel) el.focusLyricsSettingsPanel.classList.add('hidden');
    });
  }

  // 가사 직접 등록/편집 패널 토글 및 이벤트 핸들러
  if (el.btnLyricsCustomToggle) {
    el.btnLyricsCustomToggle.addEventListener('click', () => {
      if (el.focusLyricsCustomPanel) {
        if (el.focusLyricsCustomPanel.classList.contains('hidden')) {
          openCustomLyricsPanel();
        } else {
          closeCustomLyricsPanel();
        }
      }
    });
  }

  if (el.btnCloseLyricsCustom) {
    el.btnCloseLyricsCustom.addEventListener('click', closeCustomLyricsPanel);
  }

  if (el.btnCustomLyricsSave) {
    el.btnCustomLyricsSave.addEventListener('click', handleCustomLyricsSave);
  }

  if (el.btnCustomLyricsDelete) {
    el.btnCustomLyricsDelete.addEventListener('click', handleCustomLyricsDelete);
  }

  // 가사 폰트 크기 변경 버튼
  const setLyricsFontSize = (size) => {
    if (!el.focusLyricsList) return;
    el.focusLyricsList.classList.remove('font-small', 'font-large');
    if (el.btnLyricsFontSmaller) el.btnLyricsFontSmaller.classList.remove('active');
    if (el.btnLyricsFontNormal) el.btnLyricsFontNormal.classList.remove('active');
    if (el.btnLyricsFontLarger) el.btnLyricsFontLarger.classList.remove('active');

    if (size === 'small') {
      el.focusLyricsList.classList.add('font-small');
      if (el.btnLyricsFontSmaller) el.btnLyricsFontSmaller.classList.add('active');
    } else if (size === 'large') {
      el.focusLyricsList.classList.add('font-large');
      if (el.btnLyricsFontLarger) el.btnLyricsFontLarger.classList.add('active');
    } else {
      if (el.btnLyricsFontNormal) el.btnLyricsFontNormal.classList.add('active');
    }

    if (activeLyricLineIndex >= 0) {
      const lines = el.focusLyricsList.querySelectorAll('.lyric-line');
      if (lines[activeLyricLineIndex]) scrollActiveLyricToCenter(lines[activeLyricLineIndex], false);
    }
  };

  if (el.btnLyricsFontSmaller) el.btnLyricsFontSmaller.addEventListener('click', () => setLyricsFontSize('small'));
  if (el.btnLyricsFontNormal) el.btnLyricsFontNormal.addEventListener('click', () => setLyricsFontSize('normal'));
  if (el.btnLyricsFontLarger) el.btnLyricsFontLarger.addEventListener('click', () => setLyricsFontSize('large'));

  if (el.btnLyricsSearchToggle) {
    el.btnLyricsSearchToggle.addEventListener('click', () => {
      if (el.focusLyricsSearchBox) {
        el.focusLyricsSearchBox.classList.toggle('hidden');
        if (!el.focusLyricsSearchBox.classList.contains('hidden')) {
          if (el.focusLyricsSettingsPanel) el.focusLyricsSettingsPanel.classList.add('hidden'); // 설정창 열려있으면 닫기
          if (el.focusLyricsCustomPanel) el.focusLyricsCustomPanel.classList.add('hidden'); // 직접 등록창 열려있으면 닫기
          if (el.inputLyricsQuery) {
            const curPl = getCurrentPlaylist();
            const tr = curPl ? curPl.tracks[appState.currentTrackIndex] : null;
            el.inputLyricsQuery.value = tr ? tr.title : '';
            el.inputLyricsQuery.focus();
          }
        }
      }
    });
  }

  if (el.btnLyricsQuerySubmit) el.btnLyricsQuerySubmit.addEventListener('click', handleManualLyricsSearch);
  if (el.inputLyricsQuery) {
    el.inputLyricsQuery.addEventListener('keydown', (e) => {
      if (e.code === 'Enter') {
        e.preventDefault();
        handleManualLyricsSearch();
      }
    });
  }

  // 가사 수동 스크롤 감지 및 가만히 있을 때 싱크 자동 복귀 처리
  if (el.focusLyricsScroll) {
    const onUserManualInteraction = () => {
      if (!isLyricsViewActive) return;
      isUserInteractingWithLyrics = true;
    };

    el.focusLyricsScroll.addEventListener('wheel', onUserManualInteraction, { passive: true });
    el.focusLyricsScroll.addEventListener('touchstart', onUserManualInteraction, { passive: true });
    el.focusLyricsScroll.addEventListener('touchmove', onUserManualInteraction, { passive: true });
    el.focusLyricsScroll.addEventListener('mousedown', onUserManualInteraction, { passive: true });

    const triggerAutoSyncReturn = () => {
      clearTimeout(userLyricsScrollTimer);
      userLyricsScrollTimer = setTimeout(() => {
        isUserInteractingWithLyrics = false;
        isUserScrollingLyrics = false;
        returnToActiveLyricSync();
      }, 2000);
    };

    el.focusLyricsScroll.addEventListener('scroll', () => {
      if (!isLyricsViewActive) return;

      // 자동 프로그램 스크롤에 의해 발생한 scroll 이벤트는 무시
      if (isProgrammaticLyricsScrolling) return;

      isUserScrollingLyrics = true;
      triggerAutoSyncReturn();
    }, { passive: true });

    el.focusLyricsScroll.addEventListener('touchend', triggerAutoSyncReturn, { passive: true });
    el.focusLyricsScroll.addEventListener('mouseup', triggerAutoSyncReturn, { passive: true });
  }

  // 사이트 전체화면 버튼 이벤트
  if (el.btnFullscreenSite) el.btnFullscreenSite.addEventListener('click', toggleSiteFullscreen);
  if (el.btnNavFullscreen) el.btnNavFullscreen.addEventListener('click', toggleSiteFullscreen);
  if (el.btnMobileFullscreen) el.btnMobileFullscreen.addEventListener('click', toggleSiteFullscreen);

  document.addEventListener('fullscreenchange', updateAllFullscreenIcons);
  document.addEventListener('webkitfullscreenchange', updateAllFullscreenIcons);
  document.addEventListener('msfullscreenchange', updateAllFullscreenIcons);

  // 감상 모드 스크롤 후 정지 시 현재 곡으로 자동 중앙 복귀
  if (el.focusCarouselViewport) {
    const handleFocusScrollActivity = () => {
      if (!isFocusModeOpen) return;
      if (focusScrollTimeout) {
        clearTimeout(focusScrollTimeout);
      }
      // 사용자가 터치나 드래그를 끝내고 스크롤이 멈춘 후 1.3초 뒤에 현재 재생 중인 곡으로 자동 중앙 정렬
      focusScrollTimeout = setTimeout(() => {
        if (isFocusModeOpen && !isUserTouchingFocus) {
          centerActiveFocusTrack(true);
        }
      }, 1300);
    };

    el.focusCarouselViewport.addEventListener('scroll', handleFocusScrollActivity, { passive: true });

    el.focusCarouselViewport.addEventListener('touchstart', () => {
      isUserTouchingFocus = true;
      if (focusScrollTimeout) clearTimeout(focusScrollTimeout);
    }, { passive: true });

    el.focusCarouselViewport.addEventListener('touchend', () => {
      isUserTouchingFocus = false;
      handleFocusScrollActivity();
    }, { passive: true });

    el.focusCarouselViewport.addEventListener('touchcancel', () => {
      isUserTouchingFocus = false;
      handleFocusScrollActivity();
    }, { passive: true });

    el.focusCarouselViewport.addEventListener('mousedown', () => {
      isUserTouchingFocus = true;
      if (focusScrollTimeout) clearTimeout(focusScrollTimeout);
    });

    window.addEventListener('mouseup', () => {
      if (isUserTouchingFocus) {
        isUserTouchingFocus = false;
        handleFocusScrollActivity();
      }
    });
  }

  // 클라우드 기기 동기화 이벤트
  if (el.btnCloudSync) el.btnCloudSync.addEventListener('click', openSyncModal);
  if (el.btnCloseSyncModal) el.btnCloseSyncModal.addEventListener('click', closeSyncModal);
  if (el.syncModal) {
    el.syncModal.addEventListener('click', (e) => {
      if (e.target === el.syncModal) closeSyncModal();
    });
  }
  // ☁️ 동기화 연동 플레이리스트 선택 및 코드 발급 이벤트
  if (el.btnCreateSyncRoom) el.btnCreateSyncRoom.addEventListener('click', openPlaylistSelectionForSync);
  if (el.btnCancelSyncSelect) {
    el.btnCancelSyncSelect.addEventListener('click', () => {
      if (el.syncSelectPlaylistsView) el.syncSelectPlaylistsView.classList.add('hidden');
      if (el.syncDisconnectedView) el.syncDisconnectedView.classList.remove('hidden');
    });
  }
  if (el.btnSyncSelectAll) {
    el.btnSyncSelectAll.addEventListener('click', () => {
      if (!el.syncPlaylistChecklist) return;
      el.syncPlaylistChecklist.querySelectorAll('.sync-check-item').forEach(item => {
        const cb = item.querySelector('input');
        if (cb) cb.checked = true;
        item.classList.add('selected');
      });
      updateSyncSelectedCount();
    });
  }
  if (el.btnSyncDeselectAll) {
    el.btnSyncDeselectAll.addEventListener('click', () => {
      if (!el.syncPlaylistChecklist) return;
      el.syncPlaylistChecklist.querySelectorAll('.sync-check-item').forEach(item => {
        const cb = item.querySelector('input');
        if (cb) cb.checked = false;
        item.classList.remove('selected');
      });
      updateSyncSelectedCount();
    });
  }
  if (el.btnConfirmCreateSync) {
    el.btnConfirmCreateSync.addEventListener('click', () => {
      if (!el.syncPlaylistChecklist) return;
      const selected = Array.from(el.syncPlaylistChecklist.querySelectorAll('.sync-pl-checkbox:checked')).map(cb => cb.value);
      if (selected.length === 0) {
        showSyncStatus('최소 1개 이상의 플레이리스트를 선택해주세요.', 'error', 3000);
        return;
      }
      createSyncRoom(selected);
    });
  }

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

  // 화면 복귀 및 탭 전환 / 잠금화면 진입 시 자동 복구 & 백그라운드 유지
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
    } else {
      // document.visibilityState === 'hidden' (화면 꺼짐, 잠금화면 전환, 다른 앱 이동)
      if (appState.isPlaying) {
        // 모바일/데스크톱 잠금화면 미디어 컨트롤러 및 오디오 재생 세션 유지
        startSilentAudioDriver();
        updateMediaSessionPositionState();
      }
    }
  });

  window.addEventListener('focus', () => {
    if (activeSyncRoomId) {
      pullStateFromCloud(false);
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
    if ((e.code === 'KeyF' || e.key === 'f' || e.key === 'F') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      toggleSiteFullscreen();
    }
    if ((e.code === 'KeyL' || e.key === 'l' || e.key === 'L') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      toggleLyricsView();
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
  try { checkProtocol(); } catch (e) { console.error('checkProtocol error:', e); }
  try { loadState(); } catch (e) { console.error('loadState error:', e); }
  try { initSilentAudioDriver(); } catch (e) { console.error('initSilentAudioDriver error:', e); }
  try { initTopSoundWaveform(); } catch (e) { console.error('initTopSoundWaveform error:', e); }
  try { setupEventListeners(); } catch (e) { console.error('setupEventListeners error:', e); }
  try { renderPlaylists(); } catch (e) { console.error('renderPlaylists error:', e); }
  try { renderTracks(); } catch (e) { console.error('renderTracks error:', e); }
  try { updateRepeatUI(); } catch (e) {}
  try { updateShuffleUI(); } catch (e) {}
  try { updateNowPlayingInfo(null); } catch (e) {}
  try { updateVideoVisibilityUI(); } catch (e) {}
  try { initCloudSync(); } catch (e) {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
