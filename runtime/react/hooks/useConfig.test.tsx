import { renderHook } from '@testing-library/react';
import siteConfig from 'site.config';
import { EnvironmentTypes } from '../../../types';
import useConfig from './useConfig';

describe('useConfig', () => {
  it('returns the site config', () => {
    const { result } = renderHook(() => useConfig());
    expect(result.current).toHaveProperty('apps', siteConfig.apps);
    expect(result.current).toHaveProperty('environment', EnvironmentTypes.TEST);
    expect(result.current).toHaveProperty('baseUrl', 'http://localhost:8080');
  });
});
