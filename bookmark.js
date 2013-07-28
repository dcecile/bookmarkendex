var bookmarksCache = null;

function flattenBookmarksTree(systemRoots) {
  var userRoots = [];

  // The standard hierarchy includes two levels that aren't needed
  // for searching: '' --> [ 'Bookmarks Bar', 'Other Bookmarks' ]
  systemRoots.forEach(function(rootOne) {
    rootOne.children.forEach(function(rootTwo) {
      // Flatten directly from the children of the second level
      userRoots = userRoots.concat(rootTwo.children);
    });
  });

  var results = [];

  var recurse = function(bookmark, parents) {
    if (bookmark.url) {
      // Add the bookmark
      results.push({
        url: bookmark.url,
        title: bookmark.title,
        parents: parents
      });
    }

    if (bookmark.children) {
      // Add all of the folder's children
      var newParents = parents.concat(bookmark.title);

      bookmark.children.forEach(function(child) {
        recurse(child, newParents);
      });
    }
  };

  // Start a new hierachy for each user bookmark/folder, and recurse
  userRoots.forEach(function(bookmark) {
    recurse(bookmark, []);
  });

  // The final result has each bookmark in a list, annotated with parent chain
  return results;
}

function updateBookmarksCache(callback) {
  chrome.bookmarks.getTree(function(roots) {
    bookmarksCache = flattenBookmarksTree(roots);
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
