import { useEffect, useState } from 'react';

import { logError } from '../../../logging';

import { ParagonThemeVariants } from '../../../../types';

/**
 * A custom React hook that manages the loading of theme variant CSS files dynamically.
 * Adds/updates a `<link>` element in the HTML document to load each theme variant's CSS, setting the
 * non-current theme variants as "alternate" stylesheets. That is, the browser will download
 * the CSS for the non-current theme variants, but at a lower priority than the current one.
 * This ensures that if the theme variant is changed at runtime, the new theme's CSS will already be loaded.
 *
 * The hook also listens for changes in the system's preference and triggers the provided callback accordingly.
 */
const useParagonThemeVariants = ({
  themeVariants,
  currentThemeVariant,
  onComplete,
  onDarkModeSystemPreferenceChange,
}: {
  themeVariants: ParagonThemeVariants | undefined,
  currentThemeVariant: string,
  onComplete: () => void,
  onDarkModeSystemPreferenceChange: (prefersDarkMode: boolean) => void,
}) => {
  const [isBrandThemeVariantComplete, setIsBrandThemeVariantComplete] = useState(false);

  // Effect hook that listens for changes in the system's dark mode preference.
  useEffect(() => {
    const changeColorScheme = (colorSchemeQuery) => {
      onDarkModeSystemPreferenceChange(colorSchemeQuery.matches);
    };
    const colorSchemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (colorSchemeQuery) {
      colorSchemeQuery.addEventListener('change', changeColorScheme);
    }
    return () => {
      if (colorSchemeQuery) {
        colorSchemeQuery.removeEventListener('change', changeColorScheme);
      }
    };
  }, [onDarkModeSystemPreferenceChange]);

  // Effect hook to set the theme current variant on the HTML element.
  useEffect(() => {
    if (currentThemeVariant && themeVariants?.[currentThemeVariant]) {
      const htmlDataThemeVariantAttr = 'data-paragon-theme-variant';
      document.querySelector('html')?.setAttribute(htmlDataThemeVariantAttr, currentThemeVariant);
      return () => {
        document.querySelector('html')?.removeAttribute(htmlDataThemeVariantAttr);
      };
    }
    return () => { }; // Cleanup: no action needed when theme variant is not set
  }, [themeVariants, currentThemeVariant]);

  // Effect hook that calls `onComplete` when brand theme variant processing is complete.
  useEffect(() => {
    if (isBrandThemeVariantComplete) {
      onComplete();
    }
  }, [isBrandThemeVariantComplete, onComplete]);

  useEffect(() => {
    if (!themeVariants) {
      return;
    }

    /**
     * Determines the value for the `rel` attribute for a given theme variant based
     * on if its the currently applied variant.
     */
    const generateStylesheetRelAttr = (themeVariant: string): string => (currentThemeVariant === themeVariant ? 'stylesheet' : 'alternate stylesheet');

    // Iterate over each theme variant URLs and inject them into the HTML document, if each doesn't already exist.
    Object.entries(themeVariants).forEach(([themeVariant, { urls }]) => {
      // If there is no config for the theme variant URL, set the theme variant to complete and continue.
      if (!urls) {
        setIsBrandThemeVariantComplete(true);
        return;
      }

      const existingThemeVariantBrandLink: HTMLAnchorElement | null = document.head.querySelector(`link[href='${urls.brandOverride}']`);
      const updatedStylesheetRel = generateStylesheetRelAttr(themeVariant);

      if (existingThemeVariantBrandLink) {
        existingThemeVariantBrandLink.rel = updatedStylesheetRel;
        existingThemeVariantBrandLink.removeAttribute('as');
        existingThemeVariantBrandLink.dataset.brandThemeVariant = themeVariant;
        return;
      }

      if (urls.brandOverride) {
        const brandThemeVariantLink = document.createElement('link');
        brandThemeVariantLink.href = urls.brandOverride;
        brandThemeVariantLink.rel = generateStylesheetRelAttr(themeVariant);
        brandThemeVariantLink.dataset.brandThemeVariant = themeVariant;

        brandThemeVariantLink.onload = () => {
          if (themeVariant === currentThemeVariant) {
            setIsBrandThemeVariantComplete(true);
          }
        };

        brandThemeVariantLink.onerror = () => {
          logError(`Failed to load theme variant (${themeVariant}) CSS from ${urls.brandOverride}. Aborting.`);
          setIsBrandThemeVariantComplete(true);
        };

        document.head.insertAdjacentElement(
          'beforeend',
          brandThemeVariantLink,
        );
      }

      setIsBrandThemeVariantComplete(true);
    });
  }, [themeVariants, currentThemeVariant, onComplete]);
};

export default useParagonThemeVariants;
