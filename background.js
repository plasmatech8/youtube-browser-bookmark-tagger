browser.runtime.onMessage.addListener((request, _, sendResponse) => {
  const message = request.message;
  const videoId = request.videoId;

  if (message === "open_options_page") {
    browser.runtime.openOptionsPage();
    sendResponse({ message: "opening_options_page" });
  } else {
    // Searching for video
    browser.bookmarks.search(videoId).then(async (searching) => {
      // Validation
      if (searching.length > 1) {
        sendResponse({ message: "multiple_bookmarks_found" });
      }
      if (searching.length === 0) {
        sendResponse({ message: "no_bookmark_found" });
      }
      // Methods
      if (message === "get_bookmark_info") {
        const bookmark = searching[0];
        const folder = await browser.bookmarks.get(bookmark.parentId);
        sendResponse({ message: "bookmark_found", bookmark, folder });
      }
      if (message === "set_bookmark_folder") {
        const folder = request.folder;
        // await browser.bookmarks.move();
        sendResponse({ message: "bookmark_moved" });
      }
    });
  }

  return true;
});
