import { renderHook } from '@testing-library/react';

import useParagonThemeUrls from './useParagonThemeUrls';
import { mergeSiteConfig, getSiteConfig } from '../../../config';

const originalWindowLocation = window.location;
const mockWindowLocationOrigin = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    get origin() {
      return mockWindowLocationOrigin();
    },
  },
});

describe('useParagonThemeUrls', () => {
  beforeEach(() => {
    mockWindowLocationOrigin.mockReturnValue(getSiteConfig().baseUrl);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', originalWindowLocation);
  });

  it.each([
    [undefined, undefined],
    [{}, undefined],
  ])('handles when `siteConfig.paragonThemeUrls` is not present (%s)', (paragonThemeUrls, expectedURLConfig) => {
    mergeSiteConfig({ paragonThemeUrls });
    const { result } = renderHook(() => useParagonThemeUrls());
    expect(result.current).toEqual(expectedURLConfig);
  });

  describe('when `siteConfig.paragonThemeUrls` is present', () => {
    it('returns expected object when configuration is valid', () => {
      const siteConfig = {
        paragonThemeUrls: {
          core: {
            urls: {
              brandOverride: 'core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              urls: {
                brandOverride: 'light.css',
              },
            },
          },
        },
      };
      mergeSiteConfig(siteConfig);
      const { result } = renderHook(() => useParagonThemeUrls());
      expect(result.current).toEqual(
        expect.objectContaining({
          core: {
            urls: {
              brandOverride: 'core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              urls: {
                brandOverride: 'light.css',
              },
            },
          },
        }),
      );
    });

    it('returns expected undefined when variants are not present', () => {
      const siteConfig = {
        paragonThemeUrls: {
          core: {
            urls: {
              brandOverride: 'brand-core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {},
        },
      };
      mergeSiteConfig(siteConfig);
      const { result } = renderHook(() => useParagonThemeUrls());
      expect(result.current).toBe(undefined);
    });
  });
});
