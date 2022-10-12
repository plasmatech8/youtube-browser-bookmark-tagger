// Initialise custom tags form
initInputField();
initSubmitButton();
initResetButton();

/**
 * Pre-populate and resize tags input with the current tags saved to storage if they exist.
 */
async function initInputField() {
  //
  const { tags } = await browser.storage.local.get("tags");
  const inputElement = document.getElementById("tags-input");
  if (tags) {
    inputElement.value = unparseJson(tags);
    inputElement.style.height = inputElement.scrollHeight + "px";
  }
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
        await browser.storage.local.clear();
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
