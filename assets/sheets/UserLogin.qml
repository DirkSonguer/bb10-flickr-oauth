// *************************************************** //
// User Login Page
//
// The user profile page shows the personal information
// of the currently logged in user.
// If the user is not logged in, then a link to the
// login process is shown.
// *************************************************** //
import bb.cascades 1.0

// shared js files
import "../global/globals.js" as Globals
import "../global/flickrkeys.js" as FlickrKeys
import "../classes/authenticationhandler.js" as Authentication

Page {
    id: userLoginSheet
    property bool authenticationDone: false

    // signal if oauth token request was successful
    signal oAuthTokenRequestDone(variant tokenStatus);

    // signal if oauth token request encountered an error
    signal oAuthTokenRequestError(variant tokenStatus)

    // signal if oauth access token request was successful
    signal oAuthAccessTokenDone(variant tokenStatus)

    // signal if oauth access token request encountered an error
    signal oAuthAccessTokenError(variant tokenStatus)

    Container {
        // layout definition
        layout: DockLayout {
        }

        // loading indicator
        // the component will be set invisible when loading is finished
        // visibility is controlled by the web view component
        ActivityIndicator {
            id: loginLoading
            horizontalAlignment: HorizontalAlignment.Center
            verticalAlignment: VerticalAlignment.Center
            minWidth: 200

            // set initial visibility to true
            running: true
        }

        // web view
        // browser window showing the Instagram authentication process
        WebView {
            id: loginWebView
            horizontalAlignment: HorizontalAlignment.Center
            verticalAlignment: VerticalAlignment.Center
            visible: false

            // if loading state has changed, check for current state
            // if web view is loading, show activity indicator
            onLoadingChanged: {
                if (! authenticationDone) {
                    if (loadRequest.status == WebLoadStatus.Started) {
                        loginWebView.visible = false
                        loginLoading.running = true;
                        loginLoading.visible = true;
                    } else {
                        loginLoading.running = false;
                        loginLoading.visible = false;
                        loginWebView.visible = true
                    }
                }
            }

            // check on every page load if the oauth token is in it
            onUrlChanged: {
                console.log("# Authentication URL changed: " + url);
                var authorizeStatus = Authentication.auth.checkAuthorizationStatus(url);

                if (authorizeStatus === "AUTH_SUCCESS") {
                    console.log("# Authentication successful: " + Authentication.auth.oauthVerifierCode);

                    // changing views to login notification
                    loginWebView.visible = false
                    authenticationDone = true;

                    // get permanent token
                    Authentication.auth.getAccessToken(userLoginSheet);
                }
            }
        }

        // success message that is shown when the authentication went ok
        Container {
            id: loginSuccessContainer

            // layout definition
            layout: StackLayout {
            }
            horizontalAlignment: HorizontalAlignment.Left
            verticalAlignment: VerticalAlignment.Center
            visible: false;

            // instago headline
            Container {
                leftPadding: 15
                Label {
                    text: qsTr("Thank you for authenticating")
                    textStyle.base: SystemDefaults.TextStyles.BigText
                    multiline: true
                }
            }
        }

        // error message that is shown when the authentication went wrong
        Container {
            id: loginErrorContainer

            // layout definition
            layout: StackLayout {
            }
            horizontalAlignment: HorizontalAlignment.Center
            verticalAlignment: VerticalAlignment.Center
            visible: false;

            // instago headline
            Container {
                topPadding: 15
                leftPadding: 15
                Label {
                    text: qsTr("Authentication failed")
                    textStyle.base: SystemDefaults.TextStyles.BigText
                    multiline: true
                }
            }
        }
    }

    // check states of application and configure it accordingly
    onCreationCompleted: {
        if (! Authentication.auth.isAuthenticated()) {
            console.log("# Starting authentication process");
            Authentication.auth.getRequestToken(userLoginSheet);
        } else {
            console.log("# User already authenticated. Closing sheet");
            loginSheet.close();
        }
    }

    onOAuthTokenRequestDone: {
        console.log("# OAuth token request done: " + tokenStatus);
        if (tokenStatus == "AUTH_SUCCESS") {
            // build the authorize url and use the WebView to display it
            var flickrAuthorizeUrl = FlickrKeys.flickrkeys.flickrAuthorizeUrl;
            flickrAuthorizeUrl += "?oauth_token=" + Authentication.auth.oauthRequestToken;
            flickrAuthorizeUrl += "&perms=write";
            console.log("Setting URL: " + flickrAuthorizeUrl);
            loginWebView.url = flickrAuthorizeUrl;

            // reset oauth status
            Authentication.auth.oauthStatus = "";
        }
    }

    onOAuthTokenRequestError: {
        console.log("# OAuth token request went wrong: " + tokenStatus.errorMessage);
        loginLoading.running = false;
        loginLoading.visible = false;
        loginAdditionalErrorText.text += "Flickr says: " + tokenStatus.errorMessage;
        loginErrorContainer.visible = true;
    }

    onOAuthAccessTokenDone: {
        console.log("# OAuth access token request done: " + tokenStatus);
        loginLoading.running = false;
        loginLoading.visible = false;
        loginSuccessContainer.visible = true;
        labelUserIsLoggedOut.visible = false;
        labelUserIsLoggedIn.visible = true;
    }

    onOAuthAccessTokenError: {
        console.log("# OAuth access token request went wrong: " + tokenStatus.errorMessage);
        loginLoading.running = false;
        loginLoading.visible = false;
        loginAdditionalErrorText.text += "Flickr says: " + tokenStatus.errorMessage;
        loginErrorContainer.visible = true;
    }

    // close action for the sheet
    actions: [
        ActionItem {
            title: "Close"
            ActionBar.placement: ActionBarPlacement.OnBar

            // close sheet when pressed
            // note that the sheet is defined in the main.qml
            onTriggered: {
                loginSheet.close();
            }
        }
    ]
}
