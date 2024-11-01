import { authenticatedPageConfig, examplePageConfig, iframePluginConfig, pluginPageConfig } from './src';

import { AppConfigTypes, EnvironmentTypes, ProjectSiteConfig } from '@openedx/frontend-base';
import './src/project.scss';


const config: ProjectSiteConfig = {
  apps: {
    examplePage: {
      type: AppConfigTypes.INTERNAL,
      config: examplePageConfig,
    },
    authenticatedPage: {
      type: AppConfigTypes.INTERNAL,
      config: authenticatedPageConfig,
    },
    pluginPage: {
      type: AppConfigTypes.INTERNAL,
      config: pluginPageConfig,
    },
    // This site is serving its own iframe plugin and embedding it in the PluginPage.  This is
    // obviously not quite like a real world use case, but it helps us test the mechanism without
    // adding another test project to the library.
    iframePlugin: {
      type: AppConfigTypes.INTERNAL,
      config: iframePluginConfig,
    },
  },

  ENVIRONMENT: EnvironmentTypes.PRODUCTION,
  ACCOUNT_PROFILE_URL: 'http://localhost:1995',
  ACCOUNT_SETTINGS_URL: 'http://localhost:1997',
  BASE_URL: 'http://localhost:8080',
  CREDENTIALS_BASE_URL: 'http://localhost:18150',
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  PUBLISHER_BASE_URL: 'http://localhost:18400',
  ECOMMERCE_BASE_URL: 'http://localhost:18130',
  LEARNER_DASHBOARD_URL: 'http://localhost:18000/dashboard',
  LEARNING_BASE_URL: 'http://localhost:2000',
  LMS_BASE_URL: 'http://localhost:18000',
  LOGIN_URL: 'http://localhost:18000/login',
  LOGOUT_URL: 'http://localhost:18000/logout',
  STUDIO_BASE_URL: 'http://localhost:18010',
  MARKETING_SITE_BASE_URL: 'http://localhost:18000',
  ORDER_HISTORY_URL: 'http://localhost:1996/orders',
  SITE_NAME: 'localhost',

  LOGO_URL: 'https://edx-cdn.org/v3/default/logo.svg',
  LOGO_TRADEMARK_URL: 'https://edx-cdn.org/v3/default/logo-trademark.svg',
  LOGO_WHITE_URL: 'https://edx-cdn.org/v3/default/logo-white.svg',
  FAVICON_URL: 'https://edx-cdn.org/v3/default/favicon.ico',
  APP_ID: 'shell',

  custom: {
    FALSE_VALUE: false,
    CORRECT_BOOL_VALUE: 'Good, false meant false.  We did not cast a boolean to a string.',
    INCORRECT_BOOL_VALUE: 'Why was a false boolean true?',
    INTEGER_VALUE: 123,
    EXAMPLE_VAR: 'Example Value',
  }
};

export default config;
