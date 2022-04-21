browser.runtime.onMessage.addListener((request, _, sendResponse) => {
  const message = request.message;
  const videoId = request.videoId;
  const tag = request.tag;

  browser.bookmarks.search(videoId).then(async (searching) => {
    // Validation
    if (searching.length > 1) {
      sendResponse({ message: "multiple_bookmarks_found" });
    }
    if (searching.length === 0) {
      sendResponse({ message: "no_bookmark_found" });
    }
    // Methods
    if (message === "get_tags") {
      sendResponse({ tags: searching[0] });
    }
    if (message === "set_tag") {
      sendResponse({ videoId, tag, searching });
    }
  });

  return true;
});
