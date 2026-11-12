import { getReviews, submitReview } from './reviews-api.js';
import './reviews.css';

const dango = `<svg viewBox="0 0 60 42" width="54" height="38" aria-hidden="true">
  <g stroke="var(--ink-brown)" stroke-width="1.5">
    <path d="M5 34 55 8" fill="none"/>
    <circle cx="17" cy="28" r="8" fill="#F2A3B8"/>
    <circle cx="30" cy="21" r="8" fill="#FBF8F0"/>
    <circle cx="43" cy="14" r="8" fill="#8DBF6B"/>
  </g></svg>`;
const stamp = `<span class="review-stamp">${dango}</span>`;
const star = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m12 2 3 6.4 7 .9-5 5 1.3 7-6.3-3.4-6.3 3.4 1.3-7-5-5 7-.9z"/></svg>';
const types = ['image/jpeg', 'image/png', 'image/webp'];
const validName = /^[\p{L}\p{N} _.]{2,20}$/u;
const formatDate = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' });
const cardTemplate = document.createElement('template');
cardTemplate.innerHTML = `
  <article class="review-card">
    <div class="review-picture"></div>
    <div class="review-back">
      <div class="review-mail"><span class="review-postmark">café mochi · <span lang="ja">もち</span><time></time></span>${stamp}</div>
      <p class="review-message"></p>
      <div class="review-byline"><span class="review-stars"></span><span class="review-signature"><span class="review-avatar" aria-hidden="true"></span><span class="review-author"></span></span><time></time></div>
      <small class="review-sample" hidden>sample postcard</small>
    </div>
  </article>`;

function stars(rating) {
  const display = document.createElement('span');
  const label = document.createElement('span');
  label.className = 'review-sr';
  label.textContent = `${rating} out of 5 stars`;
  display.append(label);
  for (let index = 1; index <= 5; index++) {
    const icon = document.createElement('span');
    icon.className = index <= Math.round(rating) ? 'is-filled' : '';
    icon.innerHTML = star;
    display.append(icon);
  }
  return display;
}

async function compress(file) {
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas unavailable');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const webp = canvas.toDataURL('image/webp', .8);
    return webp.startsWith('data:image/webp;base64,') ? webp : canvas.toDataURL('image/jpeg', .8);
  } finally {
    bitmap.close();
  }
}

export function mountReviews(section) {
  section.innerHTML = `
    <h2 id="reviews-title">reviews <span lang="ja">レビュー</span></h2>
    <p>leave us a postcard.<br><span lang="ja">ポストカードを送ってね</span></p>
    <p class="review-demo">sample postcards and local demo submissions. your postcard stays in this browser.</p>
    <div class="review-summary" aria-live="polite"></div>
    <button type="button" class="pill review-write">write a postcard</button>
    <div class="review-collage">
      <div class="review-grid"></div>
      <div class="review-decor" aria-hidden="true"><span>${dango}</span><span>${star}</span><span></span><span>${star}</span></div>
    </div>
    <button class="pill review-more" type="button" hidden>load more</button>
    <dialog class="review-dialog" aria-labelledby="write-title">
      <form class="review-form" novalidate>
        <div class="review-form-heading"><h3 id="write-title">write a postcard</h3>${stamp}</div>
        <div class="review-form-grid">
          <div class="review-upload">
            <div class="review-preview review-picture">${dango}</div>
            <label for="review-photo">add a photo (optional)</label>
            <input id="review-photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="review-photo-error">
            <p id="review-photo-error" class="review-error"></p>
            <button type="button" class="review-remove" hidden>remove photo</button>
          </div>
          <div class="review-fields">
            <div class="review-rating" role="radiogroup" aria-label="star rating" aria-required="true" aria-describedby="review-rating-error">
              ${[1,2,3,4,5].map(number => `<label><input type="radio" name="rating" value="${number}" aria-label="${number} out of 5 stars" aria-describedby="review-rating-error">${star}</label>`).join('')}
            </div>
            <p id="review-rating-error" class="review-error"></p>
            <label for="review-name">display name</label>
            <input id="review-name" name="name" placeholder="your name / お名前" maxlength="20" required aria-describedby="review-name-error">
            <p id="review-name-error" class="review-error"></p>
            <label for="review-message">message</label>
            <textarea id="review-message" name="message" rows="4" maxlength="300" required aria-describedby="review-counter review-message-error"></textarea>
            <small id="review-counter">0 / 300</small>
            <p id="review-message-error" class="review-error"></p>
            <div hidden><label>leave blank<input name="website" tabindex="-1" autocomplete="off"></label></div>
          </div>
        </div>
        <p class="review-submit-error review-error" role="alert"></p>
        <div class="review-actions"><button class="pill" type="submit">send postcard</button><button class="pill review-cancel" type="button">cancel</button></div>
      </form>
      <div class="review-thanks" hidden>${stamp}<p role="status">thank you · <span lang="ja">ありがとう</span></p><button class="pill review-done" type="button">close</button></div>
    </dialog>
    <dialog class="review-dialog review-lightbox" aria-label="full postcard">
      <div class="review-view-controls">
        <button class="pill review-prev" type="button" aria-label="previous postcard">←</button>
        <button class="pill review-next" type="button" aria-label="next postcard">→</button>
        <button class="pill review-lightbox-close" type="button" autofocus>close</button>
      </div>
      <div class="review-view" aria-live="polite"></div>
    </dialog>`;

  const find = selector => section.querySelector(selector);
  const dialog = find('.review-dialog');
  const lightbox = find('.review-lightbox');
  const form = find('.review-form');
  const grid = find('.review-grid');
  const summary = find('.review-summary');
  const preview = find('.review-preview');
  const photoInput = find('#review-photo');
  const removePhoto = find('.review-remove');
  const send = form.querySelector('[type=submit]');
  const ratingGroup = find('.review-rating');
  const name = find('#review-name');
  const message = find('#review-message');
  let reviews = [];
  let pageSize = 18;
  let activeIndex = 0;
  let opener;
  let newTile;
  const entered = new Set();
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  let photo = null;
  let photoVersion = 0;
  let preparing = false;
  let sending = false;
  let disposed = false;
  const enter = motion.matches && 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        let stagger = 0;
        for (const { target, isIntersecting } of entries) {
          if (!isIntersecting) continue;
          target.style.setProperty('--review-delay', Math.min(stagger++ * 40, 600) + 'ms');
          target.classList.add('review-entered');
          entered.add(target.dataset.id);
          enter.unobserve(target);
        }
      })
    : null;

  function error(field, text = '') {
    find(`#review-${field}-error`).textContent = text;
    const inputs = field === 'rating' ? ratingGroup.querySelectorAll('input') : [find(`#review-${field}`)];
    for (const input of inputs) {
      if (text) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }

  const shortDate = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const pixelDango = '<svg viewBox="0 0 24 24" width="34" height="34" shape-rendering="crispEdges" aria-hidden="true"><path d="M3 19h3v-3h3v-3h3v-3h3V7h3V4h3v3h-3v3h-3v3h-3v3H9v3H6v3H3z" fill="var(--ink-brown)"/><path d="M4 13h6v6H4z" fill="#F2A3B8"/><path d="M9 8h6v6H9z" fill="#FBF8F0"/><path d="M14 3h6v6h-6z" fill="#8DBF6B"/></svg>';

  function photoImage(review, width, height) {
    const image = document.createElement('img');
    image.src = review.photo;
    image.alt = 'photo shared by ' + review.name;
    image.width = width;
    image.height = height;
    image.loading = 'lazy';
    image.decoding = 'async';
    return image;
  }

  function showPostcard(index) {
    activeIndex = index;
    const review = reviews[index];
    const card = cardTemplate.content.firstElementChild.cloneNode(true);
    const message = card.querySelector('.review-message');
    message.textContent = review.message;
    message.tabIndex = 0;
    message.setAttribute('aria-label', 'postcard message');
    card.querySelector('.review-avatar').textContent = Array.from(review.name)[0]?.toUpperCase() ?? '';
    card.querySelector('.review-author').textContent = 'from ' + review.name;
    card.querySelector('.review-stars').append(stars(review.rating));
    card.querySelector('.review-sample').hidden = !review.sample;
    for (const time of card.querySelectorAll('time')) {
      time.dateTime = review.date;
      time.textContent = formatDate.format(new Date(review.date));
    }
    const picture = card.querySelector('.review-picture');
    if (review.photo) {
      picture.classList.add('is-taped');
      picture.append(photoImage(review, 600, 450));
    } else picture.innerHTML = dango;
    find('.review-view').replaceChildren(card);
    const previous = find('.review-prev');
    const next = find('.review-next');
    const last = Math.min(pageSize, reviews.length) - 1;
    if ((index === 0 && document.activeElement === previous) ||
        (index === last && document.activeElement === next)) find('.review-lightbox-close').focus();
    previous.disabled = index === 0;
    next.disabled = index === last;
  }

  function makeTile(review, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'review-tile';
    button.dataset.id = review.id;
    button.setAttribute('aria-label', 'open postcard from ' + review.name + ', ' + review.rating + ' out of 5 stars' +
      (review.sample ? ', sample postcard' : ''));
    const seed = [...review.id].reduce((hash, char) => Math.imul(hash ^ char.codePointAt(0), 16777619), 2166136261) >>> 0;
    button.style.setProperty('--tile-rotation', (seed % 1001) / 100 - 5 + 'deg');
    button.style.setProperty('--tile-offset', (seed >>> 9) % 13 - 6 + 'px');
    button.style.setProperty('--tile-scale', .94 + ((seed >>> 17) % 9) / 100);
    button.style.setProperty('--tile-layer', 1 + ((seed >>> 24) % 5));
    button.innerHTML = '<span class="review-thumb"><span class="review-badge" aria-hidden="true">' + review.rating + ' ' + star + '</span></span>' +
      '<span class="review-tile-name"><span class="review-avatar" aria-hidden="true"></span><span class="review-tile-user"></span></span>' +
      '<span class="review-stars" aria-hidden="true"></span><time></time><small class="review-sample" hidden>sample</small>';
    const thumb = button.querySelector('.review-thumb');
    if (review.photo) thumb.prepend(photoImage(review, 120, 120));
    else thumb.insertAdjacentHTML('afterbegin', pixelDango);
    if (seed % 3 === 0) thumb.classList.add('is-taped');
    button.querySelector('.review-avatar').textContent = Array.from(review.name)[0]?.toUpperCase() ?? '';
    button.querySelector('.review-tile-user').textContent = review.name;
    button.querySelector('.review-stars').append(stars(review.rating));
    button.querySelector('.review-sample').hidden = !review.sample;
    const date = button.querySelector('time');
    date.dateTime = review.date;
    date.textContent = shortDate.format(new Date(review.date)).toLowerCase();
    button.addEventListener('click', () => {
      opener = button;
      button.classList.add('is-open');
      showPostcard(index);
      lightbox.showModal();
    });
    if (!entered.has(review.id)) enter?.observe(button);
    return button;
  }

  function render() {
    const mean = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;
    const aggregate = stars(mean.toFixed(1));
    aggregate.className = 'review-stars';
    summary.replaceChildren(mean.toFixed(1) + ' ', aggregate, ' ' + reviews.length + ' postcards');
    find('.review-more').hidden = reviews.length <= pageSize;
    enter?.disconnect();
    grid.replaceChildren(...reviews.slice(0, pageSize).map((review, index) => makeTile(review, index)));
  }

  function setPreview(value) {
    photo = value;
    preview.classList.toggle('is-taped', Boolean(value));
    removePhoto.hidden = !value;
    if (!value) {
      preview.innerHTML = dango;
      return;
    }
    const image = document.createElement('img');
    image.src = value;
    image.width = 400;
    image.height = 300;
    image.alt = 'preview of your postcard photo';
    preview.replaceChildren(image);
  }

  photoInput.addEventListener('change', async () => {
    const version = ++photoVersion;
    const file = photoInput.files[0];
    preparing = false;
    send.disabled = sending;
    error('photo');
    setPreview(null);
    if (!file) return;
    if (!types.includes(file.type) || file.size > 5 * 1024 * 1024) {
      error('photo', 'choose one jpeg, png, or webp photo under 5 mb.');
      photoInput.value = '';
      return;
    }
    preparing = true;
    send.disabled = true;
    try {
      const result = await compress(file);
      if (version === photoVersion) setPreview(result);
    } catch {
      if (version === photoVersion) {
        error('photo', 'we couldn’t open that photo. choose another or remove it.');
        photoInput.value = '';
      }
    } finally {
      if (version === photoVersion) {
        preparing = false;
        send.disabled = sending;
      }
    }
  });
  removePhoto.addEventListener('click', () => {
    photoInput.value = '';
    setPreview(null);
    error('photo');
    photoInput.focus();
  });
  message.addEventListener('input', () => {
    find('#review-counter').textContent = `${message.value.length} / 300`;
    error('message');
  });
  name.addEventListener('input', () => error('name'));
  ratingGroup.addEventListener('change', () => error('rating'));

  find('.review-write').addEventListener('click', () => {
    form.hidden = false;
    find('.review-thanks').hidden = true;
    dialog.showModal();
  });
  find('.review-cancel').addEventListener('click', () => dialog.close());
  find('.review-done').addEventListener('click', () => dialog.close());
  find('.review-lightbox-close').addEventListener('click', () => lightbox.close());
  function step(direction) {
    const next = activeIndex + direction;
    if (next >= 0 && next < Math.min(reviews.length, pageSize)) showPostcard(next);
  }
  find('.review-prev').addEventListener('click', () => step(-1));
  find('.review-next').addEventListener('click', () => step(1));
  lightbox.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  });
  lightbox.addEventListener('click', event => {
    if (event.target !== lightbox) return;
    const bounds = lightbox.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) lightbox.close();
  });
  lightbox.addEventListener('close', () => {
    opener?.classList.remove('is-open');
    opener?.focus();
    find('.review-view').replaceChildren();
  });
  find('.review-more').addEventListener('click', () => {
    const firstNew = pageSize;
    pageSize += 18;
    render();
    grid.children[firstNew]?.focus();
  });
  dialog.addEventListener('close', () => {
    ++photoVersion;
    preparing = false;
    send.disabled = sending;
    form.reset();
    setPreview(null);
    for (const field of ['name', 'rating', 'message', 'photo']) error(field);
    find('#review-counter').textContent = '0 / 300';
    find('.review-submit-error').textContent = '';
    if (newTile) {
      newTile.scrollIntoView({ block: 'nearest' });
      newTile.classList.add('review-new');
      newTile = null;
    }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || preparing) return;
    const data = new FormData(form);
    const rating = Number(data.get('rating'));
    const displayName = name.value.trim();
    const text = message.value.trim();
    const nameError = validName.test(displayName) ? '' : 'use 2–20 letters, numbers, spaces, underscores, or dots.';
    const messageError = text.length >= 10 && text.length <= 300 ? '' : 'write a message of 10–300 characters.';
    error('rating', rating ? '' : 'choose a star rating.');
    error('name', nameError);
    error('message', messageError);
    const invalid = form.querySelector('[aria-invalid=true]');
    if (invalid) { invalid.focus(); return; }
    if (data.get('website')) return;
    sending = true;
    send.disabled = true;
    find('.review-submit-error').textContent = '';
    try {
      const saved = await submitReview({ name: displayName, rating, message: text, photo });
      reviews.unshift(saved);
      render();
      newTile = grid.firstElementChild;
      if (newTile) {
        enter?.unobserve(newTile);
        entered.add(saved.id);
      }
      form.hidden = true;
      find('.review-thanks').hidden = false;
      find('.review-done').focus();
    } catch (failure) {
      find('.review-submit-error').textContent = failure.message || 'couldn’t send your postcard. please try again.';
    } finally {
      sending = false;
      send.disabled = preparing;
    }
  });

  getReviews().then(result => {
    if (disposed) return;
    reviews = result;
    render();
    if (location.hash === '#reviews') section.scrollIntoView();
  });
  return () => {
    disposed = true;
    enter?.disconnect();
    section.replaceChildren();
  };
}
