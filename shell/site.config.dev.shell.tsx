import { Divider } from '../runtime';
import { AppConfigTypes, EnvironmentTypes, ProjectSiteConfig } from '../types';

import ChildOnePage from './dev-project/ChildOnePage';
import CoursesLink from './dev-project/CoursesLink';
import DashboardPage from './dev-project/DashboardPage';
import HomePage from './dev-project/HomePage';
import { primaryLinks } from './header/defaults';
import './index.scss';

const config: ProjectSiteConfig = {
  apps: {
    home: {
      type: AppConfigTypes.INTERNAL,
      config: {
        route: {
          path: '/',
          Component: HomePage,
        }
      }
    },
    child1: {
      type: AppConfigTypes.INTERNAL,
      config: {
        header: {
          primaryLinks: [
            {
              label: 'Child Link',
              url: '#'
            },
            ...primaryLinks,
          ],
          secondaryLinks: [
            {
              label: 'Child Help',
              appId: 'support',
            }
          ]
        },
        route: {
          path: '/child1',
          Component: ChildOnePage,
        }
      }
    },
    'learner-dashboard': {
      type: AppConfigTypes.INTERNAL,
      config: {
        route: {
          path: 'dashboard',
          Component: DashboardPage,
        }
      }
    },
    support: {
      type: AppConfigTypes.EXTERNAL,
      url: 'https://local.openedx.io:8000/support',
    },
    logout: {
      type: AppConfigTypes.EXTERNAL,
      url: 'http://local.openedx.io:8000/logout',
    }
  },

  header: {
    primaryLinks: [
      {
        label: (<CoursesLink />),
        appId: 'learner-dashboard',
      },
      {
        label: 'Other',
        url: '#',
      },
      {
        label: 'Dropdown',
        items: [
          {
            label: 'Item #1',
            url: '#',
          },
          <Divider />,
          {
            label: 'Item #2',
            url: '#',
          },
        ]
      }
    ],
    secondaryLinks: [
      {
        label: 'Help',
        appId: 'support',
      }
    ],
  },

  APP_ID: 'shell',
  ACCOUNT_PROFILE_URL: 'http://apps.local.openedx.io:1995',
  ACCOUNT_SETTINGS_URL: 'http://apps.local.openedx.io:1997',
  BASE_URL: 'http://apps.local.openedx.io:8080',
  ENVIRONMENT: EnvironmentTypes.DEVELOPMENT,
  FAVICON_URL: 'https://edx-cdn.org/v3/default/favicon.ico',
  LEARNER_DASHBOARD_URL: 'http://local.openedx.io:8000/dashboard',
  LEARNING_BASE_URL: 'http://apps.local.openedx.io:2000',
  LMS_BASE_URL: 'http://local.openedx.io:8000',
  LOGIN_URL: 'http://local.openedx.io:8000/login',
  LOGO_TRADEMARK_URL: 'https://edx-cdn.org/v3/default/logo-trademark.svg',
  LOGO_URL: 'https://edx-cdn.org/v3/default/logo.svg',
  LOGO_WHITE_URL: 'https://edx-cdn.org/v3/default/logo-white.svg',
  LOGOUT_URL: 'http://local.openedx.io:8000/logout',
  MARKETING_SITE_BASE_URL: 'http://local.openedx.io:8000',
  MFE_CONFIG_API_URL: 'http://apps.local.openedx.io:8080/api/mfe_config/v1',
  ORDER_HISTORY_URL: 'http://apps.local.openedx.io:1996/orders',
  SITE_NAME: 'My Open edX Site',
  STUDIO_BASE_URL: 'http://studio.local.openedx.io:8001',
};

export default config;
