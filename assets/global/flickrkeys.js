// *************************************************** //
// Flickrkeys
//
// These are the keys for the Flickr client
// You can get your own here:
// http://www.flickr.com/services/
// (you need to be logged into Flickr to create apps)
// *************************************************** //

// singleton instance of class
var flickrkeys = new FlickrKeys();

// class function that gets the prototype methods
function FlickrKeys()
{
	// Flickr client id
	this.flickrClientId = "ade5c803d5c7e7bc2012f2a0785f829c";

	// Flickr client secret
	this.flickrClientSecret = "82c6623054bfa8df";

	// Flickr API URL
	this.flickrAPIUrl = "http://www.flickr.com";

	// Flickr URL to request a permanent token
	this.flickrTokenRequestUrl = this.flickrAPIUrl + "/services/oauth/request_token";
	
	// Flickr URL the user authenticates against
	this.flickrAuthorizeUrl = this.flickrAPIUrl + "/services/oauth/authorize";

	// Flickr URL the user authenticates against
	this.flickrTokenAccessUrl = this.flickrAPIUrl + "/services/oauth/access_token";

	// Flickr callback
	this.flickrCallback = "http://www.instago.mobi";
}


/*

/?mobile=1&api_key=f94d2c59e49287c594c7537ec6000500&perms=write&api_sig=8c3cbd59dc6ca2b6eca9a9e84dbd99ca&.data=LnlpZCUzZGIzUHFDSmF4UjBtTDc1dy0lMjYueWd1aWQlM2RZVk41N0VKNlk3UFlQSEpYWEpRN0xGT1FZQSUyNi55dH
MlM2QyMDEzMDQwMTE3MzAwNyUyNi55Z3QlM2REaXJrJTI2LnlpbnRsJTNkZGUlMjYueWNvJTNkZGUlMjYueWVtJTNkZGVsYXhAc3VuZGFuY2VyaW5jLmRlJTI2Lnl5bSUzZCUyNi55YWclM2QzNSUyNi55bm0lM2REaXJrIFNvbmd1ZXIlMjYueWhpZCUzZGRzb25ndWV
yJTI2Lnl0b2tlbiUzZEF...

# Authentication URL changed: http://www.flickr.com/cookie_check.gne?pass=/services/auth/?mobile=1&api_key=f94d2c59e49287c594c7537ec6000500&perms=write&api_sig=8c3cbd59dc6ca2b6eca9a9e84dbd99ca&fail=register_cookies.gne
# Authentication URL changed: http://www.flickr.com/services/auth/?mobile=1&api_key=f94d2c59e49287c594c7537ec6000500&perms=write&api_sig=8c3cbd59dc6ca2b6eca9a9e84dbd99ca
# Authentication URL changed: http://www.flickr.com/services/auth/

*/