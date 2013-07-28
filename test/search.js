unitTest(compileOneQuery, function(check) {
  function transform(query) {
    query.directRegex = query.directRegex.toString();
    query.indirectRegex = query.indirectRegex.toString();
    return query;
  }

  check('single letter',
      {
        exactText: 'a',
        letters: ['a'],
        directRegex: '/\\u0061/i',
        indirectRegex: '/\\u0061/i'
      },
      transform(compileOneQuery('a')));

  check('single term',
      {
        exactText: 'abc',
        letters: ['a', 'b', 'c'],
        directRegex: '/\\u0061\\u0062\\u0063/i',
        indirectRegex: '/\\u0061(.*?)\\u0062(.*?)\\u0063/i'
      },
      transform(compileOneQuery('abc')));
});

unitTest(compileQueries, function(check) {
  function transform(queries) {
    queries.forEach(function(query) {
      query.directRegex = query.directRegex.toString();
      query.indirectRegex = query.indirectRegex.toString();
      return query;
    });
    return queries;
  }

  check('single term',
      [
        {
          exactText: 'abc',
          letters: ['a', 'b', 'c'],
          directRegex: '/\\u0061\\u0062\\u0063/i',
          indirectRegex: '/\\u0061(.*?)\\u0062(.*?)\\u0063/i'
        }
      ],
      transform(compileQueries('abc')));

  check('multiple terms',
      [
        {
          exactText: 'abc',
          letters: ['a', 'b', 'c'],
          directRegex: '/\\u0061\\u0062\\u0063/i',
          indirectRegex: '/\\u0061(.*?)\\u0062(.*?)\\u0063/i'
        },
        {
          exactText: 'de',
          letters: ['d', 'e'],
          directRegex: '/\\u0064\\u0065/i',
          indirectRegex: '/\\u0064(.*?)\\u0065/i'
        }
      ],
      transform(compileQueries(' abc  de ')));
});

unitTest(searchOneField, function(check) {
  function makeFlags(template) {
    return template.split('').map(function(letter) {
      return letter === ' ' ? false : true;
    });
  }

  var singleLetterQuery = compileOneQuery('u');

  var multipleLetterQuery = compileOneQuery('ate');

  check('single letter match',
      {
        text: 'buck',
        flags: makeFlags(' u  '),
        directSuccesses: [singleLetterQuery],
        indirectSuccesses: []
      },
      searchOneField('buck', [singleLetterQuery]));

  check('single letter nonmatch',
      {
        text: 'back',
        flags: makeFlags('    '),
        directSuccesses: [],
        indirectSuccesses: []
      },
      searchOneField('back', [singleLetterQuery]));

  check('multiple letter consecutive match',
      {
        text: 'skated',
        flags: makeFlags('  ate '),
        directSuccesses: [multipleLetterQuery],
        indirectSuccesses: []
      },
      searchOneField('skated', [multipleLetterQuery]));

  check('multiple letter gaps match',
      {
        text: 'watches',
        flags: makeFlags(' at  e '),
        directSuccesses: [],
        indirectSuccesses: [multipleLetterQuery]
      },
      searchOneField('watches', [multipleLetterQuery]));

  check('multiple letter optimal gaps match',
      {
        text: 'abate',
        flags: makeFlags('  ate'),
        directSuccesses: [multipleLetterQuery],
        indirectSuccesses: []
      },
      searchOneField('abate', [multipleLetterQuery]));

  check('multiple letter nonmatch',
      {
        text: 'amidst',
        flags: makeFlags('      '),
        directSuccesses: [],
        indirectSuccesses: []
      },
      searchOneField('amidst', [multipleLetterQuery]));

  check('case insensitive match',
      {
        text: 'BUCK',
        flags: makeFlags(' U  '),
        directSuccesses: [singleLetterQuery],
        indirectSuccesses: []
      },
      searchOneField('BUCK', [singleLetterQuery]));

  check('first match',
      {
        text: 'autumn',
        flags: makeFlags(' u    '),
        directSuccesses: [singleLetterQuery],
        indirectSuccesses: []
      },
      searchOneField('autumn', [singleLetterQuery]));

  check('cross-word match',
      {
        text: 'a tree',
        flags: makeFlags('a t e '),
        directSuccesses: [],
        indirectSuccesses: [multipleLetterQuery]
      },
      searchOneField('a tree', [multipleLetterQuery]));

  check('multiple query full in-order match',
      {
        text: 'circulate',
        flags: makeFlags('    u ate'),
        directSuccesses: [singleLetterQuery, multipleLetterQuery],
        indirectSuccesses: []
      },
      searchOneField('circulate', [singleLetterQuery, multipleLetterQuery]));

  check('multiple query full out-of-order match',
      {
        text: 'wasteful',
        flags: makeFlags(' a te u '),
        directSuccesses: [singleLetterQuery],
        indirectSuccesses: [multipleLetterQuery]
      },
      searchOneField('wasteful', [singleLetterQuery, multipleLetterQuery]));

  check('multiple query full overlapping match',
      {
        text: 'abstruse',
        flags: makeFlags('a  t u e'),
        directSuccesses: [singleLetterQuery],
        indirectSuccesses: [multipleLetterQuery]
      },
      searchOneField('abstruse', [singleLetterQuery, multipleLetterQuery]));

  check('multiple query nonmatch',
      {
        text: 'amidst',
        flags: makeFlags('      '),
        directSuccesses: [],
        indirectSuccesses: []
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

  var queryPurple = compileOneQuery('purple');

  var queryOne = compileOneQuery('exactText');

  var queryE = compileOneQuery('e');

  var queryPh = compileOneQuery('ph');

  var queryPs = compileOneQuery('ps');

  check('simple title match',
      {
        url: 'http://one.net',
        title: {
          text: 'purple site',
          flags: makeFlags('purple     '),
          directSuccesses: [queryPurple],
          indirectSuccesses: []
        },
        parents: [
          {
            text: 'alpha',
            flags: makeFlags('     '),
            directSuccesses: [],
            indirectSuccesses: []
          },
          {
            text: 'beta',
            flags: makeFlags('    '),
            directSuccesses: [],
            indirectSuccesses: []
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
          directSuccesses: [],
          indirectSuccesses: []
        },
        parents: [
          {
            text: 'alpha',
            flags: makeFlags('     '),
            directSuccesses: [],
            indirectSuccesses: []
          },
          {
            text: 'beta',
            flags: makeFlags('    '),
            directSuccesses: [],
            indirectSuccesses: []
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
          directSuccesses: [queryE],
          indirectSuccesses: []
        },
        parents: [
          {
            text: 'alpha',
            flags: makeFlags('     '),
            directSuccesses: [],
            indirectSuccesses: []
          },
          {
            text: 'beta',
            flags: makeFlags(' e  '),
            directSuccesses: [queryE],
            indirectSuccesses: []
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
          directSuccesses: [queryPurple],
          indirectSuccesses: []
        },
        parents: [
          {
            text: 'alpha',
            flags: makeFlags('  ph '),
            directSuccesses: [queryPh],
            indirectSuccesses: []
          },
          {
            text: 'beta',
            flags: makeFlags('    '),
            directSuccesses: [],
            indirectSuccesses: []
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
          directSuccesses: [],
          indirectSuccesses: [queryPs]
        },
        parents: [
          {
            text: 'alpha',
            flags: makeFlags('     '),
            directSuccesses: [],
            indirectSuccesses: []
          },
          {
            text: 'beta',
            flags: makeFlags('    '),
            directSuccesses: [],
            indirectSuccesses: []
          }
        ]
      },
      searchOneBookmark(bookmark, [queryPs]));
});
