document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('vacanciesGrid');
  const countEl = document.getElementById('vacanciesCount');
  const searchInput = document.getElementById('searchInput');
  const districtFilter = document.getElementById('districtFilter');
  const typeFilter = document.getElementById('typeFilter');
  const experienceFilter = document.getElementById('experienceFilter');
  const resetBtn = document.getElementById('resetFilters');

  if (!grid) return;

  let allVacancies = [];

  fetch('../data/vacancies.xml')
    .then(res => res.text())
    .then(str => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(str, 'application/xml');
      const nodes = xml.querySelectorAll('vacancy');

      allVacancies = Array.from(nodes).map(v => ({
        id: v.querySelector('id')?.textContent || '',
        title: v.querySelector('title')?.textContent || '',
        company: v.querySelector('company')?.textContent || '',
        district: v.querySelector('district')?.textContent || '',
        sphere: v.querySelector('sphere')?.textContent || '',
        type: v.querySelector('type')?.textContent || '',
        salaryMin: v.querySelector('salaryMin')?.textContent || '',
        salaryMax: v.querySelector('salaryMax')?.textContent || '',
        experience: v.querySelector('experience')?.textContent || '',
        date: v.querySelector('date')?.textContent || '',
        views: v.querySelector('views')?.textContent || '0',
        description: v.querySelector('description')?.textContent || '',
        tags: (v.querySelector('tags')?.textContent || '').split(',').filter(Boolean)
      }));

      render(allVacancies);
      handleUrlParams();
    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = '<p>Не удалось загрузить вакансии</p>';
    });

  function render(list) {
    if (countEl) countEl.textContent = `Найдено вакансий: ${list.length}`;

    if (list.length === 0) {
      grid.innerHTML = '<p class="vacancies-preview__loading">По вашему запросу ничего не найдено</p>';
      return;
    }

    grid.innerHTML = list.map(v => {
      const tagsHTML = v.tags.map(tag => `<span class="vacancy-card__tag">${tag.trim()}</span>`).join('');
      
      let dateHTML = '';
      if (v.date) {
        const dateObj = new Date(v.date);
        dateHTML = `<span>📅 ${dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>`;
      }

      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isFav = favorites.includes(v.id);
      const heartIcon = isFav ? '❤️' : '🤍';

      const applications = JSON.parse(localStorage.getItem('applications') || '[]');
      const hasApplied = applications.some(app => app.id === v.id);
      const applyBtnText = hasApplied ? 'Отклик отправлен ✓' : 'Откликнуться';
      const applyBtnClass = hasApplied ? 'btn--secondary' : 'btn--primary';

      return `
        <article class="vacancy-card" data-id="${v.id}">
          <div class="vacancy-card__header">
            <h3 class="vacancy-card__title">${v.title}</h3>
            <div class="vacancy-card__tags">${tagsHTML}</div>
          </div>
          
          <p class="vacancy-card__company">${v.company}</p>
          
          <div class="vacancy-card__meta">
            <span>📍 ${v.district}</span>
            <span>💼 ${v.type}</span>
            <span>📅 ${v.experience}</span>
          </div>
          
          <p class="vacancy-card__salary">${v.salaryMin} – ${v.salaryMax} BYN</p>
          <p class="vacancy-card__desc">${v.description}</p>
          
          <div class="vacancy-card__footer">
            <div class="vacancy-card__info">
              ${dateHTML}
              <span class="vacancy-card__views">👁 ${v.views}</span>
            </div>
            <button class="vacancy-card__fav-btn" data-id="${v.id}" title="В избранное">${heartIcon}</button>
          </div>
          
          <div class="vacancy-card__actions">
            <button class="btn ${applyBtnClass} vacancy-card__apply" data-id="${v.id}" data-title="${v.title}">${applyBtnText}</button>
          </div>
        </article>
      `;
    }).join('');

    attachCardEvents();
  }

  function attachCardEvents() {
    // Лайки
    document.querySelectorAll('.vacancy-card__fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (favorites.includes(id)) {
          favorites = favorites.filter(favId => favId !== id);
          btn.textContent = '🤍';
        } else {
          favorites.push(id);
          btn.textContent = '❤️';
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
      });
    });

    // Отклики
    document.querySelectorAll('.vacancy-card__apply').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        
        let applications = JSON.parse(localStorage.getItem('applications') || '[]');
        if (!applications.some(app => app.id === id)) {
          applications.push({ id, title, date: new Date().toISOString() });
          localStorage.setItem('applications', JSON.stringify(applications));
          
          btn.textContent = 'Отклик отправлен ✓';
          btn.className = 'btn btn--secondary vacancy-card__apply';
          
          const viewsSpan = btn.closest('.vacancy-card').querySelector('.vacancy-card__views');
          if (viewsSpan) {
            const currentViews = parseInt(viewsSpan.textContent.replace(/\D/g, '')) || 0;
            viewsSpan.textContent = `👁 ${currentViews + 1}`;
          }
          
          alert(`Вы успешно откликнулись на вакансию "${title}"! Следите за статусом в личном кабинете.`);
        } else {
          alert('Вы уже откликались на эту вакансию.');
        }
      });
    });
  }

  function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id');
    const sphereParam = urlParams.get('sphere');

    if (targetId) {
      setTimeout(() => {
        const card = document.querySelector(`.vacancy-card[data-id="${targetId}"]`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.boxShadow = '0 0 0 3px #00C9A7';
          setTimeout(() => { card.style.boxShadow = ''; }, 2500);
        }
      }, 300);
    }

    if (sphereParam) {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = sphereParam;
        applyFilters();
      }
    }
  }

  function applyFilters() {
    const search = (searchInput?.value || '').toLowerCase().trim();
    const district = districtFilter?.value || '';
    const type = typeFilter?.value || '';
    const experience = experienceFilter?.value || '';

    const filtered = allVacancies.filter(v => {
      const matchSearch = !search || v.title.toLowerCase().includes(search) || v.company.toLowerCase().includes(search) || v.sphere.toLowerCase().includes(search);
      const matchDistrict = !district || v.district === district;
      const matchType = !type || v.type === type;
      const matchExp = !experience || v.experience === experience;
      return matchSearch && matchDistrict && matchType && matchExp;
    });

    render(filtered);
  }

  searchInput?.addEventListener('input', applyFilters);
  districtFilter?.addEventListener('change', applyFilters);
  typeFilter?.addEventListener('change', applyFilters);
  experienceFilter?.addEventListener('change', applyFilters);

  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (districtFilter) districtFilter.value = '';
    if (typeFilter) typeFilter.value = '';
    if (experienceFilter) experienceFilter.value = '';
    render(allVacancies);
  });
});