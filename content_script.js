async function createTagsPanel() {
  const queryParams = new URLSearchParams(window.location.search);
  const title = document.title;
  const videoId = queryParams.get("v");

  // Get Tags
  const x = await browser.runtime.sendMessage({ message: "get_tags", videoId }); // !!!
  // console.log(x);

  const availableTags = ["Foo", "Bar", "Baz"];
  const activeTags = ["Bar"];

  // Build HTML
  const template = document.createElement("div");
  template.id = "my-awesome-tagging-buttons";
  template.innerHTML = `
        <div class="tagging-container" style="display: flex">
            <div style="flex-grow: 1">
              ${availableTags
                .map(
                  (tag) =>
                    `
                    <button class="tagging-button ${
                      activeTags.includes(tag) && "tagging-button-active"
                    }"
                      data-tag="${tag}"
                      data-videoid="${videoId}"
                    >
                      ${tag}
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
    const tag = event.target.dataset.tag;
    const videoId = event.target.dataset.videoid;
    if (tag && videoId) {
      const res = await browser.runtime.sendMessage({
        message: "set_tag",
        videoId,
        tag,
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
