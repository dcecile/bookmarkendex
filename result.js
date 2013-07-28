function findMatches(bookmarks, queries) {
  var searchResults = bookmarks.map(function(bookmark, originalIndex) {
    var search = searchOneBookmark(bookmark, queries);

    var directSuccesses = [];
    var indirectSuccesses = [];

    // Only register a match if there a match in the title
    if (search.title.directSuccesses.length > 0 ||
        search.title.indirectSuccesses.length > 0) {

      function addSuccesses(fieldSuccesses, overallSuccesses) {
        fieldSuccesses.forEach(function(success) {
          overallSuccesses.push(success);
        });
      }

      function recordSuccesses(field) {
        addSuccesses(field.directSuccesses, directSuccesses);
        addSuccesses(field.indirectSuccesses, indirectSuccesses);
      };

      // Record each match in a title or parent folder
      recordSuccesses(search.title);
      search.parents.forEach(recordSuccesses);
    }

    function removeDuplicates(original) {
      return original.reduce(
          function(unique, current) {
            return unique.indexOf(current) < 0 ?
                unique.concat([current]) :
                unique;
          },
          []);
    }

    // Summarize all of the successful matches
    directSuccesses = removeDuplicates(directSuccesses);
    indirectSuccesses = removeDuplicates(indirectSuccesses);
    var allSuccesses = removeDuplicates(
        directSuccesses.concat(indirectSuccesses));

    return {
      originalIndex: originalIndex,
      search: search,
      directSuccesses: directSuccesses,
      indirectSuccesses: indirectSuccesses,
      allSuccesses: allSuccesses
    };
  });

  var positiveResults = searchResults.filter(function(result) {
    return result.allSuccesses.length === queries.length;
  });

  positiveResults.sort(function(resultA, resultB) {
    // Sort first based on number of direct success matches
    if (resultA.directSuccesses.length > resultB.directSuccesses.length) {
      return -1;
    }
    else if (resultA.directSuccesses.length < resultB.directSuccesses.length) {
      return +1;
    }
    else {
      // Then, preserve the original bookmark order
      if (resultA.originalIndex < resultB.originalIndex) {
        return -1;
      }
      else {
        return +1;
      }
    }
  });

  return positiveResults.map(function(result) { return result.search; });
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
