import { getProvidedData } from '../../../runtime';
import { appId } from '../constants';

interface CourseNavigationProviderData {
  courseNavigationUrlPattern: RegExp,
}

function getProviders(): CourseNavigationProviderData[] {
  return getProvidedData(appId).filter(
    (data): data is CourseNavigationProviderData =>
      data !== null
      && typeof data === 'object'
      && 'courseNavigationUrlPattern' in data
      && (data as CourseNavigationProviderData).courseNavigationUrlPattern instanceof RegExp
  );
}

export function isCourseNavigationRoute(): boolean {
  return getProviders().some(
    data => data.courseNavigationUrlPattern.test(window.location.pathname)
  );
}

export function isClientRoute(pathname: string): boolean {
  return getProviders().some(
    data => data.courseNavigationUrlPattern.test(pathname)
  );
}
