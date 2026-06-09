import i18next from 'i18next';

const PROXY_URL = 'https://allorigins.hexlet.app/get';

const fetchViaProxy = (url) => {
  return new Promise((resolve, reject) => {
    const encodedUrl = encodeURIComponent(url);
    const proxyRequestUrl = `${PROXY_URL}?url=${encodedUrl}&disableCache=true`;
    
    fetch(proxyRequestUrl)
      .then(response => {
        if (!response.ok) {
          reject(new Error(i18next.t('errors.networkError')));
        }
        return response.json();
      })
      .then(data => {
        if (data.contents) {
          resolve(data.contents);
        } else {
          reject(new Error(i18next.t('errors.emptyResponse')));
        }
      })
      .catch(error => {
        reject(new Error(i18next.t('errors.networkError')));
      });
  });
};

export default fetchViaProxy;
