function convertQueryToRegExp(query) {
  var letters = query.split('');

  var escapedLetters = query.split('').map(function(letter) {
    return '\\u' + ('0000' + letter.charCodeAt(0).toString(16)).slice(-4);
  });

  var regex = RegExp(
      escapedLetters.join('(.*?)'),
      'i');
  regex.letters = letters;

  return regex;
}

function searchOneField(text, queries) {
  function initFlags(text) {
    var flags = [];

    for (var i = 0; i < text.length; i += 1) {
      flags.push(false);
    }

    return flags;
  }

  function updateMatchedLetters(text, flags, successes, query) {
    var unmatchedSections = query.exec(text);

    if (unmatchedSections) {
      var textIndex = unmatchedSections.index;

      query.letters.forEach(function(queryLetter, sectionIndex) {
        for (var i = 0; i < queryLetter.length; i += 1) {
          flags[textIndex] = true;
          textIndex += 1;
        }

        if (sectionIndex < unmatchedSections.length - 1) {
          textIndex += unmatchedSections[sectionIndex + 1].length;
        }
      });

      successes.push(query);
    }
  }

  var flags = initFlags(text);
  var successes = [];

  queries.forEach(function(query) {
    updateMatchedLetters(text, flags, successes, query);
  });

  return { text: text, flags: flags, successes: successes };
}

function searchOneBookmark(bookmark, queries) {
  return {
    url: bookmark.url,
    title: searchOneField(bookmark.title, queries),
    parents: bookmark.parents.map(function(parentTitle) {
      return searchOneField(parentTitle, queries);
    })
  };
}
