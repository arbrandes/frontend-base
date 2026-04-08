import { getActiveRoles, getProvidedData, getUrlByRouteRole } from '../../../runtime';
import { appId } from '../constants';

interface CourseNavigationProviderData {
  courseNavigationRoles: string[],
}

function getProviders(): CourseNavigationProviderData[] {
  return getProvidedData(appId).filter(
    (data): data is CourseNavigationProviderData =>
      data !== null
      && typeof data === 'object'
      && 'courseNavigationRoles' in data
      && Array.isArray((data as CourseNavigationProviderData).courseNavigationRoles)
  );
}

function getProvidedRoles(): string[] {
  return getProviders().flatMap(data => data.courseNavigationRoles);
}

export function isCourseNavigationRoute(): boolean {
  const activeRoles = getActiveRoles();
  return getProvidedRoles().some(role => activeRoles.includes(role));
}

export function isClientRoute(pathname: string): boolean {
  return getProvidedRoles().some(role => {
    const routePath = getUrlByRouteRole(role);
    return routePath !== null
      && routePath.startsWith('/')
      && pathname.startsWith(routePath);
  });
}
