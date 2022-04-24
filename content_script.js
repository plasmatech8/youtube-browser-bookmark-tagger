async function createTagsPanel() {
  const queryParams = new URLSearchParams(window.location.search);
  const title = document.title;
  const videoId = queryParams.get("v");

  // Get Bookmark Category
  const info = await browser.runtime.sendMessage({
    message: "get_bookmark_info",
    videoId,
  });
  // console.log(info);

  const availableFolders = ["Foo", "Bar", "Baz"];
  const activeFolder = "Bar";

  // Build HTML
  const template = document.createElement("div");
  template.id = "my-awesome-tagging-buttons";
  template.innerHTML = `
        <div class="tagging-container" style="display: flex">
            <div style="flex-grow: 1">
              ${availableFolders
                .map(
                  (folder) =>
                    `
                    <button class="tagging-button ${
                      activeFolder === folder && "tagging-button-active"
                    }"
                      data-folder="${folder}"
                      data-videoid="${videoId}"
                    >
                      ${folder}
                    </button>
                    `
                )
                .join()}
            </div>
            <div>
              <button class="tagging-button tagging-video-title">
                ${title}
              </button>
            </div>
        </div>
    `;

  // Add button functionality
  template.addEventListener("click", async (event) => {
    const folder = event.target.dataset.folder;
    const videoId = event.target.dataset.videoid;
    if (folder && videoId) {
      const res = await browser.runtime.sendMessage({
        message: "set_bookmark_folder",
        videoId,
        folder,
      });
      alert(JSON.stringify(res, null, 2)); // !!!
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
