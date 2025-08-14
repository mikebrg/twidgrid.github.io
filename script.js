(function () {
  const grid = document.getElementById('websiteGrid');
  const searchInput = document.getElementById('search');
  const categoryFilter = document.getElementById('categoryFilter');
  const darkModeBtn = document.getElementById('darkModeBtn');
  const body = document.body;
  const titleIcon = document.getElementById('titleIcon');
  const favicon = document.getElementById('favicon');
  const menuTitle = document.querySelector('#menuBar h1');

  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  let currentSites = [];
  let currentCategory = '';
  const categories = Object.keys(window.categorySites || {}).sort();
  let homepage = true;

  // Map categories to folders
  const categoryFolderMap = {
    'Websites': 'websites',
    'Movies': 'movies',
    'Music': 'music'
    // add more as needed
  };

  // Populate dropdown
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  // ---------- Dark mode ----------
  function updateIcons(isDark) {
    titleIcon.src = isDark
      ? 'https://img.icons8.com/ios-filled/24/ffffff/grid.png'
      : 'https://img.icons8.com/ios-filled/24/000000/grid.png';

    favicon.href = isDark
      ? 'https://img.icons8.com/ios-filled/24/ffffff/grid.png'
      : 'https://img.icons8.com/ios-filled/24/000000/grid.png';
  }

  function updateDarkModeUI(isDark) {
    if (isDark) body.classList.add('dark');
    else body.classList.remove('dark');
    darkModeBtn.textContent = isDark ? '☀' : '☾';
    updateIcons(isDark);
  }

  const darkPref = localStorage.getItem('darkMode') === 'true';
  updateDarkModeUI(darkPref);

  darkModeBtn.addEventListener('click', () => {
    const isDark = !body.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeUI(isDark);
  });

  // ---------- Homepage (categories only) ----------
  function renderHomepage(filter = '') {
    homepage = true;
    currentSites = [];
    grid.innerHTML = '';
    categoryFilter.value = '';

    const f = filter.toLowerCase();

    const visibleCategories = categories.filter(cat =>
      cat.toLowerCase().includes(f)
    );

    function sectionHeader(text) {
      const h = document.createElement('h2');
      h.textContent = text;
      h.style.margin = '10px 0';
      h.style.gridColumn = '1 / -1';
      grid.appendChild(h);
    }

    function renderCategoryCards(list) {
      list.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'card category-card';

        // Determine folder for this category
        const folder = categoryFolderMap[cat] || 'websites';

        const img = document.createElement('img');
        img.src = `images/${folder}/${cat}.png`;
        img.alt = cat;
        img.className = 'category-icon';
        img.onerror = () => { img.style.display = 'none'; };

        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = cat;

        // Small star if category has favorites
        const hasFav = (window.categorySites[cat] || []).some(site => favorites.includes(site.url));
        if (hasFav) {
          const star = document.createElement('span');
          star.className = 'star favorited';
          star.innerHTML = '★';
          star.style.marginLeft = '6px';
          title.appendChild(star);
        }

        card.appendChild(img);
        card.appendChild(title);

        card.addEventListener('click', () => {
          loadCategory(cat);
          categoryFilter.value = cat;
        });

        grid.appendChild(card);
      });
    }

    sectionHeader('Categories');
    renderCategoryCards(visibleCategories);
  }

  // ---------- Category view ----------
  function loadCategory(cat) {
    homepage = false;
    currentCategory = cat;
    currentSites = window.categorySites[cat] || [];
    renderList();
  }

  function renderList() {
    grid.innerHTML = '';
    const filterText = searchInput.value.toLowerCase();
    const folder = categoryFolderMap[currentCategory] || 'websites';

    const sortedSites = currentSites
      .filter(site => site.name.toLowerCase().includes(filterText))
      .sort((a, b) => {
        const aFav = favorites.includes(a.url) ? 0 : 1;
        const bFav = favorites.includes(b.url) ? 0 : 1;
        return aFav - bFav || a.name.localeCompare(b.name);
      });

    sortedSites.forEach(site => {
      const card = document.createElement('div');
      card.className = 'card';

      // Poster image if available
      if (site.image) {
        const poster = document.createElement('img');
        poster.className = 'poster';
        poster.src = site.image;
        poster.alt = site.name;
        poster.onerror = () => { poster.style.display = 'none'; };
        card.appendChild(poster);
      }

      const header = document.createElement('div');
      header.className = 'card-header';

      // Use local favicon if no poster
      if (!site.image) {
        const faviconImg = document.createElement('img');
        faviconImg.className = 'favicon';
        faviconImg.src = `images/${folder}/${site.name}.png`; // <-- local favicon
        faviconImg.onerror = () => { faviconImg.style.display = 'none'; };
        header.appendChild(faviconImg);
      }

      const link = document.createElement('a');
      link.href = site.url;
      link.target = '_blank';
      link.textContent = site.name;

      const star = document.createElement('span');
      star.className = 'star' + (favorites.includes(site.url) ? ' favorited' : '');
      star.innerHTML = '&#9733;';
      star.addEventListener('click', () => {
        const idx = favorites.indexOf(site.url);
        if (idx >= 0) favorites.splice(idx, 1);
        else favorites.push(site.url);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        if (homepage) renderHomepage(searchInput.value);
        else renderList();
      });

      header.appendChild(link);
      header.appendChild(star);
      card.appendChild(header);
      grid.appendChild(card);
    });
  }

  // ---------- Search ----------
  searchInput.addEventListener('input', () => {
    if (homepage) renderHomepage(searchInput.value);
    else renderList();
  });

  // ---------- Dropdown ----------
  categoryFilter.addEventListener('change', () => {
    const selected = categoryFilter.value;
    if (selected) loadCategory(selected);
    else renderHomepage(searchInput.value);
  });

  // ---------- Title & icon go home ----------
  function goHome() {
    searchInput.value = '';
    renderHomepage('');
  }
  if (titleIcon) {
    titleIcon.style.cursor = 'pointer';
    titleIcon.addEventListener('click', goHome);
  }
  if (menuTitle) {
    menuTitle.style.cursor = 'pointer';
    menuTitle.addEventListener('click', goHome);
  }

  // ---------- Init ----------
  renderHomepage('');
})();

// Auto-update footer year
const footerYear = document.getElementById('footerYear');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}