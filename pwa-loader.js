/* Dreammaker PG — PWA 부트스트랩
 * 모든 HTML head 안에서 1줄 import해서 사용:
 *   <script src="/pwa-loader.js" defer></script>
 *
 * 동작:
 *  1) 모든 페이지에서 Service Worker 등록 → 오프라인·빠른 로딩
 *  2) iOS/Android "홈 화면 추가" 자동 안내 모달 (첫 방문 후 한 번만)
 *  3) index1.html(매장 사장님앱)에서는 dm-store-name이 들어오면
 *     "{가게명} 고객관리" 형태로 manifest를 동적으로 교체
 */
(function () {
  'use strict';

  /* 1. Service Worker 등록 */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((e) => console.warn('[PWA] SW 등록 실패:', e));
    });
  }

  /* 2. 동적 manifest 교체 — 매장 사장님앱 전용 API
   *
   * 사용법(index1.html에서 매장명 받은 후):
   *   window.DM_PWA.setStoreName('나가수 노래주점');
   */
  window.DM_PWA = window.DM_PWA || {};
  window.DM_PWA.setStoreName = function (storeName) {
    if (!storeName) return;
    try {
      const m = {
        name: storeName + ' 고객관리',
        short_name: (storeName.length > 6 ? storeName.slice(0, 6) : storeName) + ' 단골',
        description: storeName + ' 단골 손님 관리 앱',
        start_url: location.pathname + location.search,
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1A2332',
        theme_color: '#1A2332',
        lang: 'ko',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      };
      const blob = new Blob([JSON.stringify(m)], { type: 'application/manifest+json' });
      const blobUrl = URL.createObjectURL(blob);
      let link = document.querySelector('link[rel="manifest"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
      }
      link.setAttribute('href', blobUrl);
      // 앱 이름이 보이는 또 다른 위치
      document.title = storeName + ' 고객관리';
      const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (appleTitle) appleTitle.setAttribute('content', storeName + ' 고객관리');
    } catch (e) {
      console.warn('[PWA] manifest 동적 교체 실패:', e);
    }
  };

  /* 3. "홈 화면에 추가" 안내 (한 번만) */
  const PROMPT_KEY = 'dm_pwa_install_prompt_v1';
  function shouldShowPrompt() {
    // 이미 PWA로 설치되어 standalone으로 열린 경우 → 안내 안 함
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return false;
    if (localStorage.getItem(PROMPT_KEY) === 'dismissed') return false;
    return true;
  }

  // Android Chrome — beforeinstallprompt 캐치
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  function showInstallBanner(opts) {
    if (!shouldShowPrompt()) return;
    if (document.getElementById('dm-pwa-banner')) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const banner = document.createElement('div');
    banner.id = 'dm-pwa-banner';
    banner.style.cssText = [
      'position:fixed','left:12px','right:12px','bottom:14px','z-index:99999',
      'background:#1A2332','color:#F7F5F0','border:1px solid #B89968',
      'border-radius:16px','padding:14px 16px','box-shadow:0 14px 30px rgba(0,0,0,.35)',
      "font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif",
      'font-size:14px','line-height:1.5','display:flex','align-items:center','gap:12px'
    ].join(';');

    const text = isIos
      ? '<b style="color:#E6C68A;">홈 화면에 추가하기</b><br>하단 <b>공유 버튼</b> → <b>“홈 화면에 추가”</b>를 누르면 앱 아이콘으로 사용하실 수 있습니다.'
      : '<b style="color:#E6C68A;">홈 화면에 추가하기</b><br>이 화면을 <b>앱 아이콘처럼</b> 폰 홈 화면에 추가하실 수 있습니다.';

    banner.innerHTML =
      '<div style="flex:1;">' + text + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">' +
      (isIos ? '' : '<button id="dm-pwa-install" style="background:#E6C68A;color:#1A2332;border:none;border-radius:8px;padding:8px 12px;font-weight:700;font-size:13px;">추가하기</button>') +
      '<button id="dm-pwa-close" style="background:transparent;color:#B89968;border:1px solid #4A5568;border-radius:8px;padding:6px 12px;font-size:12px;">나중에</button>' +
      '</div>';

    document.body.appendChild(banner);

    document.getElementById('dm-pwa-close').onclick = () => {
      localStorage.setItem(PROMPT_KEY, 'dismissed');
      banner.remove();
    };
    const installBtn = document.getElementById('dm-pwa-install');
    if (installBtn) {
      installBtn.onclick = async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const choice = await deferredPrompt.userChoice;
          if (choice.outcome === 'accepted') localStorage.setItem(PROMPT_KEY, 'installed');
          else localStorage.setItem(PROMPT_KEY, 'dismissed');
          deferredPrompt = null;
        } else {
          alert('브라우저 메뉴(⋮)에서 "홈 화면에 추가"를 선택해 주세요.');
        }
        banner.remove();
      };
    }
  }

  // 페이지 로드 후 약간 늦게 노출 (UX)
  window.addEventListener('load', () => {
    setTimeout(showInstallBanner, 4000);
  });

  // 외부에서 수동 호출도 가능
  window.DM_PWA.showInstallBanner = showInstallBanner;
})();
