/* GA4 outbound conversion events: one delegated document click listener. */
(function () {
  'use strict';
  document.addEventListener('click', function (event) {
    var target = event.target && event.target.nodeType === 1
      ? event.target
      : event.target && event.target.parentElement;
    var link = target && target.closest ? target.closest('a[href]') : null;
    if (!link || typeof window.gtag !== 'function') return;

    var href = link.getAttribute('href') || '';
    if (/^\s*tel:/i.test(href)) {
      window.gtag('event', 'phone_click', { transport_type: 'beacon' });
      return;
    }

    var url;
    try { url = new URL(href, document.baseURI); } catch (_) { return; }
    var host = url.hostname.toLowerCase();
    function isHost(domain) { return host === domain || host.endsWith('.' + domain); }
    var params = { transport_type: 'beacon' };

    if (isHost('open.kakao.com')) {
      window.gtag('event', 'generate_lead', { method: 'kakao_openchat', transport_type: 'beacon' });
      window.gtag('event', 'kakao_openchat_click', params);
      window.gtag('event', 'kakao_chat_click', params);
    } else if (isHost('map.kakao.com') || isHost('map.naver.com')) {
      window.gtag('event', 'map_click', params);
    } else if (isHost('youtube.com') || isHost('youtu.be')) {
      window.gtag('event', 'youtube_click', params);
    }
  });
})();
