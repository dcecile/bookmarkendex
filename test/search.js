unitTest(convertQueryToRegExp, function(check) {
  check('single letter',
      '/\\u0061/i',
      convertQueryToRegExp('a').toString());

  check('single term',
      '/\\u0061(.*?)\\u0062(.*?)\\u0063/i',
      convertQueryToRegExp('abc').toString());
});

unitTest(searchOneField, function(check) {
  function makeFlags(template) {
    return template.split('').map(function(letter) {
      return letter === ' ' ? false : true;
    });
  }

  var singleLetterQuery = /u/i;
  singleLetterQuery.letters = ['u'];

  var multipleLetterQuery = /a(.*?)t(.*?)e/i;
  multipleLetterQuery.letters = ['a', 't', 'e'];

  check('single letter match',
      {
        text: 'buck',
        flags: makeFlags(' u  '),
        successes: [singleLetterQuery]
      },
      searchOneField('buck', [singleLetterQuery]));

  check('single letter nonmatch',
      {
        text: 'back',
        flags: makeFlags('    '),
        successes: []
      },
      searchOneField('back', [singleLetterQuery]));

  check('multiple letter consecutive match',
      {
        text: 'skated',
        flags: makeFlags('  ate '),
        successes: [multipleLetterQuery]
      },
      searchOneField('skated', [multipleLetterQuery]));

  check('multiple letter gaps match',
      {
        text: 'watches',
        flags: makeFlags(' at  e '),
        successes: [multipleLetterQuery]
      },
      searchOneField('watches', [multipleLetterQuery]));

  check('multiple letter incorrect gaps match',
      {
        text: 'abate',
        flags: makeFlags('a  te'),
        successes: [multipleLetterQuery]
      },
      searchOneField('abate', [multipleLetterQuery]));

  check('multiple letter nonmatch',
      {
        text: 'amidst',
        flags: makeFlags('      '),
        successes: []
      },
      searchOneField('amidst', [multipleLetterQuery]));

  check('case insensitive match',
      {
        text: 'BUCK',
        flags: makeFlags(' U  '),
        successes: [singleLetterQuery]
      },
      searchOneField('BUCK', [singleLetterQuery]));

  check('first match',
      {
        text: 'autumn',
        flags: makeFlags(' u    '),
        successes: [singleLetterQuery]
      },
      searchOneField('autumn', [singleLetterQuery]));

  check('cross-word match',
      {
        text: 'a tree',
        flags: makeFlags('a t e '),
        successes: [multipleLetterQuery]
      },
      searchOneField('a tree', [multipleLetterQuery]));

  check('multiple query full in-order match',
      {
        text: 'circulate',
        flags: makeFlags('    u ate'),
        successes: [singleLetterQuery, multipleLetterQuery]
      },
      searchOneField('circulate', [singleLetterQuery, multipleLetterQuery]));

  check('multiple query full out-of-order match',
      {
        text: 'wasteful',
        flags: makeFlags(' a te u '),
        successes: [singleLetterQuery, multipleLetterQuery]
      },
      searchOneField('wasteful', [singleLetterQuery, multipleLetterQuery]));

  check('multiple query full overlapping match',
      {
        text: 'abstruse',
        flags: makeFlags('a  t u e'),
        successes: [singleLetterQuery, multipleLetterQuery]
      },
      searchOneField('abstruse', [singleLetterQuery, multipleLetterQuery]));

  check('multiple query nonmatch',
      {
        text: 'amidst',
        flags: makeFlags('      '),
        successes: []
      },
      searchOneField('amidst', [singleLetterQuery, multipleLetterQuery]));
});

unitTest(searchOneBookmark, function(check) {
  function makeFlags(template) {
    return template.split('').map(function(letter) {
      return letter === ' ' ? false : true;
    });
  }

  var bookmark = {
    url: 'http://one.net',
    title: 'purple site',
    parents: ['alpha', 'beta']
  };

  var queryPurple = /p(.*?)u(.*?)r(.*?)p(.*?)l(.*?)e/i;
  queryPurple.letters = 'purple'.split('');

  var queryOne = /o(.*?)n(.*?)e/i;
  queryOne.letters = 'one'.split('');

  var queryE = /e/i;
  queryE.letters = 'e'.split('');

  var queryPh = /p(.*?)h/i;
  queryPh.letters = 'ph'.split('');

  var queryPs = /p(.*?)s/i;
  queryPs.letters = 'ps'.split('');

  check('simple title match',
      {
        url: 'http://one.net',
        title: {
          text: 'purple site',
          flags: makeFlags('purple     '),
          successes: [queryPurple]
        },
        parents: [
          {
            text: 'alpha',
            flags: makeFlags('     '),
            successes: []
          },
          {
            text: 'beta',
            flags: makeFlags('    '),
            successes: []
          }
        ]
      },
      searchOneBookmark(bookmark, [queryPurple]));

  check('url impossible match',
      {
        url: 'http://one.net',
        title: {
          text: 'purple site',
          flags: makeFlags('           '),
          successes: []
        },
        parents: [
          {
            text: 'alpha',
            flags: makeFlags('     '),
            successes: []
          },
          {
            text: 'beta',
            flags: makeFlags('    '),
            successes: []
          }
        ]
      },
      searchOneBookmark(bookmark, [queryOne]));

  check('duplicate match',
      {
        url: 'http://one.net',
        title: {
          text: 'purple site',
          flags: makeFlags('     e     '),
          successes: [queryE]
        },
        parents: [
          {
            text: 'alpha',
            flags: makeFlags('     '),
            successes: []
          },
          {
            text: 'beta',
            flags: makeFlags(' e  '),
            successes: [queryE]
          }
        ]
      },
      searchOneBookmark(bookmark, [queryE]));

  check('title and parent match',
      {
        url: 'http://one.net',
        title: {
          text: 'purple site',
          flags: makeFlags('purple     '),
          successes: [queryPurple]
        },
        parents: [
          {
            text: 'alpha',
            flags: makeFlags('  ph '),
            successes: [queryPh]
          },
          {
            text: 'beta',
            flags: makeFlags('    '),
            successes: []
          }
        ]
      },
      searchOneBookmark(bookmark, [queryPurple, queryPh]));

  check('cross-word match',
      {
        url: 'http://one.net',
        title: {
          text: 'purple site',
          flags: makeFlags('p      s   '),
          successes: [queryPs]
        },
        parents: [
          {
            text: 'alpha',
            flags: makeFlags('     '),
            successes: []
          },
          {
            text: 'beta',
            flags: makeFlags('    '),
            successes: []
          }
        ]
      },
      searchOneBookmark(bookmark, [queryPs]));
});
