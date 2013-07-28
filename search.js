function compileOneQuery(query) {
  var letters = query.split('');

  var escapedLetters = query.split('').map(function(letter) {
    return '\\u' + ('0000' + letter.charCodeAt(0).toString(16)).slice(-4);
  });

  return {
    exactText: query,
    letters: letters,
    directRegex: RegExp(escapedLetters.join(''), 'i'),
    indirectRegex: RegExp(escapedLetters.join('(.*?)'), 'i')
  };
}

function compileQueries(fullQuery) {
  return fullQuery.split(' ').
      filter(function(query) { return query != ''; }).
      map(function(query) { return compileOneQuery(query); });
}

function searchOneField(text, queries) {
  function initFlags(text) {
    var flags = [];

    for (var i = 0; i < text.length; i += 1) {
      flags.push(false);
    }

    return flags;
  }

  function updateMatchedLetters(
      text, flags, directSuccesses, indirectSuccesses, query) {
    var directMatch = query.directRegex.exec(text);

    if (directMatch) {
      var textIndex = directMatch.index;

      for (var i = 0; i < query.exactText.length; i += 1) {
        flags[textIndex] = true;
        textIndex += 1;
      }

      directSuccesses.push(query);
    }
    else {
      var indirectMatch = query.indirectRegex.exec(text);

      if (indirectMatch) {
        var textIndex = indirectMatch.index;
        var unmatchedSections = indirectMatch.slice(1);

        query.letters.forEach(function(queryLetter, sectionIndex) {
          for (var i = 0; i < queryLetter.length; i += 1) {
            flags[textIndex] = true;
            textIndex += 1;
          }

          if (sectionIndex < unmatchedSections.length) {
            textIndex += unmatchedSections[sectionIndex].length;
          }
        });

        indirectSuccesses.push(query);
      }
    }
  }

  var flags = initFlags(text);
  var directSuccesses = [];
  var indirectSuccesses = [];

  queries.forEach(function(query) {
    updateMatchedLetters(
        text, flags, directSuccesses, indirectSuccesses, query);
  });

  return {
    text: text,
    flags: flags,
    directSuccesses: directSuccesses,
    indirectSuccesses: indirectSuccesses
  };
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
