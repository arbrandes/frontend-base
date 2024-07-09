// Tests for the intl-imports.js command line.

import path from 'path';
import { main as realMain } from './intl-imports';

const sempleAppDirectory = path.join(__dirname, '../../../example');

// History for `process.stdout.write` mock calls.
const logHistory = {
  log: [],
  latest: '',
};

// History for `fs.writeFileSync` mock calls.
const writeFileHistory = {
  log: [],
  latest: null,
};

// Mock for process.stdout.write
const log = (text) => {
  logHistory.latest = text;
  logHistory.log.push(text);
};

// Mock for fs.writeFileSync
const writeFileSync = (filename, content) => {
  const entry = { filename, content };
  writeFileHistory.latest = entry;
  writeFileHistory.log.push(entry);
};

// Main with mocked output
const main = (...directories) => realMain({
  directories,
  log,
  writeFileSync,
  pwd: sempleAppDirectory,
});

// Clean up mock histories
afterEach(() => {
  logHistory.log = [];
  logHistory.latest = null;
  writeFileHistory.log = [];
  writeFileHistory.latest = null;
});

describe('help document', () => {
  it('should print help for --help', () => {
    main('--help');
    expect(logHistory.latest).toMatch('Script to generate the src/i18n/index.js');
  });

  it('should print help for -h', () => {
    main('-h');
    expect(logHistory.latest).toMatch('Script to generate the src/i18n/index.js');
  });
});

describe('error validation', () => {
  it('expects a list of directories', () => {
    main();
    expect(logHistory.log.join('\n')).toMatch('Script to generate the src/i18n/index.js'); // Print help error
    expect(logHistory.latest).toMatch('Error: A list of directories is required'); // Print error message
  });

  it('expects a directory with a relative path of "src/i18n"', () => {
    realMain({
      directories: ['frontend-app-example'],
      log,
      writeFileSync,
      pwd: path.join(__dirname), // __dirname === `scripts` which has no sub-dir `src/i18n`
    });

    expect(logHistory.log.join('\n')).toMatch('Script to generate the src/i18n/index.js'); // Print help on error
    expect(logHistory.latest).toMatch('Error: src/i18n directory was not found.'); // Print error message
  });
});

describe('generated files', () => {
  it('writes a correct src/i18n/index.js file', () => {
    main('frontend-component-singlelang', 'frontend-component-nolangs', 'frontend-component-emptylangs', 'frontend-app-sample');
    const mainFileActualContent = writeFileHistory.log.find(file => file.filename.endsWith('src/i18n/index.js')).content;

    const mainFileExpectedContent = `// This file is generated by the openedx/frontend-platform's "intl-import.js" script.
//
// Refer to the i18n documents in https://docs.openedx.org/en/latest/developers/references/i18n.html to update
// the file and use the Micro-frontend i18n pattern in new repositories.
//

import messagesFromFrontendComponentSinglelang from './messages/frontend-component-singlelang';
// Skipped import due to missing 'frontend-component-nolangs/index.js' likely due to empty translations..
// Skipped import due to missing 'frontend-component-emptylangs/index.js' likely due to empty translations..
import messagesFromFrontendAppSample from './messages/frontend-app-sample';

export default [
  messagesFromFrontendComponentSinglelang,
  messagesFromFrontendAppSample,
];
`;

    expect(mainFileActualContent).toEqual(mainFileExpectedContent);
  });

  it('writes a correct frontend-component-singlelang/index.js file', () => {
    main('frontend-component-singlelang', 'frontend-component-nolangs', 'frontend-component-emptylangs', 'frontend-app-sample');
    const mainFileActualContent = writeFileHistory.log.find(file => file.filename.endsWith('frontend-component-singlelang/index.js')).content;

    const singleLangExpectedContent = `// This file is generated by the openedx/frontend-platform's "intl-import.js" script.
//
// Refer to the i18n documents in https://docs.openedx.org/en/latest/developers/references/i18n.html to update
// the file and use the Micro-frontend i18n pattern in new repositories.
//

import messagesOfArLanguage from './ar.json';

export default {
  'ar': messagesOfArLanguage,
};
`;

    expect(mainFileActualContent).toEqual(singleLangExpectedContent);
  });

  it('writes a correct frontend-app-sample/index.js file', () => {
    main('frontend-component-singlelang', 'frontend-component-nolangs', 'frontend-component-emptylangs', 'frontend-app-sample');
    const mainFileActualContent = writeFileHistory.log.find(file => file.filename.endsWith('frontend-app-sample/index.js')).content;

    const singleLangExpectedContent = `// This file is generated by the openedx/frontend-platform's "intl-import.js" script.
//
// Refer to the i18n documents in https://docs.openedx.org/en/latest/developers/references/i18n.html to update
// the file and use the Micro-frontend i18n pattern in new repositories.
//

import messagesOfArLanguage from './ar.json';
// Note: Skipped empty 'eo.json' messages file.
import messagesOfEs419Language from './es_419.json';

export default {
  'ar': messagesOfArLanguage,
  'es-419': messagesOfEs419Language,
};
`;

    expect(mainFileActualContent).toEqual(singleLangExpectedContent);
  });
});

describe('list of generated index.js files', () => {
  it('writes only non-empty languages in addition to the main file', () => {
    main('frontend-component-singlelang', 'frontend-component-nolangs', 'frontend-component-emptylangs', 'frontend-app-sample');
    const writtenFiles = writeFileHistory.log
      .map(file => file.filename)
      .map(file => path.relative(sempleAppDirectory, file));
    expect(writtenFiles).toEqual([
      'src/i18n/messages/frontend-component-singlelang/index.js',
      'src/i18n/messages/frontend-app-sample/index.js',
      'src/i18n/index.js',
    ]);
  });
});
