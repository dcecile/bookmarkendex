unitTest(convertQueryToRegExp, function(check) {
  check('single letter',
      '/\\u0061/i',
      convertQueryToRegExp('a').toString());

  check('single term',
      '/\\u0061(\\S*?)\\u0062(\\S*?)\\u0063/i',
      convertQueryToRegExp('abc').toString());
});

unitTest(searchOneWord, function(check) {
  var singleLetterQuery = /u/i;
  singleLetterQuery.letters = ['u'];

  var multipleLetterQuery = /a(\S*?)t(\S*?)e/i;
  multipleLetterQuery.letters = ['a', 't', 'e'];

  check('single letter match',
      {
        text: 'buck',
        flags: [false, true, false, false],
        successes: [singleLetterQuery]
      },
      searchOneWord([singleLetterQuery])('buck'));

  check('single letter nonmatch',
      {
        text: 'back',
        flags: [false, false, false, false],
        successes: []
      },
      searchOneWord([singleLetterQuery])('back'));

  check('multiple letter consecutive match',
      {
        text: 'skated',
        flags: [false, false, true, true, true, false],
        successes: [multipleLetterQuery]
      },
      searchOneWord([multipleLetterQuery])('skated'));

  check('multiple letter gaps match',
      {
        text: 'watches',
        flags: [false, true, true, false, false, true, false],
        successes: [multipleLetterQuery]
      },
      searchOneWord([multipleLetterQuery])('watches'));

  check('multiple letter nonmatch',
      {
        text: 'amidst',
        flags: [false, false, false, false, false, false],
        successes: []
      },
      searchOneWord([multipleLetterQuery])('amidst'));

  check('case insensitive match',
      {
        text: 'BUCK',
        flags: [false, true, false, false],
        successes: [singleLetterQuery]
      },
      searchOneWord([singleLetterQuery])('BUCK'));

  check('first match',
      {
        text: 'autumn',
        flags: [false, true, false, false, false, false],
        successes: [singleLetterQuery]
      },
      searchOneWord([singleLetterQuery])('autumn'));

  check('multiple query full in-order match',
      {
        text: 'circulate',
        flags: [false, false, false, false, true, false, true, true, true],
        successes: [singleLetterQuery, multipleLetterQuery]
      },
      searchOneWord([singleLetterQuery, multipleLetterQuery])('circulate'));

  check('multiple query full out-of-order match',
      {
        text: 'wasteful',
        flags: [false, true, false, true, true, false, true, false],
        successes: [singleLetterQuery, multipleLetterQuery]
      },
      searchOneWord([singleLetterQuery, multipleLetterQuery])('wasteful'));

  check('multiple query full overlapping match',
      {
        text: 'abstruse',
        flags: [true, false, false, true, false, true, false, true],
        successes: [singleLetterQuery, multipleLetterQuery]
      },
      searchOneWord([singleLetterQuery, multipleLetterQuery])('abstruse'));

  check('multiple query nonmatch',
      {
        text: 'amidst',
        flags: [false, false, false, false, false, false],
        successes: []
      },
      searchOneWord([singleLetterQuery, multipleLetterQuery])('amidst'));
});

unitTest(searchOneBookmark, function(check) {
  var bookmark = {
    url: 'http://one.net',
    title: 'purple site',
    parents: ['alpha', 'beta']
  };

  var queryPurple = /p(\S*?)u(\S*?)r(\S*?)p(\S*?)l(\S*?)e/i;
  queryPurple.letters = 'purple'.split('');

  var queryOne = /o(\S*?)n(\S*?)e/i;
  queryOne.letters = 'one'.split('');

  var queryE = /e/i;
  queryE.letters = 'e'.split('');

  var queryPh = /p(\S*?)h/i;
  queryPh.letters = 'ph'.split('');

  check('simple title match',
      {
        url: 'http://one.net',
        title: [
          {
            text: 'purple',
            flags: [true, true, true, true, true, true],
            successes: [queryPurple]
          },
          {
            text: 'site',
            flags: [false, false, false, false],
            successes: []
          }
        ],
        parents: [
          [{
            text: 'alpha',
            flags: [false, false, false, false, false],
            successes: []
          }],
          [{
            text: 'beta',
            flags: [false, false, false, false],
            successes: []
          }]
        ]
      },
      searchOneBookmark(bookmark, [queryPurple]));

  check('url impossible match',
      {
        url: 'http://one.net',
        title: [
          {
            text: 'purple',
            flags: [false, false, false, false, false, false],
            successes: []
          },
          {
            text: 'site',
            flags: [false, false, false, false],
            successes: []
          }
        ],
        parents: [
          [{
            text: 'alpha',
            flags: [false, false, false, false, false],
            successes: []
          }],
          [{
            text: 'beta',
            flags: [false, false, false, false],
            successes: []
          }]
        ]
      },
      searchOneBookmark(bookmark, [queryOne]));

  check('duplicate match',
      {
        url: 'http://one.net',
        title: [
          {
            text: 'purple',
            flags: [false, false, false, false, false, true],
            successes: [queryE]
          },
          {
            text: 'site',
            flags: [false, false, false, true],
            successes: [queryE]
          }
        ],
        parents: [
          [{
            text: 'alpha',
            flags: [false, false, false, false, false],
            successes: []
          }],
          [{
            text: 'beta',
            flags: [false, true, false, false],
            successes: [queryE]
          }]
        ]
      },
      searchOneBookmark(bookmark, [queryE]));

  check('title and parent match',
      {
        url: 'http://one.net',
        title: [
          {
            text: 'purple',
            flags: [true, true, true, true, true, true],
            successes: [queryPurple]
          },
          {
            text: 'site',
            flags: [false, false, false, false],
            successes: []
          }
        ],
        parents: [
          [{
            text: 'alpha',
            flags: [false, false, true, true, false],
            successes: [queryPh]
          }],
          [{
            text: 'beta',
            flags: [false, false, false, false],
            successes: []
          }]
        ]
      },
      searchOneBookmark(bookmark, [queryPurple, queryPh]));
});
