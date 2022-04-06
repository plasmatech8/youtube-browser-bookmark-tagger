browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "foo") {
    // Foo
  } else {
    // Bar
  }
  sendResponse({
    message: "message_recieved",
  });
});
