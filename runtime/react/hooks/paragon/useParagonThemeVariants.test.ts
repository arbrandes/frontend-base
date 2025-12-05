import { act, fireEvent, renderHook } from '@testing-library/react';

import { getSiteConfig } from '../../../config';
import { logError } from '../../../logging';

import useParagonThemeVariants from './useParagonThemeVariants';

jest.mock('../../../logging');

describe('useParagonThemeVariants', () => {
  const onComplete = jest.fn();
  const onDarkModeSystemPreferenceChange = jest.fn();
  const originalWindowLocation = window.location;
  const mockWindowLocationOrigin = jest.fn();

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        get origin() {
          return mockWindowLocationOrigin();
        },
      },
    });
    mockWindowLocationOrigin.mockReturnValue(getSiteConfig().baseUrl);
  });

  afterEach(() => {
    document.head.innerHTML = '';
    jest.clearAllMocks();
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', originalWindowLocation);
  });

  it('should do nothing if themeVariants is not configured', () => {
    const themeVariants = undefined;
    const currentThemeVariant = 'light';

    renderHook(() => useParagonThemeVariants({ themeVariants, currentThemeVariant, onComplete, onDarkModeSystemPreferenceChange }));
    expect(document.head.querySelectorAll('link').length).toBe(0);
  });

  it('should create the links tags for each theme variant', () => {
    const themeVariants = {
      light: {
        urls: {
          brandOverride: 'https://cdn.jsdelivr.net/npm/@openedx/brand@1.0.0/dist/light.min.css',
        },
      },
      dark: {
        urls: {
          brandOverride: 'https://cdn.jsdelivr.net/npm/@openedx/brand@1.0.0/dist/dark.min.css',
        },
      },
    };
    const currentThemeVariant = 'light';

    renderHook(() => useParagonThemeVariants({ themeVariants, currentThemeVariant, onComplete, onDarkModeSystemPreferenceChange }));
    const themeLinks = document.head.querySelectorAll('link');
    expect(themeLinks.length).toBe(2);
  });

  it('should dispatch a log error if the variant theme link cannot be loaded', () => {
    const themeVariants = {
      light: {
        urls: {
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@1.0.0/dist/light.min.css',
        },
      },
    };
    const currentThemeVariant = 'light';

    renderHook(() => useParagonThemeVariants({ themeVariants, currentThemeVariant, onComplete, onDarkModeSystemPreferenceChange }));
    const themeLinks = document.head.querySelectorAll('link');

    act(() => {
      themeLinks.forEach((link) => fireEvent.error(link));
    });
    expect(logError).toHaveBeenCalledTimes(1);
  });

  it('shoud not create a new link if it already exists', () => {
    document.head.innerHTML = '<link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/@openedx/brand@1.0.0/dist/light.min.css" onerror="this.remove();">';

    const themeVariants = {
      light: {
        urls: {
          brandOverride: 'https://cdn.jsdelivr.net/npm/@openedx/brand@1.0.0/dist/light.min.css',
        },
      },
      dark: {
        urls: {
          brandOverride: 'https://cdn.jsdelivr.net/npm/@openedx/brand@1.0.0/dist/dark.min.css',
        },
      },
    };

    const currentThemeVariant = 'light';
    renderHook(() => useParagonThemeVariants({ themeVariants, currentThemeVariant, onComplete, onDarkModeSystemPreferenceChange }));
    const themeLinks = document.head.querySelectorAll('link');
    const lightThemeBrandLink: HTMLAnchorElement | null = document.head.querySelector('link[data-brand-theme-variant="light"]');

    expect(themeLinks.length).toBe(2);
    expect(lightThemeBrandLink?.rel).toContain('stylesheet');
    expect(lightThemeBrandLink).not.toHaveAttribute('as', 'style');
  });
});
