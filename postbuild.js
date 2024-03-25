/**
 * This script is used to modify the index.html file after the build process.
 * This is necessary because the build process sets the media attribute of the
 * link tag to 'print' which causes the styles to not be applied when loaded
 * as a browser extension. This feature is the default behavior of an Angular
 * application to help with initial page load performance but must be overriden
 * for use as a browser extension application.
 * Refer to the https://cheerio.js.org/ documentation for more information on
 * how to use the cheerio library to manipulate HTML files. Refer to the README
 * of the Extension project to understand why this is necessary.
 */
const fs = require('fs');
const cheerio = require('cheerio');
const indexFilePath = './dist/extension/index.html';

fs.readFile(indexFilePath, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  const $ = cheerio.load(data);
  $('link[rel="stylesheet"]').attr('media', 'all');
  const html = $.html();
  fs.writeFile(indexFilePath, html, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});
