/**
 * Search for browser bookmark with the specified video ID.
 * Returns an error message if no bookmarks, or multiple bookmarks, were found.
 *
 * Using this function with a callback instead of async-await because the
 * webextension API does not allow an async listener function.
 */
function withVideoBookmark(videoId, callabck) {
  browser.bookmarks.search(videoId).then(async (searching) => {
    // Validation
    if (searching.length > 1) {
      sendResponse({ message: "multiple_bookmarks_found" });
      return;
    }
    if (searching.length === 0) {
      sendResponse({ message: "no_bookmark_found" });
      return;
    }
    // Run callback with bookmark
    const bookmark = searching[0];
    callabck(bookmark);
  });
}

/**
 * Message listener for content script.
 */
browser.runtime.onMessage.addListener((request, _, sendResponse) => {
  const method = request.method;
  const videoId = request.videoId;
  const tag = request.tag;

  switch (method) {
    case "open_options_page":
      browser.runtime.openOptionsPage();
      sendResponse({ message: "opening_options_page" });
      break;
    case "get_bookmark":
      withVideoBookmark(videoId, (bookmark) => {
        sendResponse({ message: "got_bookmark", bookmark, folder });
      });
      break;
    case "list_tags":
      const { tags } = browser.storage.local.get("tags");
      sendResponse({ message: "got_tags", tags });
      break;
    case "add_tag":
      withVideoBookmark(videoId, (bookmark) => {
        // TODO: change bookmark name
        sendResponse({ message: "added_tag" });
      });
      break;
    case "remove_tag":
      withVideoBookmark(videoId, (bookmark) => {
        // TODO: change bookmark name
        sendResponse({ message: "removed_tag" });
      });
      break;
    default:
      throw Error("Invalid method");
  }
  return true; // To allow a response delayed by async
});
