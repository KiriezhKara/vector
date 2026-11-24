document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', savedTheme);
  themeToggle?.setAttribute('aria-pressed', String(savedTheme === 'dark'));

  themeToggle?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
  });

  const a11yToggle = document.getElementById('a11yToggle');
  const savedA11y = localStorage.getItem('a11y') === 'true';
  if (savedA11y) {
    html.setAttribute('data-a11y', 'true');
    a11yToggle?.classList.add('a11y-toggle--active');
  }
  a11yToggle?.setAttribute('aria-pressed', String(savedA11y));

  a11yToggle?.addEventListener('click', () => {
    const isActive = html.getAttribute('data-a11y') === 'true';
    if (isActive) {
      html.removeAttribute('data-a11y');
      a11yToggle.classList.remove('a11y-toggle--active');
      a11yToggle.setAttribute('aria-pressed', 'false');
      localStorage.setItem('a11y', 'false');
    } else {
      html.setAttribute('data-a11y', 'true');
      a11yToggle.classList.add('a11y-toggle--active');
      a11yToggle.setAttribute('aria-pressed', 'true');
      localStorage.setItem('a11y', 'true');
    }
  });
});