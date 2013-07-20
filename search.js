var convertQueryToRegExp = function (query) {
  var letters = query.split('');

  var escapedLetters = query.split('').map(function (letter) {
    return '\\u' + ('0000' + letter.charCodeAt(0).toString(16)).slice(-4);
  });

  // TODO: don't bother matching the start (it greedily pushes the search back)
  var regex = RegExp(
    '^(.*)' + escapedLetters.join('(\\S*?)'),
    'i');
  regex.letters = letters;

  return regex;
};

var initFlags = function (text) {
  var flags = [];

  for (var i = 0; i < text.length; i += 1) {
    flags.push(false);
  }

  return flags;
};

var updateMatchedLetters = function (text, flags, successes, query) {
  var unmatchedText = query.exec(text);

  if (unmatchedText) {
    var j = 0;

    query.letters.forEach(function (letter, i) {
      j += unmatchedText[i + 1].length;

      for (var k = 0; k < letter.length; k += 1, j += 1) {
        flags[j] = true;
      }
    });

    successes.push(query);
  }
};

var findMatchedLetters = function (queries) {
  return function (text) {
    var flags = initFlags(text);
    var successes = [];

    queries.forEach(function (query) {
      updateMatchedLetters(text, flags, successes, query);
    });

    return { text: text, flags: flags, successes: successes };
  };
};

var searchOneBookmark = function (bookmark, queries) {
  // TODO: run the queries on the whole name, not each word
  return {
    url: bookmark.url,
    title: bookmark.title.split(' ').map(findMatchedLetters(queries)),
    parents: bookmark.parents.map(function (parentTitle) {
      return parentTitle.split(' ').map(findMatchedLetters(queries));
    })
  };
};
