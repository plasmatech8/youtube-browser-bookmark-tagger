/**
 * Pre-populate and resize tags input with the current tags saved to storage if they exist.
 */
async function initInputField() {
  //
  const { tags } = await browser.storage.local.get("tags");
  const inputElement = document.getElementById("tags-input");
  if (tags) {
    inputElement.value = JSON.stringify(tags, null, 4);
    inputElement.style.height = inputElement.scrollHeight + "px";
  }
  inputElement.placeholder = `e.g.

[
  ["❤️Love", "🎸Rock", "🎷Jazz", "⚡️Electronic"],
  ["Good", "Neutral", "Bad"]
]
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
        alert("Tags set to default ✅");
      }
      initInputField();
    } catch (error) {
      alert(error.message);
    }
  });
}

initInputField();
initSubmitButton();

/**
 * Helper function to parse and validate input string from the tags input/textarea.
 */
function parseInput(inputString) {
  const rows = JSON.parse(inputString);
  // Array
  if (!Array.isArray(rows)) {
    throw Error("Input should be a JSON array");
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // Array of arrays
    if (!Array.isArray(row)) {
      throw Error(
        `Input should be a JSON array of arrays (index ${i} is not an array)`
      );
    }
    for (let j = 0; j < row.length; j++) {
      const tag = row[j];
      // Array of array of strings
      if (typeof tag !== "string") {
        throw Error(
          `Input should be a JSON array of arrays of string (index ${i}, ${j} is not a string)`
        );
      }
      // Strings should be at least one character
      if (!tag.length) {
        throw Error(
          `Tags must contain at least one character (index ${i}, ${j} is not valid)`
        );
      }
      // Strings should not have invalid characters
      if (/ |#|\s/.test(tag)) {
        throw Error(
          `Tags should not contain whitespace or # characters (index ${i}, ${j} is not valid)`
        );
      }
    }
  }
  return rows;
}
