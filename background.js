browser.runtime.onMessage.addListener((request, _, sendResponse) => {
  const message = request.message;
  const videoId = request.videoId;

  if (message === "open_options_page") {
    // Method: Opening options page
    browser.runtime.openOptionsPage();
    sendResponse({ message: "opening_options_page" });
  } else if (message === "get_folders") {
    // Method: Getting folders for content buttons
    browser.bookmarks.getSubTree("unfiled_____").then((search) => {
      const tree = search[0];
      sendResponse({
        message: "getting_folders",
        folders: tree.children,
      });
    });
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
      if (message === "get_bookmark_info") {
        // Method: Getting bookmark info
        const bookmark = searching[0];
        const folder = (await browser.bookmarks.get(bookmark.parentId))[0];
        sendResponse({ message: "bookmark_found", bookmark, folder });
      }
      if (message === "set_bookmark_folder") {
        // Method: Setting bookmark folder
        const bookmark = searching[0];
        const parentId = request.folderId;
        await browser.bookmarks.move(bookmark.id, { parentId });
        sendResponse({ message: "bookmark_moved" });
      }
    });
  }

  return true;
});
