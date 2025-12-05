import { useMemo } from 'react';

import { isEmptyObject } from './utils';
import { getSiteConfig } from '../../../config';

/**
 * Custom React hook that retrieves the Paragon theme URLs, including the core theme CSS and any theme variants.
 *
 * Example:
 *
 * const themeUrls = useParagonThemeUrls();
 * if (themeUrls) {
 *   console.log(themeUrls.core.urls.brandOverride); // Outputs the URL of the brand theme CSS
 *   console.log(themeUrls.variants['dark'].urls.brandOverride); // Outputs the URL of the dark theme variant CSS
 * }
 *
 */
const useParagonThemeUrls = () => useMemo(() => {
  const { paragonThemeUrls } = getSiteConfig();

  if (!paragonThemeUrls?.core?.urls?.brandOverride) {
    return;
  }

  const coreCss = {
    brandOverride: paragonThemeUrls.core.urls.brandOverride,
  };

  const defaultThemeVariants = paragonThemeUrls.defaults;
  if (isEmptyObject(defaultThemeVariants)) {
    return;
  }

  const themeVariantsCss = {};
  const themeVariantsEntries = Object.entries(paragonThemeUrls.variants ?? {});
  themeVariantsEntries.forEach(([themeVariant, urls]) => {
    themeVariantsCss[themeVariant] = urls;
  });

  if (isEmptyObject(themeVariantsCss)) {
    return;
  }

  return {
    core: { urls: coreCss },
    defaults: defaultThemeVariants,
    variants: themeVariantsCss,
  };
}, []);

export default useParagonThemeUrls;
