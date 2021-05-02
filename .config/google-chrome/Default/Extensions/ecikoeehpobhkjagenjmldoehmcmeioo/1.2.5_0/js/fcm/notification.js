const fcmClient = new FCMClientImplementation();
var fcmToken = null;

fcmClient.initPage(
  token => {
    chrome.storage.local.set({ tokenFCM: token }, function () {
      console.log("Value is set to ");
      console.log(token);

      if (localStorage.tokenFCM && localStorage.tokenFCM != token) {
        console.log("TODO REGISTER TOKEN");
      }
      localStorage.tokenFCM = token;
    });
    fcmToken = token;
  },
  payload => {
    console.log("New Message!", payload);
  }
);
