function findMatches(bookmarks, fullQuery) {
  // TODO: decide if queries can overlap
  var queries = fullQuery.split(' ').
      filter(function(query) { return query != ''; }).
      map(function(query) { return convertQueryToRegExp(query); });

  var searchResults = bookmarks.map(function(bookmark) {
    return searchOneBookmark(bookmark, queries);
  });

  var positiveResults = searchResults.filter(function(result) {
    var overallSuccesses = { count: 0 };

    var recordSuccesses = function(search) {
      search.successes.forEach(function(success) {
        overallSuccesses[success] = true;
        overallSuccesses.count += 1;
      });
    };

    recordSuccesses(result.title);

    if (overallSuccesses.count > 0) {
      result.parents.forEach(recordSuccesses);
    }

    return queries.every(function(query) {
      return overallSuccesses[query];
    });
  });

  return positiveResults;
}

function escapeXml(text) {
  // Because JavaScript does not have builtin XML escaping
  // APIs (besides the DOM), just escape everything in hex
  return text.split('').map(function(letter) {
    return '&#x' + letter.charCodeAt(0).toString(16) + ';';
  }).join('');
}

function formatMatchedLetters(search) {
  var result = '';

  var currentlyMatching = false;

  search.flags.forEach(function(flag, i) {
    if (!currentlyMatching && flag) {
      result += '<match>';
    }
    else if (currentlyMatching && !flag) {
      result += '</match>';
    }
    result += escapeXml(search.text[i]);
    currentlyMatching = flag;
  });

  if (currentlyMatching) {
    result += '</match>';
  }

  return result;
}

function formatResults(positiveResults) {
  return positiveResults.map(function(result) {
    var description = formatMatchedLetters(result.title) +
        ' <dim>-</dim> <url>' + escapeXml(result.url) + '</url>';

    if (result.parents.length > 0) {
      description += '<dim> - ' +
          result.parents.map(formatMatchedLetters).join(' / ') + '</dim>';
    }

    return {
      url: result.url,
      description: description
    };
  });
}
