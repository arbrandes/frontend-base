import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Slot, useIntl } from '../../../runtime';
import { CourseTab, getCourseHomeCourseMetadata } from './data/service';
import { Nav, Navbar, Skeleton } from '@openedx/paragon';
import messages from './messages';
import { isClientRoute } from './utils';
import './course-tabs-navigation.scss';

const stripOrigin = (url: string): string => {
  // If URL is absolute, extract the pathname; otherwise, return the original string
  try {
    if (/^https?:\/\//.test(url)) {
      return new URL(url).pathname;
    }
    return url;
  } catch {
    return url;
  }
};

const getActiveTabId = (pathname: string, tabs: CourseTab[]): string | null => {
  let activeTab: CourseTab | null = null;
  let maxLength = -1;
  for (const tab of tabs) {
    const tabPath = stripOrigin(tab.url);
    if (
      pathname === tabPath
      || (pathname.startsWith(tabPath.endsWith('/') ? tabPath : tabPath + '/') && tabPath.length > 1)
      || (pathname.startsWith(tabPath) && tabPath !== '/' && tabPath.length > maxLength)
    ) {
      if (tabPath.length > maxLength) {
        activeTab = tab;
        maxLength = tabPath.length;
      }
    }
  }
  return activeTab ? activeTab.tabId : null;
};

const CourseTabsNavigation = () => {
  const location = useLocation();
  const { courseId = '' } = useParams();
  const intl = useIntl();

  const { data = { tabs: [], isMasquerading: false }, isLoading } = useQuery({
    queryKey: ['org.openedx.frontend.app.header.course-meta', courseId],
    queryFn: () => getCourseHomeCourseMetadata(courseId),
    retry: 2,
    enabled: !!courseId,
  });

  const { tabs } = data;

  const currentTab = useMemo(
    () => tabs && tabs.length > 0 ? getActiveTabId(location.pathname, tabs) : null,
    [location.pathname, tabs]
  );

  if (isLoading) {
    return <Skeleton className="lead mt-3" />;
  }

  if (!courseId || !tabs || tabs.length === 0) {
    return null;
  }

  return (
    <Navbar expand="sm" className="course-tabs-navigation pb-0" aria-label={intl.formatMessage(messages.courseMaterial)}>
      <Nav
        variant="tabs"
        activeKey={currentTab}
      >
        <Navbar.Toggle aria-controls="course-nav" />
        <Navbar.Collapse id="course-nav">
          {
            tabs.map((tab: CourseTab) => {
              const pathname = stripOrigin(tab.url);
              const clientRoute = isClientRoute(pathname);
              return (
                <Nav.Item key={tab.tabId}>
                  <Nav.Link
                    {...(clientRoute
                      ? { to: pathname, as: Link }
                      : { href: tab.url }
                    )}
                    active={tab.tabId === currentTab}
                  >
                    {tab.title}
                  </Nav.Link>
                </Nav.Item>
              );
            })
          }
        </Navbar.Collapse>
        <Slot id="org.openedx.frontend.slot.header.courseNavigationBar.extraContent.v1" />
      </Nav>
    </Navbar>
  );
};

export default CourseTabsNavigation;
