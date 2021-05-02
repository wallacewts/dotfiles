//EDIT THIS FILE

/***
* Make sure to call the super() constructor with your sender ids
* When your website is closed the handleBackgroundMessage will be called. You should create a notification there.
***/
// eslint-disable-next-line no-unused-vars
class FCMClientImplementation extends FCMClient {
	constructor() {
		super(["143005103151"]);
	}
	handleBackgroundMessage (serviceWorker, payload) {
		// var notificationTitle = "Background Message Title";
		// var notificationOptions = {
		// 	body: "Background Message body.",
		// 	icon: "/img/logos/logo.png"
		// };
		// serviceWorker.registration.showNotification(notificationTitle,
		// 	notificationOptions);
	}
}