import * as yup from 'yup';

const urlSchema = yup.string()
  .required('Не должно быть пустым')
  .url('Ссылка должна быть валидным URL');

export const validateUrl = (url, existingFeeds) => {
  return new Promise((resolve, reject) => {
    console.log('Validating:', url);
    
    urlSchema.validate(url)
      .then(validUrl => {
        console.log('Schema passed:', validUrl);
        
        // Проверка дубликата
        const isDuplicate = existingFeeds.some(feed => feed.url === validUrl);
        if (isDuplicate) {
          reject(new Error('RSS уже существует'));
        } else {
          resolve(validUrl);
        }
      })
      .catch(error => {
        console.log('Schema error:', error.message);
        reject(error);
      });
  });
};
