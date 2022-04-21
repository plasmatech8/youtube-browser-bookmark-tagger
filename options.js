function renameCategoryFolder(folderId) {
  // Rename folder
  // Change folder name in storage
}

function createCategoryFolder() {
  // Create folder if not exists (in the destination folder)
  // Add folder into storage
  prompt("Enter new name for category folder");
}

function deleteCategoryFolder(folderId) {
  // Remove folder from storage
}

function dragReleaseCategoryFolder(fromFolderId, toFolderId) {
  // Move bookmark order in bookmarks menu
  // Switch place of two folders in storage
}

document.getElementById("createCategoryBtn").onclick = createCategoryFolder;

/*

Bookmarks:
    Bookmarks Menu/
        DestFolder/
            Favourite/
            Great/
            Good/
            Okay/

Storage:
    "destinationFolderId": Node ID
    "categoryFolderIds": Array of Node ID


Usage:
1. Content script get bookmark info - list of category folder name + ID and ID for selected category folder
2. Content script set bookmark folder - input the new category folder ID

Configuration:
1. Options page gets destination folder + category folders name + IDs
2. Use folder IDs to rename, move, and delete folders
3. Creating new folders only needs folder name
4. Destination folder cannot be changed, but can be renamed (?).
    - The destination folder will be named Re-Organised.
    - It is difficult to select a new pre-existing folder, but it may be possible to rename the folder and create a completely seperate folder.
    - This is not even really necessary.

*/
