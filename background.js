/**
 * Message listener for content script.
 */
browser.runtime.onMessage.addListener((request, _, sendResponse) => {
  const method = request.method;

  switch (method) {
    case "open_options_page":
      browser.runtime.openOptionsPage();
      sendResponse({ message: "opening_options_page" });
      break;

    case "get_bookmark":
      const videoId = request.videoId;
      browser.bookmarks.search(videoId).then(async (searching) => {
        if (searching.length > 1) {
          sendResponse({ message: "multiple_bookmarks_found" });
          return;
        }
        if (searching.length === 0) {
          sendResponse({ message: "no_bookmark_found" });
          return;
        }
        const bookmark = searching[0];
        sendResponse({ message: "got_bookmark", bookmark });
      });
      break;

    case "get_tags":
      browser.storage.local.get("tags").then((data) => {
        const defaultTags = [
          ["❤️Love", "🎸Rock", "🎷Jazz", "⚡️Electronic"],
          ["Good", "Neutral", "Bad"],
        ];
        const tags = data.tags || defaultTags;
        sendResponse({ message: "got_tags", tags });
      });
      break;

    case "toggle_tag":
      const tag = request.tag;
      const bookmarkid = request.bookmarkid;
      browser.bookmarks.get(bookmarkid).then(async (searching) => {
        const bookmark = searching[0];
        const tagExp = new RegExp(`( |^)#${tag}( |$)`);
        const title = tagExp.test(bookmark.title)
          ? bookmark.title.replace(tagExp, " ").trim() // remove tag if present
          : bookmark.title + ` #${tag}`; // add tag if not present
        await browser.bookmarks.update(bookmarkid, { title });
        sendResponse({ message: "toggled_tag" });
      });
      break;

    default:
      throw Error("Invalid method: " + method);
  }
  return true; // To allow a response from an async coroutine
});
