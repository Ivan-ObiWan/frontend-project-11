const PROXY_URL = 'https://allorigins.hexlet.app/get';

const fetchViaProxy = (url) => {
  return new Promise((resolve, reject) => {
    const encodedUrl = encodeURIComponent(url);
    const proxyRequestUrl = `${PROXY_URL}?url=${encodedUrl}&disableCache=true`;
    
    fetch(proxyRequestUrl)
      .then(response => {
        if (!response.ok) {
          reject(new Error(`HTTP error! status: ${response.status}`));
        }
        return response.json();
      })
      .then(data => {
        if (data.contents) {
          resolve(data.contents);
        } else {
          reject(new Error('Empty response from proxy'));
        }
      })
      .catch(error => {
        reject(new Error(`Network error: ${error.message}`));
      });
  });
};

export default fetchViaProxy;
