import state from './state.js';
import { subscribe } from 'valtio';
import { validateField } from './validator.js';
import { fetchRss, parseRss } from './rss.js';

const form = document.getElementById('rss-form');
const urlInput = document.getElementById('rss-url');
const submitButton = form.querySelector('button[type="submit"]');
const feedsContainer = document.getElementById('feeds');

const showValidationError = (error) => {
  const existingError = document.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
  
  urlInput.classList.add('is-invalid');

  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = error;
  urlInput.parentNode.appendChild(errorDiv);
};

const clearValidationError = () => {
  urlInput.classList.remove('is-invalid');
  const existingError = document.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
};

const showMessage = (message, type = 'success') => {
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  form.insertAdjacentElement('afterend', alert);
  
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove();
    }
  }, 3000);
};

const renderFeed = (feed) => {
  const feedElement = document.createElement('div');
  feedElement.className = 'card';
  feedElement.setAttribute('data-id', feed.id);
  feedElement.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${feed.title}</h5>
      <p class="card-text">${feed.description}</p>
      <small class="text-muted">${feed.url}</small>
    </div>
  `;
  feedsContainer.appendChild(feedElement);
};

const renderAllFeeds = () => {
  feedsContainer.innerHTML = '';
  state.feeds.forEach(feed => {
    renderFeed(feed);
  });
};

const setupRealtimeValidation = () => {
  urlInput.addEventListener('input', () => {
    const url = urlInput.value.trim();
    
    validateField(url)
      .then(() => {
        clearValidationError();
        state.form.isValid = true;
        state.form.error = null;
      })
      .catch(error => {
        showValidationError(error.message);
        state.form.isValid = false;
        state.form.error = error.message;
      });
  });
};

const handleSubmit = (event) => {
  event.preventDefault();
  
  const url = urlInput.value.trim();

  submitButton.disabled = true;
  submitButton.textContent = 'Загрузка...';

  validateField(url)
    .then(() => {
      const isDuplicate = state.feeds.some(feed => feed.url === url);
      if (isDuplicate) {
        throw new Error('RSS уже добавлен');
      }
      return url;
    })
    .then(validUrl => fetchRss(validUrl))
    .then(rssData => parseRss(rssData))
    .then(parsedData => {
      const newFeed = {
        id: Date.now(),
        url: url,
        title: parsedData.title,
        description: parsedData.description,
        addedAt: new Date()
      };
      
      state.feeds.push(newFeed);
 
      urlInput.value = '';
      clearValidationError();

      showMessage('RSS успешно добавлен!', 'success');

      urlInput.focus();
    })
    .catch(error => {
      showValidationError(error.message);
      showMessage(`Ошибка: ${error.message}`, 'error');
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = 'Добавить';
    });
};

const setupWatchers = () => {
  subscribe(state, () => {
    if (state.feeds) {
      renderAllFeeds();
    }
  });
};

const initView = () => {
  setupRealtimeValidation();
  setupWatchers();
  form.addEventListener('submit', handleSubmit);

  urlInput.focus();
};

export { initView };
