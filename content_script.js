function createTagsPanel() {
  const title = document.title;
  const template = document.createElement("div");
  template.id = "my-awesome-tagging-buttons";
  template.innerHTML = `
        <div style="background: red;" id="my-awesome-tagging-buttons">
            <p>
            ${title}
            </p>
        </div>
    `;
  const existing = document.getElementById("my-awesome-tagging-buttons");
  if (existing) {
    // Update tagging panel if should change
    if (!existing.isEqualNode(template)) {
      existing.replaceWith(template);
    }
  } else {
    // Create tagging panel for first time
    document.getElementById("player").appendChild(template);
  }
}

setInterval(createTagsPanel, 100);
