/* global browser, Terra */

const viewports = Terra.viewports('tiny', 'medium');

describe('ApplicationList', () => {
  describe('Displays a default application list', () => {
    beforeEach(() => browser.url('/#/tests/application-links/default-list'));

    Terra.should.matchScreenshot({ viewports });
    Terra.should.beAccessible({ viewports, context: '#test-list' });
    Terra.should.themeEachCustomProperty({
      '--terra-application-list-color': '#1c1f21',
      '--terra-application-list-font-size': '1.071rem',
      '--terra-application-list-line-height': '3.214rem',
      '--terra-application-list-padding': '0 0.7143rem',
      '--terra-application-list-selected-background-image': 'linear-gradient(-270deg, #fff, #e8e9ea)',
      '--terra-application-list-selected-box-shadow': 'inset 0.5rem 0 0 0 #007cc3',
      '--terra-application-list-selected-padding': '0 1.214rem',
    });
  });

  describe('Displays an application list hover', () => {
    beforeEach(() => {
      browser.url('/#/tests/application-links/default-list');
      browser.waitForVisible('#test-list');
      browser.moveToObject('#test-list >*:nth-child(2)');
    });

    Terra.should.matchScreenshot({ viewports });
    Terra.should.themeEachCustomProperty({
      '--terra-application-list-background-hover': 'linear-gradient(-90deg, #fff, #f1f1f2)',
    });
  });

  describe('Displays an application list selection', () => {
    beforeEach(() => {
      browser.url('/#/tests/application-links/default-list');
      browser.waitForVisible('#test-list');
      browser.click('#test-list >*:nth-child(2)');
    });

    Terra.should.matchScreenshot({ viewports });
  });
});
