// Initialise tags inputs
initInputField();
initSubmitButton();
initResetButton();

// Initialise settings inputs
initHideUiWhenNoBookmarkButton();
initHidePrevNextVideoButton();

// Initialise tools inputs
initFindBadBookmarksButton();

/**
 * Pre-populate and resize tags input with the current tags saved to storage if they exist.
 */
async function initInputField() {
  const { tags } = await browser.storage.local.get("tags");
  const inputElement = document.getElementById("tags-input");
  inputElement.value = tags ? unparseJson(tags) : "";
  inputElement.style.height = inputElement.scrollHeight + "px";
  inputElement.placeholder = `e.g.

❤️Love, 🎸Rock, 🎷Jazz, ⚡️Electronic
Good, Neutral, Bad
`;
}

/**
 * Listen for click to submit the tags.
 */
function initSubmitButton() {
  document.getElementById("tags-submit").addEventListener("click", async () => {
    try {
      const inputElement = document.getElementById("tags-input");
      const inputString = inputElement.value;
      if (inputString) {
        const inputJson = parseInput(inputString);
        await browser.storage.local.set({ tags: inputJson });
        alert("Tags configured ✅");
      } else {
        await browser.storage.local.set({ tags: undefined });
        alert("Cleared tags ✅");
      }
      initInputField();
    } catch (error) {
      alert(error.message);
    }
  });
}

/**
 * Listen for click to reset button for the tags input.
 */
function initResetButton() {
  document
    .getElementById("tags-reset")
    .addEventListener("click", () => initInputField());
}

/**
 * Listen for click on the setting for hiding UI when no bookmark is found.
 */
function initHideUiWhenNoBookmarkButton() {
  document
    .getElementById("hide-ui-when-no-bookmark")
    .addEventListener("change", async (event) => {
      await browser.storage.local.set({
        hideUiWhenNoBookmark: event.currentTarget.checked,
      });
    });
}

/**
 * Listen for click on the setting for hiding the previous/next video buttons.
 */
function initHidePrevNextVideoButton() {
  document
    .getElementById("hide-prev-next-video-buttons")
    .addEventListener("change", async (event) => {
      await browser.storage.local.set({
        hidePrevNextButtons: event.currentTarget.checked,
      });
    });
}

function initFindBadBookmarksButton() {
  document
    .getElementById("find-bad-bookmarks-button")
    .addEventListener("click", () => {
      browser.bookmarks.getTree(async (gettingTree) => {
        const badBookmarksElement = document.getElementById(
          "bad-bookmarks-output"
        );
        badBookmarksElement.innerText = "Loading...";
        try {
          const problems = [];
          // Get flat list of video bookmarks
          const fullTree = gettingTree[0];
          const bookmarks = flattenBookmarkFolders(fullTree).filter((b) =>
            b.url.startsWith("https://www.youtube.com/watch")
          );
          // Get list of video bookmark and metadata information (includes availability)
          const videos = await Promise.all(
            bookmarks.map(async (b) => {
              const videoId = new URL(b.url).searchParams.get("v");
              const res = await fetch(
                `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
              );
              const v = await res.json();
              return { bookmark: b, info: v };
            })
          );
          videos.forEach((v) => {
            // Scan through videos to see if there are unavailable videos
            if (v.info.error) {
              switch (v.info.error) {
                case "404 Not Found":
                case "403 Forbidden":
                  problems.push({
                    title: "Video Unavailable",
                    code: "unavailable",
                    videos: [v],
                  });
                  break;
                case "400 Bad Request":
                  problems.push({
                    title: "Video does not exist",
                    code: "not_exist",
                    videos: [v],
                  });
                  break;
                default:
                  problems.push({
                    title: `Unknown error getting video information`,
                    code: "unknown",
                    videos: [v],
                  });
                  break;
              }
            }
            // Scan through videos to see if there are duplicate bookmarks
            const dups = [v];
            videos.forEach((v2) => {
              if (v !== v2 && v.info.url === v2.info.url) {
                dups.push(v2);
              }
            });
            if (dups.length > 1) {
              problems.push({
                title: "Duplicated Videos found in Browser Bookmarks",
                code: "duplicate",
                videos: dups,
              });
            }
          });

          // Inject HTML
          const bookmarkItemHTML = (v) => `
            <li><a href="${v.bookmark.url}">${v.bookmark.fullpath}</a></li>
          `;
          const problemItemHTML = (p) => `
            <h4>${p.title}</h4>
            <ul>
              ${p.videos.map(bookmarkItemHTML).join("")}
            </ul>
          `;
          const problemCodeCountText = (code) =>
            `${code} (x${problems.filter((v) => v.code === code).length})`;
          const problemsDisplayHTML = (problems) => `
            <p>
            Found:
              ${problemCodeCountText("duplicate")},
              ${problemCodeCountText("not_exist")},
              ${problemCodeCountText("unavailable")},
              ${problemCodeCountText("unknown")}
            </p>
            ${problems
              .sort((p1, p2) => p1.code > p2.code)
              .map(problemItemHTML)
              .join("")}
          `;

          badBookmarksElement.innerHTML = problemsDisplayHTML(problems);
        } catch (e) {
          badBookmarksElement.innerText = "Error. Please try again.";
          console.error(e);
        }
      });
    });
}

/**
 * Helper function to flatten a tree of BookmarkTreeNodes into a flat array of video info.
 */
function flattenBookmarkFolders(folder) {
  const folderFullpath = folder.fullpath || "";
  return folder.children
    .map((node) => {
      const nodeWithFullpath = {
        ...node,
        fullpath: `${folderFullpath}/${node.title}`,
      };
      return node.type === "folder"
        ? flattenBookmarkFolders(nodeWithFullpath)
        : nodeWithFullpath;
    })
    .flat();
}

/**
 * Helper function to parse and validate input string from the tags input/textarea.
 */
function parseInput(inputString) {
  const tags = [];
  const rows = inputString.trim().split("\n");

  // For each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].split(",");
    tags.push([]);
    // For each tag item
    for (let j = 0; j < row.length; j++) {
      const tag = row[j].trim();
      // Must be at least 1 character
      if (!tag.length) {
        throw Error(
          `Tag must contain at least one character.\n(Error in row ${
            i + 1
          }, column ${j + 1})`
        );
      }
      // Must not contain whitespace or special characters
      // Note:
      // - whitespace (is the seperator for #tags in the bookmark title)
      // - hash (is the control character for the start of a #tag)
      // - quote (is used for HTML attribute="values")
      // - regex control characters (used for modifying the bookmark title)
      const pattern = / |#|\s|"|[-\/\\^$*+?.()|[\]{}]/;
      if (pattern.test(tag)) {
        throw Error(
          `Tag must not contain whitespace or special characters.\n(Error in row ${
            i + 1
          }, column ${j + 1})`
        );
      }
      // Add tag to array
      tags[tags.length - 1].push(tag);
    }
  }
  return tags;
}

/**
 * Helper function to unparse the JSON object used to hold tags. (array of array of string)
 */
function unparseJson(jsonArray) {
  return jsonArray.map((row) => row.join(",")).join("\n");
}
