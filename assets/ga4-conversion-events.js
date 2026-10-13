/* GA4 conversion events for Google Ads (Ad Grants). No UI change, no libraries.
   Click events (one delegated listener): click_call, click_kakao, click_directions (+ legacy names kept
   for existing key events / Ads imports). Engagement events: scroll_90, engaged_60s (fire once per page). */
(function () {
  'use strict';
  function send(name, params) {
    if (typeof window.gtag !== 'function') return;
    var p = { transport_type: 'beacon' };
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) p[k] = params[k];
    window.gtag('event', name, p);
  }

  document.addEventListener('click', function (event) {
    var target = event.target && event.target.nodeType === 1
      ? event.target
      : event.target && event.target.parentElement;
    var link = target && target.closest ? target.closest('a[href]') : null;
    if (!link) return;

    var href = link.getAttribute('href') || '';
    if (/^\s*tel:/i.test(href)) {
      send('click_call', { link_url: href });
      send('phone_click', {});
      return;
    }

    var url;
    try { url = new URL(href, document.baseURI); } catch (_) { return; }
    var host = url.hostname.toLowerCase();
    function isHost(domain) { return host === domain || host.endsWith('.' + domain); }

    if (isHost('open.kakao.com') || isHost('pf.kakao.com')) {
      send('click_kakao', { link_url: url.href });
      send('generate_lead', { method: 'kakao_openchat' });
      send('kakao_openchat_click', {});
      send('kakao_chat_click', {});
    } else if (isHost('map.kakao.com') || isHost('map.naver.com') || isHost('naver.me') ||
               isHost('maps.google.com') || isHost('goo.gl') || isHost('maps.app.goo.gl')) {
      send('click_directions', { link_url: url.href });
      send('map_click', {});
    } else if (isHost('youtube.com') || isHost('youtu.be')) {
      send('youtube_click', {});
    }
  });

  /* scroll_90: once, when 90% of the page height has been scrolled into view. */
  var scrollSent = false;
  function checkScroll() {
    if (scrollSent) return;
    var doc = document.documentElement;
    var total = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0);
    if (total <= 0) return;
    var seen = (window.pageYOffset || doc.scrollTop || 0) + window.innerHeight;
    if (seen / total >= 0.9) {
      scrollSent = true;
      send('scroll_90', { percent_scrolled: 90 });
      window.removeEventListener('scroll', checkScroll);
    }
  }
  window.addEventListener('scroll', checkScroll, { passive: true });
  window.addEventListener('load', checkScroll);

  /* engaged_60s: once, after 60 seconds with the tab visible (hidden time does not count). */
  var visibleSeconds = 0, engagedSent = false;
  var timer = setInterval(function () {
    if (document.visibilityState !== 'visible') return;
    visibleSeconds += 1;
    if (visibleSeconds >= 60 && !engagedSent) {
      engagedSent = true;
      send('engaged_60s', { engagement_time_msec: 60000 });
      clearInterval(timer);
    }
  }, 1000);
})();
