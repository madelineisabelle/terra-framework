/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
const { resizeTo, screenWidth } = require('terra-toolkit/lib/nightwatch/responsive-helpers');

module.exports = resizeTo(['small', 'large', 'huge'], {
  'Displays standard aggregator': (browser) => {
    browser.url(`${browser.launchUrl}/#/tests/aggregator/default`);
  },
});
