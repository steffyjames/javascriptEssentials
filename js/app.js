(function () {
  'use strict';

  // ===== Navigation =====
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navbar && !navbar.classList.contains('scrolled')) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // ===== Contact Form =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const success = document.getElementById('formSuccess');
      if (success) {
        success.classList.remove('hidden');
        contactForm.reset();
        setTimeout(() => success.classList.add('hidden'), 5000);
      }
    });
  }

  // ===== Search & Destinations (Homepage only) =====
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchSuggestions = document.getElementById('searchSuggestions');
  const destinationsGrid = document.getElementById('destinationsGrid');
  const noResults = document.getElementById('noResults');
  const resultsSummary = document.getElementById('resultsSummary');
  const bookingModal = document.getElementById('bookingModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalBody = document.getElementById('modalBody');

  if (!destinationsGrid || typeof destinations === 'undefined') return;

  let currentQuery = '';
  let highlightedIndex = -1;
  let suggestionResults = [];

  function searchDestinations(query) {
    const term = query.trim().toLowerCase();
    if (!term) return destinations;

    return destinations.filter((dest) => {
      const searchable = [
        dest.name,
        dest.country,
        dest.region,
        dest.description,
        ...dest.keywords,
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(term) || term.split(' ').every((word) => searchable.includes(word));
    });
  }

  function renderDestinations(results) {
    destinationsGrid.innerHTML = '';

    if (results.length === 0) {
      destinationsGrid.classList.add('hidden');
      noResults.classList.remove('hidden');
      resultsSummary.textContent = `No results for "${currentQuery}"`;
      return;
    }

    destinationsGrid.classList.remove('hidden');
    noResults.classList.add('hidden');

    if (currentQuery) {
      resultsSummary.textContent = `Found ${results.length} destination${results.length !== 1 ? 's' : ''} matching "${currentQuery}"`;
    } else {
      resultsSummary.textContent = 'Showing all destinations — start typing to find your perfect match.';
    }

    results.forEach((dest, index) => {
      const card = document.createElement('article');
      card.className = 'destination-card';
      card.style.animationDelay = `${index * 0.08}s`;

      const visibleKeywords = dest.keywords.slice(0, 3);

      card.innerHTML = `
        <div class="card-image">
          <img src="${dest.image}" alt="${dest.name}, ${dest.country}" loading="lazy" />
          <span class="card-rating">★ ${dest.rating}</span>
        </div>
        <div class="card-body">
          <div class="card-location">${dest.country} · ${dest.region}</div>
          <h3>${dest.name}</h3>
          <p>${dest.description}</p>
          <div class="card-keywords">
            ${visibleKeywords.map((kw) => `<span class="keyword-tag">${kw}</span>`).join('')}
          </div>
          <div class="card-footer">
            <div class="card-price">$${dest.price.toLocaleString()} <span>/ person</span></div>
            <button class="card-book-btn" data-id="${dest.id}">Book Now</button>
          </div>
        </div>
      `;

      card.querySelector('.card-book-btn').addEventListener('click', () => openBookingModal(dest));
      destinationsGrid.appendChild(card);
    });
  }

  function renderSuggestions(results) {
    if (!searchSuggestions) return;

    suggestionResults = results.slice(0, 5);
    highlightedIndex = -1;

    if (suggestionResults.length === 0 || !searchInput.value.trim()) {
      searchSuggestions.classList.remove('active');
      searchSuggestions.innerHTML = '';
      return;
    }

    searchSuggestions.innerHTML = suggestionResults
      .map(
        (dest, i) => `
        <div class="suggestion-item" data-index="${i}" data-id="${dest.id}">
          <img class="suggestion-thumb" src="${dest.image}" alt="" />
          <div class="suggestion-info">
            <strong>${dest.name}</strong>
            <span>${dest.country} · ${dest.region}</span>
          </div>
        </div>
      `
      )
      .join('');

    searchSuggestions.classList.add('active');

    searchSuggestions.querySelectorAll('.suggestion-item').forEach((item) => {
      item.addEventListener('click', () => {
        const dest = suggestionResults[parseInt(item.dataset.index, 10)];
        selectSuggestion(dest);
      });
    });
  }

  function selectSuggestion(dest) {
    searchInput.value = dest.name;
    currentQuery = dest.name;
    searchSuggestions.classList.remove('active');
    const results = searchDestinations(dest.name);
    renderDestinations(results);
    document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' });
  }

  function performSearch() {
    currentQuery = searchInput.value;
    const results = searchDestinations(currentQuery);
    renderDestinations(results);
    searchSuggestions.classList.remove('active');

    if (currentQuery.trim()) {
      document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' });
    }
  }

  function openBookingModal(dest) {
    if (!bookingModal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="modal-destination">
        <h2>${dest.name}</h2>
        <div class="modal-location">${dest.country} · ${dest.region}</div>
        <p>${dest.description}</p>
        <div class="modal-price">$${dest.price.toLocaleString()} <span>per person</span></div>
        <button class="btn btn-primary btn-full" id="confirmBooking">Confirm Booking</button>
      </div>
    `;

    bookingModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    document.getElementById('confirmBooking').addEventListener('click', () => {
      modalBody.innerHTML = `
        <div style="text-align:center; padding: 1rem 0;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">✈️</div>
          <h2 style="font-family: var(--font-display); margin-bottom: 0.5rem;">Booking Confirmed!</h2>
          <p style="color: var(--color-text-light);">Your adventure to <strong>${dest.name}</strong> awaits. Check your email for details.</p>
        </div>
      `;
      setTimeout(closeModal, 3000);
    });
  }

  function closeModal() {
    if (!bookingModal) return;
    bookingModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Event listeners
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const results = searchDestinations(searchInput.value);
      renderSuggestions(results);
      if (!searchInput.value.trim()) {
        currentQuery = '';
        renderDestinations(destinations);
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      const items = searchSuggestions.querySelectorAll('.suggestion-item');

      if (e.key === 'ArrowDown' && items.length) {
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
        updateHighlight(items);
      } else if (e.key === 'ArrowUp' && items.length) {
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, 0);
        updateHighlight(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestionResults[highlightedIndex]) {
          selectSuggestion(suggestionResults[highlightedIndex]);
        } else {
          performSearch();
        }
      } else if (e.key === 'Escape') {
        searchSuggestions.classList.remove('active');
      }
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim()) {
        renderSuggestions(searchDestinations(searchInput.value));
      }
    });
  }

  function updateHighlight(items) {
    items.forEach((item, i) => {
      item.classList.toggle('highlighted', i === highlightedIndex);
    });
  }

  document.addEventListener('click', (e) => {
    if (searchSuggestions && !e.target.closest('.search-container')) {
      searchSuggestions.classList.remove('active');
    }
  });

  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  const bookNowBtn = document.getElementById('bookNowBtn');
  if (bookNowBtn) {
    bookNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Initial render
  renderDestinations(destinations);
})();
