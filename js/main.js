document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. АВТОМАТИЧЕСКИЙ ПОДСЧЕТ СТАТИСТИКИ =====
  const statsNumbers = document.querySelectorAll('.stats__number');
  
  if (statsNumbers.length === 4) {
    // Загружаем оба XML-файла параллельно
    Promise.all([
      fetch('../data/vacancies.xml').then(res => res.text()),
      fetch('../data/events.xml').then(res => res.text())
    ])
    .then(([vacanciesStr, eventsStr]) => {
      const parser = new DOMParser();
      
      // --- Считаем вакансии ---
      const vacanciesXml = parser.parseFromString(vacanciesStr, 'application/xml');
      const vacancies = vacanciesXml.querySelectorAll('vacancy');
      const totalVacancies = vacancies.length;

      // --- Считаем уникальные сферы и компании ---
      const spheres = new Set();
      const companies = new Set();

      vacancies.forEach(v => {
        const sphere = v.querySelector('sphere')?.textContent.trim();
        const company = v.querySelector('company')?.textContent.trim();
        if (sphere) spheres.add(sphere);
        if (company) companies.add(company);
      });

      // --- Считаем мероприятия ---
      const eventsXml = parser.parseFromString(eventsStr, 'application/xml');
      const events = eventsXml.querySelectorAll('event');
      const totalEvents = events.length;

      // --- Подставляем реальные цифры в data-target ---
      statsNumbers[0].setAttribute('data-target', totalVacancies);
      statsNumbers[1].setAttribute('data-target', spheres.size);
      statsNumbers[2].setAttribute('data-target', companies.size);
      statsNumbers[3].setAttribute('data-target', totalEvents);

      // Запускаем анимацию
      initCounters();
    })
    .catch(err => {
      console.error('Ошибка загрузки статистики:', err);
      // Если ошибка, оставляем цифры, которые были в HTML
      initCounters();
    });
  } else {
    // Если счетчиков нет на странице, просто запускаем анимацию для того, что есть
    initCounters();
  }

  // ===== 2. АНИМАЦИЯ СЧЁТЧИКОВ =====
  function initCounters() {
    const counters = document.querySelectorAll('.stats__number');
    
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      const duration = 1500;
      const start = 0;
      const startTime = performance.now();

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(start + (target - start) * ease);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target;
        }
      };

      requestAnimationFrame(update);
    };

    if (counters.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(counter => observer.observe(counter));
    }
  }

  // ===== 3. ЗАГРУЗКА СВЕЖИХ ВАКАНСИЙ НА ГЛАВНУЮ =====
  const container = document.getElementById('latestVacancies');

  if (container) {
    fetch('../data/vacancies.xml')
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки');
        return response.text();
      })
      .then(str => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(str, 'application/xml');
        const vacancies = xml.querySelectorAll('vacancy');
        const latest = Array.from(vacancies).slice(0, 3);

        if (latest.length === 0) {
          container.innerHTML = '<p class="vacancies-preview__loading">Вакансий пока нет</p>';
          return;
        }

        container.innerHTML = latest.map(v => {
          const id = v.querySelector('id')?.textContent || '';
          const title = v.querySelector('title')?.textContent || '';
          const company = v.querySelector('company')?.textContent || '';
          const district = v.querySelector('district')?.textContent || '';
          const salaryMin = v.querySelector('salaryMin')?.textContent || '';
          const salaryMax = v.querySelector('salaryMax')?.textContent || '';
          const type = v.querySelector('type')?.textContent || '';
          const tags = (v.querySelector('tags')?.textContent || '').split(',').filter(Boolean);
          const tagsHTML = tags.map(tag => `<span class="vacancy-card__tag">${tag.trim()}</span>`).join('');

          return `
            <article class="vacancy-card">
              <div class="vacancy-card__header">
                <h3 class="vacancy-card__title">${title}</h3>
                <div class="vacancy-card__tags">${tagsHTML}</div>
              </div>
              <p class="vacancy-card__company">${company}</p>
              <div class="vacancy-card__meta">
                <span>📍 ${district}</span>
                <span>💼 ${type}</span>
              </div>
              <p class="vacancy-card__salary">${salaryMin} – ${salaryMax} BYN</p>
              <a href="vacancies.html?id=${id}" class="btn btn--secondary vacancy-card__btn">Подробнее</a>
            </article>
          `;
        }).join('');
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = '<p class="vacancies-preview__loading">Не удалось загрузить вакансии</p>';
      });
  }

  // ===== 4. МОБИЛЬНОЕ МЕНЮ (БУРГЕР) =====
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('nav--open');
      burger.classList.toggle('burger--active');
    });

    nav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav--open');
        burger.classList.remove('burger--active');
      });
    });

    document.addEventListener('click', (e) => {
      const isClickInsideNav = nav.contains(e.target);
      const isClickOnBurger = burger.contains(e.target);
      
      if (!isClickInsideNav && !isClickOnBurger && nav.classList.contains('nav--open')) {
        nav.classList.remove('nav--open');
        burger.classList.remove('burger--active');
      }
    });
  }

  // ===== 5. ИНТЕРАКТИВНЫЙ КАРЬЕРНЫЙ МАРШРУТ =====
  const steps = document.querySelectorAll('.career-step');
  const tooltip = document.getElementById('careerTooltip');
  const tooltipText = tooltip?.querySelector('.career-path__tooltip-text');

  if (steps.length > 0 && tooltip && tooltipText) {
    steps.forEach(step => {
      step.addEventListener('click', () => {
        steps.forEach(s => s.classList.remove('career-step--active'));
        step.classList.add('career-step--active');
        const text = step.getAttribute('data-text');
        tooltipText.textContent = text;
        tooltip.classList.add('career-path__tooltip--visible');
      });
    });
  }

});