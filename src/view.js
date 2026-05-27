import i18next from 'i18next';
import state from './state.js';
import { validateUrl } from './validator.js';
import initI18n from './i18n.js';

const form = document.getElementById('rss-form');
const urlInput = document.getElementById('rss-url');
const feedsContainer = document.getElementById('feeds');

const heroTitle = document.querySelector('.hero-section h1');
const heroLead = document.querySelector('.hero-section .lead');
const submitButton = document.querySelector('button[type="submit"]');
const formText = document.querySelector('.form-text');
const footer = document.querySelector('footer');

urlInput.placeholder = 'Ссылка RSS';

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
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) existingAlert.remove();
  
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

const updateUILocales = () => {
  // Обновляем все тексты интерфейса из i18next
  if (heroTitle) heroTitle.textContent = i18next.t('app.title');
  if (heroLead) heroLead.textContent = i18next.t('app.lead');
  if (submitButton) submitButton.textContent = i18next.t('form.button');
  if (formText) formText.textContent = i18next.t('form.example');
  if (footer) footer.textContent = i18next.t('footer.created');
  if (urlInput) urlInput.placeholder = i18next.t('form.placeholder');
};

const handleSubmit = (event) => {
  event.preventDefault();
  
  const url = urlInput.value.trim();
  const originalButtonText = submitButton.textContent;
  
  submitButton.disabled = true;
  submitButton.textContent = i18next.t('form.loading');
  
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
      showMessage(i18next.t('messages.success'));
    })
    .catch(error => {
      showError(error.message);
      // Не показываем второе сообщение для ошибок валидации
      if (error.message !== i18next.t('errors.required') && 
          error.message !== i18next.t('errors.invalidUrl') &&
          error.message !== i18next.t('errors.duplicate')) {
        showMessage(error.message, false);
      }
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      urlInput.focus();
    });
};

const initApp = () => {
  initI18n()
    .then(() => {
      console.log('i18next initialized');
      updateUILocales();
      
      form.addEventListener('submit', handleSubmit);
      urlInput.focus();
    })
    .catch(error => {
      console.error('Failed to initialize i18next:', error);
      // Если i18next не загрузился, устанавливаем тексты по умолчанию
      heroTitle.textContent = 'RSS агрегатор';
      heroLead.textContent = 'Начните читать RSS сегодня! Это легко, это красиво.';
      submitButton.textContent = 'Добавить';
      formText.textContent = 'Пример: https://lorem-rss.hexlet.app/feed';
      footer.textContent = 'created by Hexlet';
      urlInput.placeholder = 'Ссылка RSS';
      
      form.addEventListener('submit', handleSubmit);
      urlInput.focus();
    });
};

initApp();
