var bookmarksCache = null;

function flattenBookmarksTree(roots) {
  var results = [];

  var recurse = function(bookmark, parents) {
    if (bookmark.url) {
      results.push({
        url: bookmark.url,
        title: bookmark.title,
        parents: parents
      });
    }

    if (bookmark.children) {
      var ignoreNode = ['', 'Bookmarks Bar', 'Other Bookmarks'].
          indexOf(bookmark.title) >= 0;

      var newParents = ignoreNode ?
          parents :
          parents.concat(bookmark.title);

      bookmark.children.forEach(function(child) {
        recurse(child, newParents);
      });
    }
  };

  roots.forEach(function(bookmark) {
    recurse(bookmark, []);
  });

  return results;
}

function updateBookmarksCache(callback) {
  console.time('updateBookmarksCache');
  chrome.bookmarks.getTree(function(roots) {
    bookmarksCache = flattenBookmarksTree(roots);
    console.timeEnd('updateBookmarksCache');
    if (callback) {
      callback();
    }
  });
}

function getAllBookmarks(callback) {
  if (!bookmarksCache) {
    updateBookmarksCache(function() {
      callback(bookmarksCache);
    });
  }
  else {
    callback(bookmarksCache);
  }
}
