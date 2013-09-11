// *************************************************** //
// Flickr Oauth Example Main Page
//
// This is a simple example project how to handle Oauth
// processes in QML / Canvas apps with pure JavaScript.
// The example uses Flickr as a demo platform
// *************************************************** //
import bb.cascades 1.0

// shared js files
import "classes/authenticationhandler.js" as Authentication
import "classes/networkhandler.js" as Network

// main page
Page {
    id: flickrOauthExampleMainPage

    // main content container
    Container {
        layout: DockLayout {
        }

        // call to action for users that are logged in
        Label {
            id: labelUserIsLoggedIn
            text: qsTr("You are logged in. Tap to log out")
            multiline: true
            textStyle.base: SystemDefaults.TextStyles.BigText
            verticalAlignment: VerticalAlignment.Center
            horizontalAlignment: HorizontalAlignment.Center
            visible: false
            onTouch: {
                // delete the stored user data of the user from the database
                Authentication.auth.deleteStoredFlickrData();

                labelUserIsLoggedOut.visible = true;
                labelUserIsLoggedIn.visible = false;

                // open logout notification
                var logoutPage = logoutComponent.createObject();
                logoutSheet.setContent(logoutPage);
                logoutSheet.open();
            }
        }

        // call to action for users that are not logged in yet
        Label {
            id: labelUserIsLoggedOut
            text: qsTr("Tap to start Flickr login process")
            multiline: true
            textStyle.base: SystemDefaults.TextStyles.BigText
            verticalAlignment: VerticalAlignment.Center
            horizontalAlignment: HorizontalAlignment.Center
            visible: false
            onTouch: {
                // open login sheet and start oauth process
                var loginPage = loginComponent.createObject();
                loginSheet.setContent(loginPage);
                loginSheet.open();
            }
        }
    }

    // check states of application and configure it accordingly
    onCreationCompleted: {
        console.log("# Checking application state");

        // application state is bound to authentication state
        if (! Authentication.auth.isAuthenticated()) {
            console.log("# User not logged in");
            labelUserIsLoggedOut.visible = true;
        } else {
            console.log("# User is logged in");
            labelUserIsLoggedIn.visible = true;
        }
    }

    attachedObjects: [
        // sheet for login page
        // this is used by the UserLogin page
        Sheet {
            id: loginSheet

            // attach a component for the login sheet
            attachedObjects: [
                ComponentDefinition {
                    id: loginComponent
                    source: "sheets/UserLogin.qml"
                }
            ]
        },
        // sheet for logout page
        // this is used by the UserLogout page
        Sheet {
            id: logoutSheet

            // attach a component for the lohout sheet
            attachedObjects: [
                ComponentDefinition {
                    id: logoutComponent
                    source: "sheets/UserLogout.qml"
                }
            ]
        }
    ]
}
