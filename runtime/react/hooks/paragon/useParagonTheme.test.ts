import { act, fireEvent, renderHook } from '@testing-library/react';

import useParagonTheme from './useParagonTheme';
import { mergeSiteConfig } from '../../../config';
import { logError } from '../../../logging';

jest.mock('../../../logging');

const paragonThemeUrls = {
  core: {
    urls: {
      brandOverride: 'https://cdn.jsdelivr.net/npm/@openedx/brand@1.0.0/dist/core.min.css',
    },
  },
  defaults: {
    light: 'light',
    dark: 'dark',
  },
  variants: {
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
  },
};

let mockMediaQueryListEvent;
const mockAddEventListener = jest.fn((dispatch, fn) => fn(mockMediaQueryListEvent));
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    matches: mockMediaQueryListEvent.matches,
  })),
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
  },
});

describe('useParagonTheme', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    mockMediaQueryListEvent = { matches: true };
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
    jest.mocked(window.localStorage.getItem).mockClear();
    mergeSiteConfig({ paragonThemeUrls });
  });

  it.each([
    ['dark', 'stylesheet', 'alternate stylesheet', true], // preference is dark
    ['light', 'alternate stylesheet', 'stylesheet', false], // preference is light
  ])(
    'should configure theme variant for system preference %s and handle theme change events',
    (initialPreference, expectedDarkRel, expectedLightRel, isDarkMediaMatch) => {
      // Mock the matchMedia behavior to simulate system preference
      mockMediaQueryListEvent = { matches: isDarkMediaMatch };
      // Set up the hook and initial theme configuration
      const { result, unmount } = renderHook(() => useParagonTheme());
      const themeLinks = document.head.querySelectorAll('link');

      const checkThemeLinks = () => {
        const darkLink: HTMLAnchorElement | null = document.head.querySelector('link[data-brand-theme-variant="dark"]');
        const lightLink: HTMLAnchorElement | null = document.head.querySelector('link[data-brand-theme-variant="light"]');
        expect(darkLink?.rel).toBe(expectedDarkRel);
        expect(lightLink?.rel).toBe(expectedLightRel);
      };

      // Simulate initial theme configuration based on system preference
      act(() => {
        themeLinks.forEach((link) => fireEvent.load(link));
      });

      // Ensure matchMedia was called with the correct system preference
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mockAddEventListener).toHaveBeenCalled();

      // Check initial theme setup
      checkThemeLinks();
      expect(result.current[0]).toEqual({
        isThemeLoaded: true,
        themeVariant: initialPreference,
      });

      unmount();
      expect(mockRemoveEventListener).toHaveBeenCalled();
    },
  );

  it('should configure theme variants according with user preference if is defined (localStorage)', () => {
    jest.mocked(window.localStorage.getItem).mockReturnValue('light');
    const { result, unmount } = renderHook(() => useParagonTheme());
    const themeLinks = document.head.querySelectorAll('link');
    const darkLink: HTMLAnchorElement | null = document.head.querySelector('link[data-brand-theme-variant="dark"]');
    const lightLink: HTMLAnchorElement | null = document.head.querySelector('link[data-brand-theme-variant="light"]');

    act(() => {
      themeLinks.forEach((link) => fireEvent.load(link));
    });

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mockAddEventListener).toHaveBeenCalled();

    expect(darkLink?.rel).toBe('alternate stylesheet');
    expect(lightLink?.rel).toBe('stylesheet');
    expect(result.current[0]).toEqual({ isThemeLoaded: true, themeVariant: 'light' });

    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });

  it('should define the theme variant as default if only 1 is configured', () => {
    mergeSiteConfig({
      paragonThemeUrls: {
        ...paragonThemeUrls,
        variants: {
          light: paragonThemeUrls.variants.light
        }
      }
    });
    jest.mocked(window.localStorage.getItem).mockReturnValue('light');
    const { result, unmount } = renderHook(() => useParagonTheme());
    const themeLinks = document.head.querySelectorAll('link');
    const themeVariantLinks: NodeListOf<HTMLAnchorElement> | null = document.head.querySelectorAll('link[data-brand-theme-variant]');

    act(() => {
      themeLinks.forEach((link) => fireEvent.load(link));
    });

    expect(themeVariantLinks.length).toBe(1);
    expect((themeVariantLinks[0]).rel).toBe('stylesheet');
    expect(result.current[0]).toEqual({ isThemeLoaded: true, themeVariant: 'light' });

    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });

  it('should not configure any theme if paragonThemeUrls is undefined', () => {
    mergeSiteConfig({
      paragonThemeUrls: undefined
    });
    const { result, unmount } = renderHook(() => useParagonTheme());
    const themeLinks = document.head.querySelectorAll('link');

    expect(result.current[0]).toEqual({ isThemeLoaded: true, themeVariant: undefined });
    expect(themeLinks.length).toBe(0);
    unmount();
  });

  it('should return themeVariant undefined if can not configure the default theme or fallback in the light theme', () => {
    mergeSiteConfig({
      paragonThemeUrls: {
        ...paragonThemeUrls,
        defaults: {
          light: 'red'
        },
        variants: {
          light: paragonThemeUrls.variants.light,
          green: { urls: { brandOverride: 'green-url' } }
        }
      }
    });
    jest.mocked(window.localStorage.getItem).mockReturnValue(null);

    const { result, unmount } = renderHook(() => useParagonTheme());
    const themeLinks = document.head.querySelectorAll('link');
    const themeVariantLinks = document.head.querySelectorAll('link[data-paragon-theme-variant]');
    act(() => {
      themeLinks.forEach((link) => fireEvent.load(link));
    });

    expect(result.current[0]).toEqual({ isThemeLoaded: true, themeVariant: undefined });
    expect(themeLinks.length).toBe(3);
    themeVariantLinks.forEach((link: HTMLAnchorElement) => expect(link.rel).toBe('alternate stylesheet'));
    unmount();
  });

  it('should log a error if can not configure the theme variant base on preference system', () => {
    mergeSiteConfig({
      paragonThemeUrls: {
        ...paragonThemeUrls,
        defaults: { dark: 'dark' },
        variants: {
          light: paragonThemeUrls.variants.light,
          green: { urls: { brandOverride: 'green-url' } }
        }
      }
    });
    jest.mocked(window.localStorage.getItem).mockReturnValue(null);

    const { result, unmount } = renderHook(() => useParagonTheme());
    const themeLinks = document.head.querySelectorAll('link');
    const themeVariantLinks = document.head.querySelectorAll('link[data-paragon-theme-variant]');
    act(() => {
      themeLinks.forEach((link) => fireEvent.load(link));
    });

    expect(result.current[0]).toEqual({ isThemeLoaded: true, themeVariant: 'dark' });
    expect(jest.mocked(logError).mock.calls[0][0]).toBe('Could not set theme variant based on system preference (prefers dark mode: true)');
    expect(themeVariantLinks.length).toBe(2);
    themeVariantLinks.forEach((link: HTMLAnchorElement) => expect(link.rel).toBe('alternate stylesheet'));
    unmount();
  });
});
