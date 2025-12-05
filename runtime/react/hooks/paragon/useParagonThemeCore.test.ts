import { act, renderHook, fireEvent } from '@testing-library/react';

import { getSiteConfig } from '../../../config';
import { logError } from '../../../logging';

import useParagonThemeCore from './useParagonThemeCore';

jest.mock('../../../logging');

describe('useParagonThemeCore', () => {
  const onComplete = jest.fn();
  let coreConfig: any;
  const originalWindowLocation = window.location;
  const mockWindowLocationOrigin = jest.fn();

  beforeEach(() => {
    document.head.innerHTML = '';
    coreConfig = {
      themeCore: {
        urls: {
          brandOverride: 'https://cdn.jsdelivr.net/npm/@openedx/brand@1.0.0/dist/core.min.css',
        },
      },
      onComplete,
    };

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
    jest.clearAllMocks();
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', originalWindowLocation);
  });

  it('should load the core url and change the loading state to true', () => {
    renderHook(() => useParagonThemeCore(coreConfig));

    const createdLinkTag: HTMLAnchorElement | null = document.head.querySelector('link[data-brand-theme-core="true"]');
    act(() => {
      if (createdLinkTag) {
        fireEvent.load(createdLinkTag);
      }
    });
    expect(createdLinkTag?.href).toBe(coreConfig.themeCore.urls.brandOverride);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should dispatch a log error if the theme link cannot be loaded', () => {
    renderHook(() => useParagonThemeCore(coreConfig));

    const createdLinkTag: HTMLAnchorElement | null = document.head.querySelector('link[data-brand-theme-core="true"]');
    act(() => {
      if (createdLinkTag) {
        fireEvent.error(createdLinkTag);
      }
    });
    expect(logError).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should not create a new link if the core theme is already loaded', () => {
    document.head.innerHTML = '<link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/@openedx/brand@1.0.0/dist/core.min.css" onerror="this.remove();">';

    renderHook(() => useParagonThemeCore(coreConfig));

    const createdLinkTags = document.head.querySelectorAll('link');

    expect(createdLinkTags.length).toBe(1);
    expect(createdLinkTags[0].rel).toContain('stylesheet');
    expect(createdLinkTags[0].href).toBe(coreConfig.themeCore.urls.brandOverride);
    expect(createdLinkTags[0]).not.toHaveAttribute('as', 'style');
  });

  it('should not create any core link if can not find themeCore urls definition', () => {
    coreConfig = {
      themeCore: {
        foo: 'bar',
      },
      onComplete,
    };

    renderHook(() => useParagonThemeCore(coreConfig));
    expect(document.head.querySelectorAll('link').length).toBe(0);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
