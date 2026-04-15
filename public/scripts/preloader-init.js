(function() {
  try {
    if (!sessionStorage.getItem('visited_home') && window.location.pathname === '/') {
      var colors = ['#96e91e', '#efff9b', '#f22d19', '#fea3e0', '#d8d0ff', '#0f0fca'];
      document.documentElement.style.setProperty('--preloader-color', colors[Math.floor(Math.random() * colors.length)]);
      document.documentElement.classList.add('is-first-visit');
    }
  } catch (e) {
    console.error('Preloader script error:', e);
  }
})();
