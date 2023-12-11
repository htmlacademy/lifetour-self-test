const indexSections = [
   { section: 'hero', misMatchThreshold: 2 },
   { section: 'tours', misMatchThreshold: 2 },
   { section: 'training', misMatchThreshold: 2 },
  { section: 'about', misMatchThreshold: 2 },
  { section: 'reviews', misMatchThreshold: 2 },
  { section: 'adv', misMatchThreshold: 2 },
  { section: 'gallery', misMatchThreshold: 2 },
  { section: 'form', misMatchThreshold: 2 },
  { section: 'footer', misMatchThreshold: 2 }
];

  module.exports = {
    "id": "lifetour test-pp",
    "viewports": [
      {
        "label": "desktop",
        "width": 1440,
        "height": 800,
      },
      {
        "label": "tablet",
        "width": 768,
        "height": 800,
      },
      {
        "label": "mobile",
        "width": 350,
        "height": 800,
      },
    ],
    "onReadyScript": "onReady.cjs",
    "onBeforeScript": "onBefore.cjs",
    "resembleOutputOptions": {
      "ignoreAntialiasing": true,
      "errorType": "movementDifferenceIntensity",
      "transparency": 0.3,
      scaleToSameSize: false
    },
    "scenarios": [
      ...indexSections.map(({ section, misMatchThreshold }) => ({
        "label": `${section}`,
        "url": "http://localhost:3000/index.html",
        "referenceUrl": "./figma/index.html",
        selectors: [`[data-test="${section}"]`],
        misMatchThreshold: misMatchThreshold || 5,
        requireSameDimensions: true,
        delay: 500
      })),
    ],
    fileNameTemplate: '{scenarioLabel}_{viewportLabel}',
    "paths": {
      "bitmaps_reference": "bitmaps_reference/test-pp",
      "bitmaps_test": "backstop_data/bitmaps_test",
      "engine_scripts": "engine_scripts",
      "html_report": "backstop_data/html_report",
      "json_report": "backstop_data/json_report",
    },
    "report": ["browser", "json"],
    "engine": "puppeteer",
    "engineOptions": {
      "args": ["--no-sandbox"],
      "gotoParameters": { "waitUntil": ["load", "networkidle0"], timeout: 10000 },
    },
    "asyncCaptureLimit": 9,
    "asyncCompareLimit": 50,
    "debug": false,
    "debugWindow": false
  }
