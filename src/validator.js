import * as yup from 'yup';

const urlSchema = yup.string()
  .required('Не должно быть пустым')
  .url('Ссылка должна быть валидным URL');

const validateUrl = (url, existingFeeds) => {
  return new Promise((resolve, reject) => {
    urlSchema.validate(url)
      .then(validUrl => {
        const isDuplicate = existingFeeds.some(feed => feed.url === validUrl);
        
        if (isDuplicate) {
          reject(new Error('RSS уже добавлен'));
        } else {
          resolve(validUrl);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};

const validateField = (url) => {
  return urlSchema.validate(url);
};

export { validateUrl, validateField };
