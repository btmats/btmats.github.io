/* ============================================================
   1 深浅色切换
   首屏主题由 <head> 里的内联脚本在绘制前定好，这里只负责
   「按下按钮 → 换主题 → 记住选择」，并把浏览器 UI 色一起改掉。
   ============================================================ */
(function () {
  var root = document.documentElement;
  var KEY = 'btmats-theme';
  var META = { light: '#FAF9F6', dark: '#171614' };

  function sync(theme) {
    var isDark = theme === 'dark';
    root.setAttribute('data-theme', theme);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', META[theme]);

    Array.prototype.forEach.call(document.querySelectorAll('[data-theme-toggle]'), function (btn) {
      btn.setAttribute('aria-label', isDark ? '切换到浅色' : '切换到深色');
      btn.setAttribute('title', isDark ? '切换到浅色' : '切换到深色');
    });
  }

  function read() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved !== 'light' && saved !== 'dark') {
      saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    return saved;
  }

  sync(root.getAttribute('data-theme') || read());

  document.addEventListener('click', function (event) {
    var btn = event.target.closest ? event.target.closest('[data-theme-toggle]') : null;
    if (!btn) return;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    sync(next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
  });

  /* 没手动选过的人，跟随系统的深浅色实时变化 */
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (ev) {
      var saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) {}
      if (saved === 'light' || saved === 'dark') return;
      sync(ev.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
})();

/* ============================================================
   2 滚动显现：默认可见，只有 JS 生效时才隐藏再淡入（见 style.css §11）
   ============================================================ */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (!document.documentElement.classList.contains('js-reveal')) return;

  var targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (!targets.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var siblings = el.parentNode ? el.parentNode.children : [];
      var index = Array.prototype.indexOf.call(siblings, el);
      var step = index > 0 ? Math.min(index, 8) : 0;
      el.style.setProperty('--reveal-delay', (step * 60) + 'ms');
      el.classList.add('is-in');
      observer.unobserve(el);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

  targets.forEach(function (el) { observer.observe(el); });
})();
