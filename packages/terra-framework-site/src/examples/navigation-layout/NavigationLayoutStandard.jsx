import React from 'react';
import { MemoryRouter, withRouter } from 'react-router-dom';
import NavigationLayout from 'terra-navigation-layout';

import HeaderExample from './HeaderExample';
import MenuExample from './MenuExample';
import Page1Content from './Page1Content';
import Page2Content from './Page2Content';
import Page3Content from './Page3Content';
import Page1Menu from './Page1Menu';
import Page2Menu from './Page2Menu';

const config = {
  header: {
    '/': {
      path: '/',
      component: {
        default: {
          componentClass: HeaderExample,
        },
      },
    },
  },
  menu: {
    '/': {
      path: '/',
      component: {
        tiny: {
          componentClass: MenuExample,
        },
        small: {
          componentClass: MenuExample,
        },
      },
      children: {
        '/page1': {
          path: '/page1',
          component: {
            default: {
              componentClass: Page1Menu,
            },
          },
        },
        '/page2': {
          path: '/page2',
          component: {
            default: {
              componentClass: Page2Menu,
            },
          },
        },
      },
    },
  },
  content: {
    '/page1': {
      path: '/page1',
      component: {
        default: {
          componentClass: Page1Content,
        },
      },
    },
    '/page2': {
      path: '/page2',
      component: {
        default: {
          componentClass: Page2Content,
        },
      },
    },
    '/page3': {
      path: '/page3',
      component: {
        default: {
          componentClass: Page3Content,
        },
      },
    },
  },
};

const NavigationLayoutStandard = withRouter(({ location }) => (
  <div>
    <h3>Example Features</h3>
    <ul>
      <li>Contains 3 different primary routes: /page1, /page2, and /page3</li>
      <ul>
        <li>/page1 - Has content, inner routes, and an associated menu</li>
        <li>/page2 - Has content and an associated menu</li>
        <li>/page3 - Has only content</li>
      </ul>
      <li>Has a Header that is rendered for all routes (matched to `/` path)</li>
      <li>Header provides links to other primary routes for breakpoints `medium`, `large`, and `huge`</li>
      <li>When size is `tiny` or `small`, a new Menu is presented to expose links to primary routes (the Header hides its links at these sizes)</li>
      <li>Page menus expose navigation to parent menus</li>
      <li>Page content and menus expose Layout-provided functionality</li>
    </ul>
    <h3>{`Broswer Location: ${location.pathname}`}</h3>
    <NavigationLayout
      config={config}
      menuText="Menu"
      style={{ height: '400px', width: '100%' }}
    />
  </div>
));

const NavigationLayoutRouter = () => (
  <MemoryRouter
    initialEntries={['/page1', '/page1/item1', '/page1/item2', '/page2', 'page3']}
    initialIndex={0}
  >
    <NavigationLayoutStandard />
  </MemoryRouter>
);

export default NavigationLayoutRouter;