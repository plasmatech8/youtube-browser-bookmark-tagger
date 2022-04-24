# yt-browser-bookmark-reorganizer

A webextension which adds buttons below the YouTube video player.

If the video exists in your browser bookmarks, then buttons will be displayed below the video player.
Each button corresponds to a folder in the "Other Bookmarks" folder in your browser.

Note that if this YouTube video does not exist in your bookmarks, or duplicate bookmarks exist,
then a message will be displayed to indicate that you need to remove the duplicate or add the bookmark.

## Note

The original concept for this webextension was to be a "tagger" webextension - meaning that it
would allow you to easily change the bookmark tags (as shown in Firefox bookmarks) using buttons.

However, tags are not supported on browsers other than Firefox, and the webextension bookmarks API
does not expose tags. (see [bookmarks.BookmarkTreeNode](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode))

There was no way to complete this extension without access to tags, so it was decided to focus this
project on moving bookmarks to different folders instead of setting tags.
