import { WidgetOperationTypes } from '../../runtime';
import { App } from '../../types';
import Logo from '../Logo';
import AnonymousMenu from './anonymous-menu/AnonymousMenu';
import AuthenticatedMenu from './AuthenticatedMenu';
import CourseInfo from './desktop/CourseInfo';
import DesktopLayout from './desktop/DesktopLayout';
import PrimaryNavLinks from './desktop/PrimaryNavLinks';
import SecondaryNavLinks from './desktop/SecondaryNavLinks';
import MobileLayout from './mobile/MobileLayout';
import MobileNavLinks from './mobile/MobileNavLinks';

const config: App = {
  appId: 'org.openedx.frontend.app.header',
  slots: [

    // Layouts
    {
      slotId: 'org.openedx.frontend.slot.header.desktop.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.desktopLayout.v1',
      op: WidgetOperationTypes.APPEND,
      component: DesktopLayout
    },
    {
      slotId: 'org.openedx.frontend.slot.header.mobile.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.mobileLayout.v1',
      op: WidgetOperationTypes.APPEND,
      component: MobileLayout
    },

    // Desktop
    {
      slotId: 'org.openedx.frontend.slot.header.desktopLeft.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.desktopLogo.v1',
      op: WidgetOperationTypes.APPEND,
      element: <Logo />,
    },
    {
      slotId: 'org.openedx.frontend.slot.header.desktopLeft.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.desktopCourseInfo.v1',
      op: WidgetOperationTypes.APPEND,
      component: CourseInfo
    },
    {
      slotId: 'org.openedx.frontend.slot.header.desktopLeft.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.desktopPrimaryLinks.v1',
      op: WidgetOperationTypes.APPEND,
      component: PrimaryNavLinks
    },
    {
      slotId: 'org.openedx.frontend.slot.header.desktopRight.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.desktopSecondaryLinks.v1',
      op: WidgetOperationTypes.APPEND,
      component: SecondaryNavLinks
    },
    {
      slotId: 'org.openedx.frontend.slot.header.desktopRight.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.desktopAuthenticatedMenu.v1',
      op: WidgetOperationTypes.APPEND,
      element: <AuthenticatedMenu />,
      condition: {
        authenticated: true,
      }
    },
    {
      slotId: 'org.openedx.frontend.slot.header.desktopRight.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.desktopAnonymousMenu.v1',
      op: WidgetOperationTypes.APPEND,
      element: <AnonymousMenu />,
      condition: {
        authenticated: false,
      }
    },

    // Mobile
    {
      slotId: 'org.openedx.frontend.slot.header.mobileCenter.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.mobileLogo.v1',
      op: WidgetOperationTypes.APPEND,
      element: <Logo />,
    },
    {
      slotId: 'org.openedx.frontend.slot.header.mobileMenu.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.mobileMenuLinks.v1',
      op: WidgetOperationTypes.APPEND,
      component: MobileNavLinks
    },
    {
      slotId: 'org.openedx.frontend.slot.header.mobileRight.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.mobileAuthenticatedMenu.v1',
      op: WidgetOperationTypes.APPEND,
      element: <AuthenticatedMenu />,
      condition: {
        authenticated: true,
      }
    },
    {
      slotId: 'org.openedx.frontend.slot.header.mobileRight.v1',
      id: 'org.openedx.frontend.widget.defaultHeader.mobileAnonymousMenu.v1',
      op: WidgetOperationTypes.APPEND,
      element: <AnonymousMenu />,
      condition: {
        authenticated: false,
      }
    },
  ]
};

export default config;
