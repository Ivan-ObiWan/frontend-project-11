import state from './state.js';
import { validateUrl } from './validator.js';

const form = document.getElementById('rss-form');
const urlInput = document.getElementById('rss-url');
const feedsContainer = document.getElementById('feeds');

const showError = (message) => {
  const oldError = document.querySelector('.invalid-feedback');
  if (oldError) oldError.remove();
  
  urlInput.classList.add('is-invalid');
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  urlInput.parentNode.appendChild(errorDiv);
};

const clearError = () => {
  urlInput.classList.remove('is-invalid');
  const oldError = document.querySelector('.invalid-feedback');
  if (oldError) oldError.remove();
};

const showMessage = (message, isSuccess = true) => {
  const alert = document.createElement('div');
  alert.className = `alert alert-${isSuccess ? 'success' : 'danger'} alert-dismissible fade show`;
  alert.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  form.insertAdjacentElement('afterend', alert);
  setTimeout(() => alert.remove(), 3000);
};

const renderFeed = (feed) => {
  const div = document.createElement('div');
  div.className = 'card mb-2';
  div.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${feed.title}</h5>
      <p class="card-text">${feed.url}</p>
    </div>
  `;
  feedsContainer.appendChild(div);
};

const handleSubmit = (event) => {
  event.preventDefault();
  
  const url = urlInput.value.trim();
  
  validateUrl(url, state.feeds)
    .then(validUrl => {
      clearError();
      
      const newFeed = {
        id: Date.now(),
        url: validUrl,
        title: 'RSS поток',
        description: 'Описание RSS потока'
      };
      
      state.feeds.push(newFeed);
      renderFeed(newFeed);
      urlInput.value = '';
      showMessage('RSS успешно загружен');
    })
    .catch(error => {
      showError(error.message);
      showMessage(error.message, false);
    });
};

form.addEventListener('submit', handleSubmit);
urlInput.focus();

export const initView = () => {
  console.log('View initialized');
};
