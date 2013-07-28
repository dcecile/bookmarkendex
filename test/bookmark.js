unitTest(flattenBookmarksTree, function(check) {
  function makeFolder(name, children) {
    return {
      title: name,
      children: children
    };
  }

  function makeBookmark(domain) {
    return {
      url: 'http://' + domain + '.net',
      title: 'The ' + domain + ' site'
    };
  }

  function makeResult(domain, parents) {
    return {
      url: 'http://' + domain + '.net',
      title: 'The ' + domain + ' site',
      parents: parents
    };
  }

  check('simple flatten',
      [
        makeResult('alpha', []),
        makeResult('beta', [])
      ],
      flattenBookmarksTree([
        makeFolder('', [
          makeFolder('Other Bookmarks', [
            makeBookmark('alpha'),
            makeBookmark('beta')
          ])
        ])
      ]));

  check('no sorting',
      [
        makeResult('beta', []),
        makeResult('alpha', [])
      ],
      flattenBookmarksTree([
        makeFolder('', [
          makeFolder('Other Bookmarks', [
            makeBookmark('beta'),
            makeBookmark('alpha')
          ])
        ])
      ]));

  check('multi-branch flatten',
      [
        makeResult('alpha', []),
        makeResult('beta', ['one', 'two']),
        makeResult('gamma', ['one', 'two']),
        makeResult('delta', ['one', 'two']),
        makeResult('epsilon', ['one']),
        makeResult('zeta', []),
        makeResult('eta', ['three']),
        makeResult('theta', ['three'])
      ],
      flattenBookmarksTree([
        makeFolder('', [
          makeFolder('Other Bookmarks', [
            makeBookmark('alpha'),
            makeFolder('one', [
              makeFolder('two', [
                makeBookmark('beta'),
                makeBookmark('gamma'),
                makeBookmark('delta')
              ]),
              makeBookmark('epsilon')
            ]),
            makeBookmark('zeta'),
            makeFolder('three', [
              makeBookmark('eta'),
              makeBookmark('theta')
            ])
          ])
        ])
      ]));
});
