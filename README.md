# yt-browser-bookmark-reorganizer

A webextension which adds buttons below the YouTube video player.

If the video exists in your browser bookmarks, then buttons will be displayed below the video player.
When you click on a button, it will move the bookmark from its current location to the button folder.
Each button corresponds to a folder in the destination-folder in your browser bookmarks.
You can set the destination-folder in the options page.

Note that if this YouTube video does not exist in your bookmarks, or duplicate bookmarks exist,
then a message will be displayed to indicate that you need to remove the duplicate or add the bookmark.

## Note

The original concept for this webextension was to be a "tagger" webextension - meaning that it
would allow you to easily change the bookmark tags (as shown in Firefox bookmarks) using buttons.

However, tags are not supported on browsers other than Firefox, and the webextension bookmarks API
does not expose tags. (see [bookmarks.BookmarkTreeNode](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode))

There was no way to complete this extension without access to tags, so it was decided to focus this
project on moving bookmarks to different folders instead of setting tags.

## TODO: Major changes

Change into true tagging app, using the bookmark title/name.

background.js
* current methods:
  * open_options_page
  * get_folders
  * get_bookmark_info
  * set_bookmark_folder
* new methods
  * open_options_page
  * get_tags (array of array of tags)
  * get_bookmark ([BookmarkTreeNode](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode) object)
  * add_tag
  * remove_tag
* Need to clean it up. Use a switch statement and a seperate functions for each method.

content_script.js
* Move templates into functions
* Update so that it uses tags system as specified in background.js
* Each row of tags should be a different color

options.js
* Remove folder mechanisms
* Use a simple textarea + CSV reader to determine the tags
* (note: background methods not necessary because options.js still has access to browser apis)
