async function createTagsPanel() {
  const queryParams = new URLSearchParams(window.location.search);
  const title = document.title;
  const videoId = queryParams.get("v");

  // Get bookmark folder
  const bookmarkInfoResponse = await browser.runtime.sendMessage({
    message: "get_bookmark_info",
    videoId,
  });
  const { bookmark } = bookmarkInfoResponse;
  const activeFolderId = bookmark?.parentId;
  const noBookmarkFound = bookmarkInfoResponse.message === "no_bookmark_found";
  const multipleBookmarksFound =
    bookmarkInfoResponse.message === "multiple_bookmarks_found";

  // Get available folders
  const foldersResponse = await browser.runtime.sendMessage({
    message: "get_folders",
  });
  const folders = foldersResponse.folders;

  // Build HTML
  const template = document.createElement("div");
  template.id = "my-awesome-tagging-buttons";

  const folderButtonsHTML = folders
    .map(
      (folder) => `
      <button class="tagging-button ${
        activeFolderId === folder.id && "tagging-button-active"
      }"
        data-folderid="${folder.id}"
        data-videoid="${videoId}"
      >
        ${folder.title}
      </button>
      `
    )
    .join();
  const noBookmarkFoundHTML = `<button class="tagging-button">⚠ No Bookmark Found</button>`;
  const multipleBookmarksFoundHTML = `<button class="tagging-button">⚠ Multiple Bookmark Found</button>`;

  template.innerHTML = `
        <div class="tagging-container" style="display: flex; gap: 4px;">
            <div style="flex-grow: 1;">
              ${
                noBookmarkFound
                  ? noBookmarkFoundHTML
                  : multipleBookmarksFound
                  ? multipleBookmarksFoundHTML
                  : folderButtonsHTML
              }
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

  // Add button functionality
  template.addEventListener("click", async (event) => {
    const folderId = event.target.dataset.folderid;
    const videoId = event.target.dataset.videoid;
    const id = event.target.id;
    if (folderId && videoId) {
      const res = await browser.runtime.sendMessage({
        message: "set_bookmark_folder",
        videoId,
        folderId,
      });
      console.info(res);
    }
    if (id === "tagging-options-button") {
      const res = await browser.runtime.sendMessage({
        message: "open_options_page",
      });
      console.info(res);
    }
  });

  // Inject HTML
  const existing = document.getElementById("my-awesome-tagging-buttons");
  if (existing) {
    // Update tagging panel if should change
    if (!existing.isEqualNode(template)) {
      existing.replaceWith(template);
    }
  } else {
    // Create tagging panel for first time
    document.getElementById("info-contents").prepend(template);
  }
}

setInterval(createTagsPanel, 100);
