# YouTube Browser Bookmark Tagger

![example](images/example.png)

A great way to add tags to your YouTube music videos!

## Description

A webextension which adds buttons below the YouTube video player.

If the video exists in your browser bookmarks, then buttons will be
displayed below the video player. (as shown above)

When you click on a <code class="btn-active">#tag</code>
button, the #tag will be appended to the title of your browser bookmark
and the button will light up.

The tag is toggled on/off with subsequent clicks.

You can configure the tags available in the options page.

## Notes

If the YouTube video does not exist in your bookmarks, or a multiple bookmark of the same
YouTube video exist, then an error message will be displayed instead of the tagging buttons.
You must remove the duplicated bookmark manually to add/remove tags.

Firefox has a native bookmark tagging feature, however it is not supported on any other browser.
Whatsmore, webextension bookmarks API does not expose tags.
(see [bookmarks.BookmarkTreeNode](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode))
So, instead this extension opted towards appending #tags to the bookmark title.

Zip command for publishing:
```bash
zip -r -FS youtube-browser-bookmark-tagger.zip * --exclude '*.git*'
```