const fs = require('fs');

const homeReadMe = fs.readFileSync('./README.md', 'utf-8');

module.exports = {
  /* The component configuration path. */
  componentConfigPath: './site/generatedComponentConfig.js',

  /* The logo to display as the placeholder. */
  placeholderSrc: 'https://github.com/cerner/terra-core/raw/master/terra.png',

  /* The markdown content to display on the home page. */
  readMeContent: homeReadMe,

  appConfig: {
    /* The logo for the site header. */
    logoSrc: 'https://github.com/cerner/terra-core/raw/master/terra.png',

    /* The title for the site header. */
    title: 'Terra Framework',
    
    /* TEMP fix to allow for bidirecitonality in site. Current v2.0.0-RC.0 release does not map correctly. */
    bidirectional: false,   
  },
};
