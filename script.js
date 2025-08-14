(function() {
  const grid = document.getElementById('websiteGrid');
  const searchInput = document.getElementById('search');
  const categoryFilter = document.getElementById('categoryFilter');
  const darkModeBtn = document.getElementById('darkModeBtn');
  const body = document.body;
  const titleIcon = document.getElementById('titleIcon');
  const favicon = document.getElementById('favicon');

  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  let currentSites = [];
  const categories = Object.keys(window.categorySites || {}).sort();
  let homepage = true;

  // Populate category dropdown
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  /* ------------------------
     Render list of sites
  ------------------------ */
  function renderList() {
    homepage = false;
    const filterText = searchInput.value.toLowerCase();
    grid.innerHTML = '';

    // Back to homepage card
    const backCard = document.createElement('div');
    backCard.className = 'card';
    const backHeader = document.createElement('div');
    backHeader.className = 'card-header';
    const backLink = document.createElement('a');
    backLink.href = '#';
    backLink.textContent = '← Back to Categories';
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      categoryFilter.value = "";
      searchInput.value = "";
      renderCategories();
    });
    backHeader.appendChild(backLink);
    backCard.appendChild(backHeader);
    grid.appendChild(backCard);

    const sortedSites = currentSites
      .filter(site => site.name.toLowerCase().includes(filterText))
      .sort((a, b) => {
        const aFav = favorites.includes(a.url) ? 0 : 1;
        const bFav = favorites.includes(b.url) ? 0 : 1;
        return aFav - bFav;
      });

    sortedSites.forEach(site => {
      const card = document.createElement('div');
      card.className = 'card';

      const header = document.createElement('div');
      header.className = 'card-header';

      const faviconImg = document.createElement('img');
      faviconImg.className = 'favicon';
      faviconImg.src = `https://${new URL(site.url).hostname}/favicon.ico`;
      faviconImg.onerror = () => faviconImg.style.display='none';

      const link = document.createElement('a');
      link.href = site.url;
      link.target = '_blank';
      link.textContent = site.name;

      const star = document.createElement('span');
      star.className = 'star' + (favorites.includes(site.url) ? ' favorited' : '');
      star.innerHTML = '&#9733;';
      star.addEventListener('click', () => {
        if(favorites.includes(site.url)) favorites.splice(favorites.indexOf(site.url), 1);
        else favorites.push(site.url);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderList();
      });

      header.appendChild(faviconImg);
      header.appendChild(link);
      header.appendChild(star);
      card.appendChild(header);
      grid.appendChild(card);
    });
  }

/* ------------------------
     Render list of movies
  ------------------------ */
function renderMovies(sites) {
  grid.innerHTML = "";
  sites.forEach(movie => {
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(movie.imdb)}`)
      .then(res => res.json())
      .then(data => {
        const html = data.contents;
        const match = html.match(/<meta property="og:image" content="([^"]+)"/);
        const poster = match ? match[1] : "default-poster.jpg";

        const card = document.createElement("div");
        card.className = "card movie-card";

        const img = document.createElement("img");
        img.src = poster;
        img.alt = movie.name;

        const link = document.createElement("a");
        link.href = movie.imdb;
        link.target = "_blank";
        link.textContent = movie.name;

        card.appendChild(img);
        card.appendChild(link);
        grid.appendChild(card);
      });
  });
}





  /* ------------------------
     Render homepage categories with images and favorites card
  ------------------------ */
  function renderCategories() {
    homepage = true;
    grid.innerHTML = '';

    // Favorites card at top if there are favorites
    if(favorites.length) {
      const favCard = document.createElement('div');
      favCard.className = 'card';
      const header = document.createElement('div');
      header.className = 'card-header';

      const starIcon = document.createElement('span');
      starIcon.textContent = '★';
      starIcon.style.color = '#f4c542';
      starIcon.style.fontSize = '1.5rem';
      starIcon.style.marginRight = '8px';

      const link = document.createElement('a');
      link.href = '#';
      link.textContent = 'Favorites';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        currentSites = [];
        categories.forEach(cat => {
          const sites = window.categorySites[cat] || [];
          sites.forEach(site => {
            if(favorites.includes(site.url)) currentSites.push(site);
          });
        });
        renderList();
      });

      header.appendChild(starIcon);
      header.appendChild(link);
      favCard.appendChild(header);
      grid.appendChild(favCard);
    }

    categories.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'card';

      const header = document.createElement('div');
      header.className = 'card-header';

      const icon = document.createElement('img');
      icon.src = `images/${cat}.png`;
      icon.alt = cat;
      icon.className = 'category-icon';
      icon.onerror = () => icon.style.display = 'none';

      const link = document.createElement('a');
      link.href = '#';
      link.textContent = cat;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        categoryFilter.value = cat;
        currentSites = window.categorySites[cat] || [];
        renderList();
      });

      header.appendChild(icon);
      header.appendChild(link);
      card.appendChild(header);
      grid.appendChild(card);
    });
  }

  /* ------------------------
     Search input event
  ------------------------ */
  searchInput.addEventListener('input', () => {
    if(homepage) {
      const filterText = searchInput.value.toLowerCase();
      grid.innerHTML = '';
      if(favorites.length && 'favorites'.includes(filterText)) {
        // show favorites card if matching search
        const favCard = document.createElement('div');
        favCard.className = 'card';
        const header = document.createElement('div');
        header.className = 'card-header';
        const starIcon = document.createElement('span');
        starIcon.textContent = '★';
        starIcon.style.color = '#f4c542';
        starIcon.style.fontSize = '1.5rem';
        starIcon.style.marginRight = '8px';
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = 'Favorites';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          currentSites = [];
          categories.forEach(cat => {
            const sites = window.categorySites[cat] || [];
            sites.forEach(site => {
              if(favorites.includes(site.url)) currentSites.push(site);
            });
          });
          renderList();
        });
        header.appendChild(starIcon);
        header.appendChild(link);
        favCard.appendChild(header);
        grid.appendChild(favCard);
      }

      categories
        .filter(cat => cat.toLowerCase().includes(filterText))
        .forEach(cat => {
          const card = document.createElement('div');
          card.className = 'card';
          const header = document.createElement('div');
          header.className = 'card-header';
          const icon = document.createElement('img');
          icon.src = `images/${cat}.png`;
          icon.alt = cat;
          icon.className = 'category-icon';
          icon.onerror = () => icon.style.display = 'none';
          const link = document.createElement('a');
          link.href = '#';
          link.textContent = cat;
          link.addEventListener('click', (e) => {
            e.preventDefault();
            categoryFilter.value = cat;
            currentSites = window.categorySites[cat] || [];
            renderList();
          });
          header.appendChild(icon);
          header.appendChild(link);
          card.appendChild(header);
          grid.appendChild(card);
        });
    } else {
      renderList();
    }
  });

  /* ------------------------
     Category filter event
  ------------------------ */
  categoryFilter.addEventListener('change', () => {
    const cat = categoryFilter.value;
    if(cat) {
      currentSites = window.categorySites[cat] || [];
      renderList();
    } 

if (categoryName === "Movies") {
    renderMovies(window.categorySites["Movies"]);
  }

else {
      renderCategories();
    }
  });

  /* ------------------------
     Dark mode toggle
  ------------------------ */
  function updateIcons(isDark) {
    titleIcon.src = isDark
      ? "https://img.icons8.com/ios-filled/24/ffffff/grid.png"
      : "https://img.icons8.com/ios-filled/24/000000/grid.png";

    favicon.href = isDark
      ? "https://img.icons8.com/ios-filled/24/ffffff/grid.png"
      : "https://img.icons8.com/ios-filled/24/000000/grid.png";
  }

  function updateDarkModeUI(isDark) {
    if(isDark) body.classList.add('dark');
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

  /* ------------------------
     Clickable title returns to homepage
  ------------------------ */
  const menuTitle = document.querySelector('#menuBar h1');
  menuTitle.addEventListener('click', () => {
    categoryFilter.value = "";
    searchInput.value = "";
    renderCategories();
  });

  /* ------------------------
     Initialize homepage
  ------------------------ */
  renderCategories();


})();
