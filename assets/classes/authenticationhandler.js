// *************************************************** //
// Authenticationhandler Script
//
// This script handles the current Flickr user that
// is authenticated for the application.
// This includes the actual authentication process as
// well as general checks if the user is already
// authenticated or not.
// The general userdata will be stored in the local
// app database (table: userdata).
// Note that it's a class that needs to be defined first:
// auth = new AuthenticationHandler();
// *************************************************** //

// include other scripts used here
Qt.include(dirPaths.assetPath + "global/flickrkeys.js");
Qt.include(dirPaths.assetPath + "structures/tokenstatus.js");
Qt.include(dirPaths.assetPath + "classes/networkhandler.js");
Qt.include(dirPaths.assetPath + "classes/sha1.js");
Qt.include(dirPaths.assetPath + "classes/oauth.js");
Qt.include(dirPaths.assetPath + "classes/uniqueid.js");

// singleton instance of class
var auth = new AuthenticationHandler();

// class function that gets the prototype methods
function AuthenticationHandler() {

	// this contains the current response status
	var oauthResponseStatus = "";

	// request token and secret will be given by the getRequestToken() method
	var oauthRequestToken = "";
	var oauthRequestSecret = "";

	// verification code that will be given by the authorize call, set by
	// checkAuthorizationStatus()
	var oauthVerifierCode = "";
}

// Get a request token from Flickr as first step of the oauth process
// The resulting data is the token answer from Flickr if the authentication was
// successful or it can contain an error with respective message
// Parameter is the id of the calling page, which will receive the
// oAuthRequestDone() signal, sent by checkRequestTokenResponse()
AuthenticationHandler.prototype.getRequestToken = function(callingPage) {
	console.log("# Getting request token for Flickr with URL");

	// request response
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		// handle the http request and check for the oauth response
		var httpContent = network.handleHttpResult(req);

		// hand result back to calling page if there is any
		if (httpContent) {
			console.log("# Result for HTTP request found: " + httpContent);
			auth.checkRequestTokenResponse(httpContent, callingPage);
		} else {
			// check for general network errors
			if ((network.requestIsFinished) && (network.errorData.errorCode != "")) {
				callingPage.oAuthTokenRequestError(network.errorData);
				network.clearErrors();
			}
		}
	};

	// This creates the url to request the Flickr oauth request token
	// The result contains the URL to call fill standard oauth parameters
	var oauth_parameters = new Array();
	oauth_parameters.push([ "oauth_callback", flickrkeys.flickrCallback ]);
	oauth_parameters.push([ "oauth_consumer_key", flickrkeys.flickrClientId ]);
	oauth_parameters.push([ "oauth_signature_method", "HMAC-SHA1" ]);
	oauth_parameters.push([ "oauth_version", "1.0" ]);

	// define accessor structure containing the keys
	// since we don't have a token key yet, leave it empty
	var accessor = {
		consumerSecret : flickrkeys.flickrClientSecret,
		tokenSecret : ""
	};

	// define message structure containing the url data
	var message = {
		method : "GET",
		action : flickrkeys.flickrTokenRequestUrl,
		parameters : oauth_parameters
	};

	// add timestamp and nonce to the oauth parameters
	OAuth.setTimestampAndNonce(message);

	// sign request
	OAuth.SignatureMethod.sign(message, accessor);

	// clear response status
	// this will be filled by the oauth response
	auth.oauthResonseStatus = "";

	// return finished url
	var flickrUrl = flickrkeys.flickrTokenRequestUrl + "?" + OAuth.SignatureMethod.normalizeParameters(message.parameters) + "&oauth_signature=" + encodeURIComponent(OAuth.getParameter(message.parameters, "oauth_signature"));

	// send the auth url to Flickr
	req.open("GET", flickrUrl, true);
	req.send();
};

// This checks the response content for the token request call
// It can either be a token if the authentication was successful
// or it can contain an error with respective a message
// First parameter contains the response body by Flickr
// Second parameter is the id of the calling page, which will receive the
// oAuthRequestDone() signal, sent by checkRequestTokenResponse()
AuthenticationHandler.prototype.checkRequestTokenResponse = function(tokenResponse, callingPage) {
	console.log("# Checking token response content: " + tokenResponse);

	// check if authentication was successful
	// if so, the response should contain the token code and secret
	if (tokenResponse.indexOf("callback_confirmed=") > 0) {
		console.log("# Flickr oauth request token successful");

		// get token secret from the Flickr respone
		var flickrTokenSecret = "";
		var tokenSecretStartPosition = tokenResponse.indexOf("oauth_token_secret=");
		flickrTokenSecret = tokenResponse.substr((tokenSecretStartPosition + 19));

		// remove secret from token data string
		tokenResponse = tokenResponse.substr(0, (tokenSecretStartPosition - 1));

		// get public token from the Flickr respone
		var flickrTokenCode = "";
		var tokenStartPosition = tokenResponse.indexOf("oauth_token=");
		flickrTokenCode = tokenResponse.substr((tokenStartPosition + 12));

		// check if data is ok
		if ((flickrTokenCode.length > 0) && (flickrTokenCode.length > 0)) {
			console.log("# Found Flickr request token codes. Public: " + flickrTokenCode + " and private: " + flickrTokenSecret);

			// fill structure
			auth.oauthResponseStatus = "AUTH_SUCCESS";
			auth.oauthRequestToken = flickrTokenCode;
			auth.oauthRequestSecret = flickrTokenSecret;

			// call the page and hand over the response status
			// other data has to be pulled out of the object structure
			callingPage.oAuthTokenRequestDone("AUTH_SUCCESS");

			// return status
			return auth.oauthResponseStatus;
		}
	}

	console.log("# Flickr auth error found");
	auth.oauthResponseStatus = "AUTH_ERROR";
	return "AUTH_ERROR";
};

// This checks a given URL for oauth data
// It can either be a token if the authentication was successful
// or it can contain an error with respective message
AuthenticationHandler.prototype.checkAuthorizationStatus = function(url) {
	console.log("# Checking callback URL for authentication information: " + url.toString());

	// convert url object to string
	var currentURL = url.toString();

	// set default status
	auth.oauthResponseStatus = "NOT_RELEVANT";

	// authentication was successful: the URL contains the redirect address as
	// well the oauth verifier
	if ((currentURL.indexOf(flickrkeys.flickrCallback === 0)) && (currentURL.indexOf("oauth_verifier=") > 0)) {

		// get verification
		var flickrVerificationCode = "";
		var tokenStartPosition = currentURL.indexOf("oauth_verifier=");
		flickrVerificationCode = currentURL.substr((tokenStartPosition + 15));

		// set response status and verifier code
		auth.oauthResponseStatus = "AUTH_SUCCESS";
		auth.oauthVerifierCode = flickrVerificationCode;

		return auth.oauthResponseStatus;
	}

	// console.log("# Done checking Flickr callback URL for authentication
	// information: " + tokenStatus);
	return auth.oauthResponseStatus;
};

// Use the temp authorize token to request a permanent one
// The resulting data is the user authorization answer from Flickr if the
// authentication was successful or it can contain an error
// Parameter is the id of the calling page, which will receive the
// oAuthAccessTokenDone() signal, sent by checkAccessTokenResponse()
AuthenticationHandler.prototype.getAccessToken = function(callingPage) {
	// console.log("# Validating access token");

	// request response
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		// handle the http request and check for the oauth response
		var httpContent = network.handleHttpResult(req);

		// hand result back to calling page if there is any
		if (httpContent) {
			console.log("# Result for HTTP request found: " + httpContent);
			auth.checkAccessTokenResponse(httpContent, callingPage);
		} else {
			// check for general network errors
			if ((network.requestIsFinished) && (network.errorData.errorCode != "")) {
				// callingPage.oAuthRequestError(network.errorData);
				network.clearErrors();
			}
		}
	};

	// fill standard oauth parameters
	// note that the callback has to be "oob" as there is no callback
	var oauth_parameters = new Array();
	oauth_parameters.push([ "oauth_callback", flickrkeys.flickrCallback ]);
	oauth_parameters.push([ "oauth_consumer_key", flickrkeys.flickrClientId ]);
	oauth_parameters.push([ "oauth_signature_method", "HMAC-SHA1" ]);
	oauth_parameters.push([ "oauth_version", "1.0" ]);
	oauth_parameters.push([ "oauth_verifier", auth.oauthVerifierCode ]);
	oauth_parameters.push([ "oauth_token", auth.oauthRequestToken ]);

	// define accessor structure containing the keys
	// since we don't have a token key yet, leave it empty
	var accessor = {
		consumerSecret : flickrkeys.flickrClientSecret,
		tokenSecret : auth.oauthRequestSecret
	};

	// define message structure containing the url data
	var message = {
		method : "GET",
		action : flickrkeys.flickrTokenAccessUrl,
		parameters : oauth_parameters
	};

	// add timestamp and nonce to the oauth parameters
	OAuth.setTimestampAndNonce(message);

	// sign request
	OAuth.SignatureMethod.sign(message, accessor);

	// return finished url
	var flickrUrl = flickrkeys.flickrTokenAccessUrl + "?" + OAuth.SignatureMethod.normalizeParameters(message.parameters) + "&oauth_signature=" + encodeURIComponent(OAuth.getParameter(message.parameters, "oauth_signature"));

	req.open("GET", flickrUrl, true);
	req.send();
};

// This checks the response content for the authorize request call
// It can either be the user data if the authentication was successful
// or it can contain an error with respective a message
// First parameter contains the response body by Flickr
// Second parameter is the id of the calling page, which will receive the
// oAuthTokenRequestDone() signal, sent by checkRequestTokenResponse()
AuthenticationHandler.prototype.checkAccessTokenResponse = function(tokenResponse, callingPage) {
	console.log("# Checking access token response content: " + tokenResponse);

	// check if authentication was successful
	// if so, the response should contain the token code and secret
	if (tokenResponse.indexOf("oauth_token_secret=") > 0) {
		console.log("# Flickr oauth request token successful");

		// decode url encoded string
		tokenResponse = decodeURIComponent(tokenResponse.replace(/\+/g, ' '));

		// get user id from the Flickr response
		var flickrUserId = "";
		var userIdStartPosition = tokenResponse.indexOf("user_nsid=");
		flickrUserId = tokenResponse.substr((userIdStartPosition + 10));
		var userIdEndPosition = flickrUserId.indexOf("&");
		if (userIdEndPosition > 0) {
			flickrUserId = flickrUserId.substr(0, userIdEndPosition);
		}

		// get oauth token from the Flickr response
		var flickrOauthToken = "";
		var flickrTokenStartPosition = tokenResponse.indexOf("oauth_token=");
		flickrOauthToken = tokenResponse.substr((flickrTokenStartPosition + 12));
		var flickrTokenEndPosition = flickrOauthToken.indexOf("&");
		if (flickrTokenEndPosition > 0) {
			flickrOauthToken = flickrOauthToken.substr(0, flickrTokenEndPosition);
		}

		// get oauth secret from the Flickr response
		var flickrOauthSecret = "";
		var flickrSecretStartPosition = tokenResponse.indexOf("oauth_token_secret=");
		flickrOauthSecret = tokenResponse.substr((flickrSecretStartPosition + 19));
		var flickrSecretEndPosition = flickrOauthSecret.indexOf("&");
		if (flickrSecretEndPosition > 0) {
			flickrOauthSecret = flickrOauthSecret.substr(0, flickrSecretEndPosition);
		}

		// store the flickr auth data in the database
		auth.storeFlickrData(flickrUserId, flickrOauthToken, flickrOauthSecret);

		// call the page and hand over the response status
		// other data has to be pulled out of the object structure
		callingPage.oAuthAccessTokenDone("AUTH_SUCCESS");

		// return status
		return auth.oauthResponseStatus;
	}

	// console.log("# Flickr auth error found");
	// auth.oauthResponseStatus = "AUTH_ERROR";
	// return "AUTH_ERROR";
};

// This validates an access token by calling a restricted method (/users/self)
// which requires a valid access token
// If the response contains a user object, the token is valid
// This also extracts the user id of the user that is logged in, which is stored
// in the database along with the token
AuthenticationHandler.prototype.validateAccessToken = function() {
	// console.log("# Validating access token");

	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (req.readyState === XMLHttpRequest.DONE) {
			if (req.status != 200) {
				// console.log("# Error happened while validating access
				// token");
				return;
			}

			// check response content
			// the correct response should contain a user object
			var jsonObject = eval('(' + req.responseText + ')');
			if ((jsonObject.error == null) && (jsonObject["data"].id != null)) {
				var userid = jsonObject["data"].id;
				auth.storeFlickrData(userid, accessToken);
				console.log("# Done validating access token for user " + userid);
			}
		}
	};

	var url = "https://api.flickr.com/v1/users/self?access_token=" + accessToken;

	req.open("GET", url, true);
	req.send();
};

// Store the access token for a user into the database along with the user id
// Note that only one token can exist in the database at any given time
AuthenticationHandler.prototype.storeFlickrData = function(userId, accessToken, accessSecret) {
	console.log("# Storing userdata into database for user: " + userId + " with token: " + accessToken + " and secret: " + accessSecret);

	// check if there is already user data in the database
	if (auth.isAuthenticated()) {
		console.log("# User already has a stored access token");
		return;
	}

	console.log("# Trying to store userdata into database");
	var db = openDatabaseSync("FlickrGO", "1.0", "FlickrGO persistent data storage", 1);
	var dataStr = "INSERT INTO userdata VALUES(?, ?, ?)";
	var data = [ userId, accessToken, accessSecret ];
	db.transaction(function(tx) {
		tx.executeSql(dataStr, data);
	});

	console.log("# Done storing userdata into database");
};

// Get the stored access token for the user
// Note that only one Flickr token can exist in the database at any given
// time
AuthenticationHandler.prototype.getStoredFlickrData = function() {
	console.log("# Getting stored userdata from database for user");

	var flickrUserdata = new Array();
	var db = openDatabaseSync("FlickrGO", "1.0", "FlickrGO persistent data storage", 1);

	db.transaction(function(tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS userdata(id TEXT, access_token TEXT, access_secret TEXT)');
	});

	db.transaction(function(tx) {
		var rs = tx.executeSql("SELECT * FROM userdata");
		if (rs.rows.length > 0) {
			flickrUserdata = rs.rows.item(0);
		}
	});

	console.log("# Done getting stored userdata from database for user");
	return flickrUserdata;
};

// Check if the user is currently authenticated with Flickr
// From the application point of view this is the case if a token exists in the
// database
// Note that the token might be invalid / rejected by Flickr but this is
// handled by the errorhandler (which also deletes an invalid token)
AuthenticationHandler.prototype.isAuthenticated = function() {
	console.log("# Checking if user is authenticated");
	var userdata = new Array();

	// get the userdata from the persistent database
	// if data is available the user already has a token
	userdata = this.getStoredFlickrData();

	if (userdata["id"] != null) {
		// user already has a token
		console.log("# User is authenticated. Returning true");
		return true;
	}

	// user does not have a token
	console.log("# User is not authenticated. Returning false");
	return false;
};

// Logout user by deleting the current token from the database
// As the isAuthenticated method relies on the database content it will return
// false from now on
AuthenticationHandler.prototype.deleteStoredFlickrData = function() {
	var db = openDatabaseSync("FlickrGO", "1.0", "FlickrGO persistent data storage", 1);

	db.transaction(function(tx) {
		tx.executeSql('DROP TABLE userdata');
	});

	return true;
};
