let castApiReady = false;
let castSession = null;

window['__onGCastApiAvailable'] = function(isAvailable) {
  castApiReady = isAvailable;
  if (isAvailable) {
    initializeCastApi();
  }
};

function initializeCastApi() {
  const sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
  const apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
  chrome.cast.initialize(apiConfig, () => console.log('✅ Cast 初始化成功'), onError);
}

function sessionListener(session) {
  castSession = session;
  console.log('已有 Cast 会话:', session.sessionId);
}

function receiverListener(availability) {
  if (availability === chrome.cast.ReceiverAvailability.AVAILABLE) {
    console.log('📺 可用接收设备已发现');
  }
}

function onError(err) {
  console.error('❌ Cast 错误:', err);
}

function launchCast(mediaUrl, startTime) {
  if (!castApiReady) {
    alert('Cast SDK 未准备好，请使用 Chrome 浏览器');
    return;
  }

  if (castSession) {
    loadMedia(castSession, mediaUrl, startTime);
  } else {
    chrome.cast.requestSession(session => {
      castSession = session;
      loadMedia(session, mediaUrl, startTime);
    }, onError);
  }
}

function loadMedia(session, mediaUrl, startTime) {
  const contentType = mediaUrl.endsWith('.mp4') ? 'video/mp4' :
                      mediaUrl.endsWith('.webm') ? 'video/webm' :
                      mediaUrl.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/*';

  const mediaInfo = new chrome.cast.media.MediaInfo(mediaUrl, contentType);
  mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;

  const request = new chrome.cast.media.LoadRequest(mediaInfo);
  request.currentTime = startTime;

  session.loadMedia(request)
    .then(() => console.log('✅ 视频已发送至电视'))
    .catch(onError);
}

// 插入投屏按钮
(function insertCastButton() {
  if (window.CastButtonInjected) return;
  window.CastButtonInjected = true;

  const controlsRight = document.querySelector('.art-controls-right') || 
                        document.querySelector('#playerCnt .art-controls-right') ||
                        document.querySelector('.art-bottom .art-controls-right');

  if (!controlsRight) {
    console.warn('❌ 未找到 .art-controls-right 容器');
    return;
  }

  const castButton = document.createElement('div');
  castButton.className = 'art-control art-control-cast hint--rounded hint--top';
  castButton.setAttribute('aria-label', '无线投屏');
  castButton.title = '无线投屏功能';
  castButton.innerHTML = `
    <i class="art-icon art-icon-cast">
      <svg class="icon cast-icon" viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor">
        <path d="M527.104 697.770667l161.792 161.792a21.333333 21.333333 0 0 1-15.061333 36.437333H350.165333a21.333333 21.333333 0 0 1-15.061333-36.437333l161.792-161.792a21.333333 21.333333 0 0 1 30.208 0zM810.666667 128a128 128 0 0 1 127.786666 120.490667L938.666667 256v426.666667a128 128 0 0 1-120.490667 127.786666L810.666667 810.666667h-110.293334l-85.333333-85.333334H810.666667a42.666667 42.666667 0 0 0 42.368-37.674666L853.333333 682.666667V256a42.666667 42.666667 0 0 0-37.674666-42.368L810.666667 213.333333H213.333333a42.666667 42.666667 0 0 0-42.368 37.674667L170.666667 256v426.666667a42.666667 42.666667 0 0 0 37.674666 42.368L213.333333 725.333333h195.584l-85.333333 85.333334H213.333333a128 128 0 0 1-127.786666-120.490667L85.333333 682.666667V256a128 128 0 0 1 120.490667-127.786667L213.333333 128h597.333334z"/>
      </svg>
    </i>`;

  castButton.addEventListener('click', () => {
    const video = document.querySelector('video');
    if (!video) {
      alert('未找到视频元素');
      return;
    }

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);

    if (isIOS && 'webkitShowPlaybackTargetPicker' in video) {
      video.webkitShowPlaybackTargetPicker();
    } else if (castApiReady) {
      launchCast(video.currentSrc, video.currentTime);
    } else {
      alert('请确保使用Chrome浏览器且加载了Cast SDK');
    }
  });

  controlsRight.insertBefore(castButton, controlsRight.firstChild);
  console.log('✅ 投屏按钮已成功插入到控制栏中');
})();
