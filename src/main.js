import './style.css';

const form = document.getElementById('rss-form');
const urlInput = document.getElementById('url-input');
const feedsContainer = document.getElementById('feeds');

let feeds = [];

const validateUrl = (url) => {
  return new Promise((resolve, reject) => {
    if (!url || url.trim() === '') {
      reject(new Error('URL не может быть пустым'));
    } else if (!url.match(/^https?:\/\//i)) {
      reject(new Error('URL должен начинаться с http:// или https://'));
    } else {
      resolve(url);
    }
  });
};

const checkDuplicate = (url) => {
  return new Promise((resolve, reject) => {
    const exists = feeds.some(feed => feed.url === url);
    if (exists) {
      reject(new Error('Этот RSS поток уже добавлен'));
    } else {
      resolve(url);
    }
  });
};

const fetchRss = (url) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: `RSS поток из ${url}`,
        description: 'Описание RSS потока будет здесь',
        url: url
      });
    }, 300);
  });
};

const showMessage = (message, isError = false) => {
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${isError ? 'danger' : 'success'} alert-dismissible fade show`;
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
  feedElement.className = 'card mb-3';
  feedElement.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${feed.title}</h5>
      <p class="card-text text-muted">${feed.description}</p>
      <small class="text-secondary">${feed.url}</small>
    </div>
  `;
  feedsContainer.appendChild(feedElement);
};

const handleSubmit = (event) => {
  event.preventDefault();
  
  const url = urlInput.value.trim();
  
  validateUrl(url)
    .then(validUrl => checkDuplicate(validUrl))
    .then(uniqueUrl => fetchRss(uniqueUrl))
    .then(rssData => {
      const newFeed = {
        url: rssData.url,
        title: rssData.title,
        description: rssData.description
      };
      
      feeds.push(newFeed);
      renderFeed(newFeed);
      urlInput.value = '';
      showMessage('RSS успешно добавлен!');
    })
    .catch(error => {
      showMessage(`Ошибка: ${error.message}`, true);
    });
};

form.addEventListener('submit', handleSubmit);
