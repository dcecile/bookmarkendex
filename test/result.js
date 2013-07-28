unitTest(findMatches, function(check) {
  function simplify(matches) {
    return matches.map(function(match) {
      return match.url;
    });
  }

  var bookmarks = [
    {
      url: 'http://one.net',
      title: 'purple site',
      parents: ['alpha', 'beta']
    },
    {
      url: 'http://two.net',
      title: 'orange site',
      parents: ['gamma']
    },
    {
      url: 'http://three.net',
      title: 'blue site',
      parents: ['delta']
    },
    {
      url: 'http://four.net',
      title: 'blue site',
      parents: ['delta', 'blue folder']
    }
  ];

  check('simple filter',
      [
        'http://one.net'
      ],
      simplify(findMatches(bookmarks, compileQueries('purple'))));

  check('simple nonmatch',
      [
      ],
      simplify(findMatches(bookmarks, compileQueries('burgundy'))));

  check('stable ordering',
      [
        'http://one.net',
        'http://two.net',
        'http://three.net',
        'http://four.net'
      ],
      simplify(findMatches(bookmarks, compileQueries('e'))));

  check('gap-based sorting',
      [
        'http://three.net',
        'http://four.net',
        'http://one.net'
      ],
      simplify(findMatches(bookmarks, compileQueries('ue'))));

  check('forced title match',
      [
        'http://two.net'
      ],
      simplify(findMatches(bookmarks, compileQueries('a'))));
});

unitTest(escapeXml, function(check) {
  check('simple escape',
      '&#x61;&#x62;&#x63;',
      escapeXml('abc'));
});

unitTest(formatMatchedLetters, function(check) {
  check('one letter match',
      '&#x61;<match>&#x62;</match>&#x63;',
      formatMatchedLetters({
        text: 'abc',
        flags: [false, true, false]
      }));

  check('nonmatch',
      '&#x61;&#x62;&#x63;',
      formatMatchedLetters({
        text: 'abc',
        flags: [false, false, false]
      }));

  check('consecutive letter match',
      '<match>&#x61;&#x62;</match>&#x63;',
      formatMatchedLetters({
        text: 'abc',
        flags: [true, true, false]
      }));
});

unitTest(formatResults, function(check) {
  check('parented and non-parented',
      [
        {
          url: 'http://o',
          description:
            '<match>&#x70;</match> <dim>-</dim>' +
            ' <url>&#x68;&#x74;&#x74;&#x70;&#x3a;&#x2f;&#x2f;&#x6f;</url>' +
            '<dim> - &#x61; / <match>&#x62;</match></dim>'
        },
        {
          url: 'http://t',
          description:
            '<match>&#x71;</match> <dim>-</dim>' +
            ' <url>&#x68;&#x74;&#x74;&#x70;&#x3a;&#x2f;&#x2f;&#x74;</url>'
        }
      ],
      formatResults([
        {
          url: 'http://o',
          title: {
            text: 'p',
            flags: [true]
          },
          parents: [
            {
              text: 'a',
              flags: [false]
            },
            {
              text: 'b',
              flags: [true]
            }
          ]
        },
        {
          url: 'http://t',
          title: {
            text: 'q',
            flags: [true]
          },
          parents: []
        }
      ]));
});
