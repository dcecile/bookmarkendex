var previousMatches = [];

function navigate(url) {
  chrome.tabs.update(null, { url: url });
};

function setDefaultSuggestion(description) {
  chrome.omnibox.setDefaultSuggestion({ description: description });
};

function showHelp() {
  setDefaultSuggestion('Enter a bookmark title');
  previousMatches = [];
}

chrome.omnibox.onInputStarted.addListener(function () {
  showHelp();
});

var latestSearchToken = null;

var updateResults = function (query, suggest) {
  if (!query) {
    showHelp();
  }
  else
  {
    console.time('onInputChanged');
    var currentSearchToken = {};
    latestSearchToken = currentSearchToken;

    getAllBookmarks(function (bookmarks) {
      if (currentSearchToken !== latestSearchToken) {
        return;
      }

      var matches = findMatches(bookmarks, query);

      if (matches.length == 0) {
        setDefaultSuggestion('No bookmarks found for <match>%s</match>');
      }
      else {
        setDefaultSuggestion(matches[0].description);

        suggest(matches.slice(1).map(function (match) {
          return {
            content: match.url,
            description: match.description
          };
        }));
      }

      previousMatches = matches;
      console.timeEnd('onInputChanged');
    });
  }
};

chrome.omnibox.onInputChanged.addListener(updateResults);

chrome.omnibox.onInputEntered.addListener(function (text) {
  if (previousMatches.length > 0) {
    var urlPicked = previousMatches.some(function (match) {
      return match.url == text;
    });

    if (urlPicked) {
      navigate(text);
    }
    else {
      navigate(previousMatches[0].url);
    }
  }
});

chrome.bookmarks.onChanged.addListener(function () {
  updateBookmarksCache();
});

chrome.bookmarks.onMoved.addListener(function () {
  updateBookmarksCache();
});

chrome.bookmarks.onRemoved.addListener(function () {
  updateBookmarksCache();
});

var bookmarkImportInProgress = false;
chrome.bookmarks.onCreated.addListener(function () {
  if (!bookmarkImportInProgress) {
    updateBookmarksCache();
  }
});

chrome.bookmarks.onImportBegan.addListener(function () {
  bookmarkImportInProgress = true;
});

chrome.bookmarks.onImportEnded.addListener(function () {
  bookmarkImportInProgress = false;
  updateBookmarksCache();
});
