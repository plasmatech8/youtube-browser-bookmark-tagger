function createFolderTreeHTML(bookmark, selectedId) {
  const title = bookmark.title;
  const id = bookmark.id;
  const children = bookmark.children;
  const childrenHTML = children
    .filter((c) => c.type === "folder")
    .map((c) => createFolderTreeHTML(c, selectedId))
    .join("");
  const titleButtonHTML = `
    <button
      data-id="${id}"
      class="btn ${selectedId === id && "btn-active"}"
    >
      ${title}
    </button>
  `;
  const contents = children.some((c) => c.type === "folder")
    ? `<details>
      <summary>${titleButtonHTML}</summary>
      <div style="padding-left: 2em;">
        ${childrenHTML}
      </div>
    </details>`
    : ` <div style="padding-left: 18px;">${titleButtonHTML}</div>`;
  return `<div style="margin-top: 5px;">${contents}</div>`;
}

async function getPath(bookmarkId) {
  const search = await browser.bookmarks.get(bookmarkId);
  const { title, parentId } = search[0];
  if (parentId) {
    const parentPath = await getPath(parentId);
    return `${parentPath}/${title}`;
  }
  return title;
}

async function init() {
  // Get destination folder ID from storage (unfiled_____ if undefined)
  const selectedDestinationFolderId =
    (await browser.storage.local.get("destinationFolderId"))
      .destinationFolderId || "unfiled_____";

  // Display destination-folder path viewer
  const destFolderPathContainer = document.getElementById(
    "destination-folder-path"
  );
  destFolderPathContainer.innerHTML = await getPath(
    selectedDestinationFolderId
  );

  // Construct template for destination-folder tree view and select buttons
  const template = document.createElement("div");
  template.id = "destination-folder-select";
  const bookmarkTree = await browser.bookmarks.getTree();
  const bookmarkTreeRoot = bookmarkTree[0];
  const folderTreeHTML = bookmarkTreeRoot.children
    .map((c) => createFolderTreeHTML(c, selectedDestinationFolderId))
    .join("");
  template.innerHTML = folderTreeHTML;

  // Add click functionality to destination-folder tree buttons
  template.addEventListener("click", async (event) => {
    const folderId = event.target.dataset.id;
    if (folderId) {
      await browser.storage.local.set({ destinationFolderId: folderId });
    }
  });

  // Render destination-folder tree view and select buttons
  const existing = document.getElementById("destination-folder-select");
  const temp = existing.cloneNode(true);
  Array.from(temp.getElementsByTagName("details")).forEach((el) =>
    el.removeAttribute("open")
  );
  if (!temp.isEqualNode(template)) {
    existing.replaceWith(template);
  }

  // Run this again after 10ms
  setTimeout(init, 10);
}

init();
