function createTagsPanel() {
  const queryParams = new URLSearchParams(window.location.search);
  const title = document.title;
  const videoId = queryParams.get("v");

  // Get Tags
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
                      data-video="${videoId}"
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
  template.addEventListener("click", (event) => {
    const tag = event.target.dataset.tag;
    const video = event.target.dataset.video;
    if (tag && video) {
      chrome.runtime.sendMessage({ message: "check_storage" }, (res) =>
        alert(JSON.stringify(res))
      );
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
