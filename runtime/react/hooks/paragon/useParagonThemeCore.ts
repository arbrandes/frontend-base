import { useEffect, useState } from 'react';

import { logError } from '../../../logging';
import { removeExistingLinks } from './utils';

/**
 * Custom React hook that manages the loading and updating of the core Paragon theme CSS and the brand override
 * theme CSS. It ensures that the core theme CSS (both default and brand override) is added to the document
 * `<head>` as `<link>` elements.
 *
 * The function logs and handles fallback logic in case the core theme fails to load.
 *
 * @memberof module:React
 *
 * @param {Object} args - The arguments object containing theme and callback information.
 * @param {Object} args.themeCore - The core theme configuration.
 * @param {string} [args.themeCore.urls.brandOverride] - The URL to the brand override theme CSS (optional).
 * @param {Function} args.onComplete - A callback function that is called once both the core Paragon (default)
 * theme and brand override theme (if provided) are complete.
 */
const useParagonThemeCore = ({
  themeCore,
  onComplete,
}) => {
  const [isBrandThemeCoreComplete, setIsBrandThemeCoreComplete] = useState(false);

  useEffect(() => {
    if (isBrandThemeCoreComplete) {
      onComplete();
    }
  }, [isBrandThemeCoreComplete, onComplete]);

  useEffect(() => {
    // If there is no config for core theme urls, do nothing.
    if (!themeCore?.urls) {
      setIsBrandThemeCoreComplete(true);
      return;
    }

    const brandCoreLink: HTMLAnchorElement | null = document.head.querySelector(`link[href='${themeCore.urls.brandOverride}']`);
    if (brandCoreLink) {
      brandCoreLink.rel = 'stylesheet';
      brandCoreLink.removeAttribute('as');
      brandCoreLink.dataset.brandThemeCore = 'true';
      setIsBrandThemeCoreComplete(true);
      return;
    }

    if (themeCore.urls.brandOverride) {
      const brandCoreThemeLink = document.createElement('link');
      brandCoreThemeLink.href = themeCore.urls.brandOverride;
      brandCoreThemeLink.rel = 'stylesheet';
      brandCoreThemeLink.dataset.brandThemeCore = 'true';
      brandCoreThemeLink.onload = () => {
        setIsBrandThemeCoreComplete(true);
      };
      brandCoreThemeLink.onerror = () => {
        setIsBrandThemeCoreComplete(true);
        const otherExistingLinks = document.head.querySelectorAll('link[data-brand-theme-core="true"]');
        removeExistingLinks(otherExistingLinks);
        logError(`Failed to load core theme CSS from ${themeCore.urls.brandOverride}. Aborting.`);
        return;
      };

      document.head.insertAdjacentElement(
        'beforeend',
        brandCoreThemeLink,
      );
    } else {
      setIsBrandThemeCoreComplete(true);
    }
  }, [themeCore?.urls, onComplete]);
};

export default useParagonThemeCore;
