// *************************************************** //
// Networkhandler Class
//
// This class handles most of the work needed to
// convert the http response into a usable object.
// This also includes the clean handling of errors
// or problems that can occur.
// *************************************************** //

Qt.include(dirPaths.assetPath + "structures/errordata.js");

// singleton instance of class
var network = new NetworkHandler();

// Class function that gets the prototype methods
// This also includes the standard objects available
function NetworkHandler() {
	// object to store error data in
	this.errorData = new ErrorData();

	// flag to indicate that loading is finished
	this.requestIsFinished = false;
}

// This method handles http responses for a XMLHttpRequest
// Note that it's meant to be called on every onreadystatechange()
// The responseText is analysed for errors and evaluated into a json object,
// which is returned
NetworkHandler.prototype.handleHttpResult = function(XMLHttpRequestObject) {
	// console.log("# Handling HTTP Result for ready state: " +
	// XMLHttpRequestObject.readyState);

	// check the server response for errors
	// this is done during loading as the XMLHttpRequest implementation in MeeGo
	// Harmattan deletes errors once it's DONE
	// see here for details:
	// https://bugreports.qt-project.org/browse/QTBUG-21706
	if (XMLHttpRequestObject.readyState === XMLHttpRequest.LOADING) {
		this.checkResponseForErrors(XMLHttpRequestObject.responseText,
				XMLHttpRequestObject.status);
		return false;
	}

	// check if the server response is actually finished
	if (XMLHttpRequestObject.readyState === XMLHttpRequest.DONE) {
		// console.debug("# Request is done (state " +
		// XMLHttpRequestObject.status + ")");
		this.requestIsFinished = true;

		// check if the status is not 200 (= an error has occured)
		// this might either be already caught during loading or may be
		// something new
		if (XMLHttpRequestObject.status != 200) {
			// as noted on MeeGo / Harmattan the error has already been handled
			// if not, then do it again
			if (!this.errorData.errorCode) {
				// console.log("# The HTTP status is not 200. Check for errors
				// and return");
				this.checkResponseForErrors(XMLHttpRequestObject.responseText,
						XMLHttpRequestObject.status);
			}
			return false;
		}

		return XMLHttpRequestObject.responseText;
	}
};

// This script analyses the traffic from Instagram for possible errors
// Note that this scripts does the analysing but does not act upon found errors
NetworkHandler.prototype.checkResponseForErrors = function(httpResponseText,
		httpResponseStatus) {
	// console.log("Check HTTP response for errors");

	if (httpResponseText.indexOf('oauth_problem') !== -1) {
		// console.log("# Response does not have response 200 verification by
		// Instagram");
		// console.log("# JSON evaluation not successful, adding generic
		// error");

		// the error was not handled by Instagram
		// fill the error data object with a generic error description
		this.errorData.errorType = "OAuth Error";
		this.errorData.errorCode = httpResponseStatus;
		this.errorData.errorMessage = httpResponseText;
		return;
	}
};

// This method clears any error messages that are currently stored in the object
// It should be called after the error messages have been processed and shown
NetworkHandler.prototype.clearErrors = function() {
	this.errorData = new ErrorData();
};
