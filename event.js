var previousMatches = [];

function navigate(url) {
  chrome.tabs.update(null, { url: url });
}

function setDefaultSuggestion(description) {
  chrome.omnibox.setDefaultSuggestion({ description: description });
}

function showHelp() {
  setDefaultSuggestion('Enter a bookmark title');
  previousMatches = [];
}

chrome.omnibox.onInputStarted.addListener(function() {
  showHelp();
});

var latestSearchToken = null;

function updateResults(query, suggest) {
  if (!query) {
    showHelp();
  }
  else
  {
    var currentSearchToken = {};
    latestSearchToken = currentSearchToken;

    getAllBookmarks(function(bookmarks) {
      if (currentSearchToken !== latestSearchToken) {
        return;
      }

      var matches = formatResults(findMatches(bookmarks, query));

      if (matches.length === 0) {
        setDefaultSuggestion('No bookmarks found for <match>%s</match>');
      }
      else {
        setDefaultSuggestion(matches[0].description);

        suggest(matches.slice(1).map(function(match) {
          return {
            content: match.url,
            description: match.description
          };
        }));
      }

      previousMatches = matches;
    });
  }
}

chrome.omnibox.onInputChanged.addListener(updateResults);

chrome.omnibox.onInputEntered.addListener(function(text) {
  if (previousMatches.length > 0) {
    var urlPicked = previousMatches.some(function(match) {
      return match.url === text;
    });

    if (urlPicked) {
      // This event can get fired with either a full URL (from the suggestion
      // 'content' property) if the user selects a specific suggestion
      navigate(text);
    }
    else {
      // It can also get fired with the user's current query string when
      // the user selects the default suggestion
      navigate(previousMatches[0].url);
    }
  }
});

chrome.bookmarks.onChanged.addListener(function() {
  updateBookmarksCache();
});

chrome.bookmarks.onMoved.addListener(function() {
  updateBookmarksCache();
});

chrome.bookmarks.onRemoved.addListener(function() {
  updateBookmarksCache();
});

var bookmarkImportInProgress = false;
chrome.bookmarks.onCreated.addListener(function() {
  if (!bookmarkImportInProgress) {
    updateBookmarksCache();
  }
});

chrome.bookmarks.onImportBegan.addListener(function() {
  bookmarkImportInProgress = true;
});

chrome.bookmarks.onImportEnded.addListener(function() {
  bookmarkImportInProgress = false;
  updateBookmarksCache();
});

chrome.runtime.onInstalled.addListener(function(details) {
  console.log('Installation event:', details.reason, details.previousVersion);
  runAllUnitTests();
});
