import * as yup from 'yup';
import i18next from 'i18next';

yup.setLocale({
  mixed: {
    required: () => i18next.t('errors.required'),
  },
  string: {
    url: () => i18next.t('errors.invalidUrl'),
  },
});

const urlSchema = () => {
  return yup.string()
    .required()
    .url();
};

export const validateUrl = (url, existingFeeds) => {
  return new Promise((resolve, reject) => {
    const schema = urlSchema();
    
    schema.validate(url)
      .then(validUrl => {
        const isDuplicate = existingFeeds.some(feed => feed.url === validUrl);
        if (isDuplicate) {
          reject(new Error(i18next.t('errors.duplicate')));
        } else {
          resolve(validUrl);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const validateField = (url) => {
  const schema = urlSchema();
  return schema.validate(url);
};
