// Create UI on page-load
createTagsPanel();

// Ensure UI updates on page refresh/change
// Note:  cannot make this too high because bookmark search is an intensive operation and will slow
//        down the background script if the content script/s calls too frequently.
setInterval(createTagsPanel, 2000);

/**
 * Build the HTML and inject onto the page.
 */
async function createTagsPanel() {
  const queryParams = new URLSearchParams(window.location.search);
  const title = document.title;
  const videoId = queryParams.get("v");

  // Get bookmark
  const bookmarkResponse = await browser.runtime.sendMessage({
    method: "get_bookmark",
    videoId,
  });

  // Get tags
  const tagsResponse = await browser.runtime.sendMessage({
    method: "get_tags",
  });

  // Build HTML
  const template = document.createElement("div");
  template.id = "youtube-bookmark-tagging-panel";
  template.innerHTML = panelHTML(bookmarkResponse, tagsResponse, title);

  // Handle click events
  template.addEventListener("click", async (event) => {
    const tag = event.target.dataset.tag;
    const bookmarkid = event.target.dataset.bookmarkid;
    const id = event.target.id;
    // If clicked on tag button
    if (tag && bookmarkid) {
      await browser.runtime.sendMessage({
        method: "toggle_tag",
        tag,
        bookmarkid,
      });
    }
    // If clicked on options button
    if (id === "tagging-options-button") {
      await browser.runtime.sendMessage({
        method: "open_options_page",
      });
    }
    // Refresh the UI
    createTagsPanel();
  });

  // Inject HTML
  const existing = document.getElementById("youtube-bookmark-tagging-panel");
  if (existing) {
    // Update tagging panel if should change
    if (!existing.isEqualNode(template)) {
      existing.replaceWith(template);
    }
  } else {
    // Create tagging panel for first time
    document.getElementById("below").prepend(template);
  }
}

const panelHTML = (bookmarkResponse, tagsResponse, title) => {
  return `
    <div class="tagging-container" style="display: flex; gap: 4px;">
        <div style="display: flex; flex-grow: 1; flex-direction: column; gap: 0px;">
          ${panelLeftSectionHTML(bookmarkResponse, tagsResponse)}
        </div>
        <div>
          <button class="tagging-button tagging-video-title">
            ${title}
          </button>
        </div>
        <div>
          <button id="tagging-options-button" class="tagging-button tagging-options-button">
            ⚙
          </button>
        </div>
    </div>
  `;
};

const panelLeftSectionHTML = (bookmarkResponse, tagsResponse) => {
  switch (bookmarkResponse.message) {
    case "got_bookmark":
      const bookmark = bookmarkResponse.bookmark;
      switch (tagsResponse.message) {
        case "got_tags":
          const tags = tagsResponse.tags;
          if (tags) return tagButtonRowsHTML(bookmark, tags);
          return `<button class="tagging-button">No Tags - Go to Settings</button>`;
        default:
          return `<button class="tagging-button">⚠ Error Getting Tags</button>`;
      }
    case "multiple_bookmarks_found":
      return `<button class="tagging-button">⚠ Multiple Bookmarks Found</button>`;
    case "no_bookmark_found":
      return `<button class="tagging-button">⚠ No Bookmark Found</button>`;
    default:
      return `<button class="tagging-button">⚠ Error Getting Bookmark</button>`;
  }
};

const tagButtonRowsHTML = (bookmark, tags) => {
  return tags
    .map((tagRow) => {
      return `
    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
      ${tagRow.map((tag) => tagButtonHTML(bookmark, tag)).join("")}
    </div>
    `;
    })
    .join("");
};

const tagButtonHTML = (bookmark, tag) => {
  const hasTag = RegExp(`( |^)#${tag}( |$)`).test(bookmark.title);
  return `
    <button class="tagging-button ${hasTag && "tagging-button-active"}"
      data-tag="${tag}"
      data-bookmarkid="${bookmark.id}"
    >
      ${tag}
    </button>
  `;
};
