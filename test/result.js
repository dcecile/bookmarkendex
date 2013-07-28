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
    }
  ];

  check('simple filter',
      [
        'http://one.net'
      ],
      simplify(findMatches(bookmarks, 'purple')));

  check('simple nonmatch',
      [
      ],
      simplify(findMatches(bookmarks, 'burgundy')));

  check('stable ordering',
      [
        'http://one.net',
        'http://two.net',
        'http://three.net'
      ],
      simplify(findMatches(bookmarks, 'e')));

  check('no gap-based sorting',
      [
        'http://one.net',
        'http://three.net'
      ],
      simplify(findMatches(bookmarks, 'ue')));
});

unitTest(escapeXml, function(check) {
  check('simple escape',
      '&#x61;&#x62;&#x63;',
      escapeXml('abc'));
});

unitTest(formatMatchedLetters, function(check) {
  check('one letter match',
      '&#x61;<match>&#x62;</match>&#x63;',
      formatMatchedLetters([{
        text: 'abc',
        flags: [false, true, false]
      }]));

  check('nonmatch',
      '&#x61;&#x62;&#x63;',
      formatMatchedLetters([{
        text: 'abc',
        flags: [false, false, false]
      }]));

  check('consecutive letter match',
      '<match>&#x61;&#x62;</match>&#x63;',
      formatMatchedLetters([{
        text: 'abc',
        flags: [true, true, false]
      }]));

  check('word joining',
      '&#x61;<match>&#x62;</match>&#x63; <match>&#x64;</match>',
      formatMatchedLetters([
        {
          text: 'abc',
          flags: [false, true, false]
        },
        {
          text: 'd',
          flags: [true]
        }
      ]));
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
          title: [
            {
              text: 'p',
              flags: [true]
            }
          ],
          parents: [
            [{
              text: 'a',
              flags: [false]
            }],
            [{
              text: 'b',
              flags: [true]
            }]
          ]
        },
        {
          url: 'http://t',
          title: [
            {
              text: 'q',
              flags: [true]
            }
          ],
          parents: []
        }
      ]));
});
