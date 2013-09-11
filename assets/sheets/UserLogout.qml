// *************************************************** //
// User Logout Page
//
// The user profile page shows the personal information
// of the currently logged in user.
// If the user is not logged in, then a link to the
// login process is shown.
// *************************************************** //
import bb.cascades 1.0

Page {
    id: userLogoutSheet
    Container {
        // layout definition
        layout: DockLayout {
        }

        // actual content
        Container {
            layout: StackLayout {
            }
            horizontalAlignment: HorizontalAlignment.Left
            verticalAlignment: VerticalAlignment.Center

            // instago headline
            Container {
                leftPadding: 15
                Label {
                    text: qsTr("Logout successful")
                    textStyle.base: SystemDefaults.TextStyles.BigText
                    multiline: true
                }
            }

            // instago main about text
            Container {
                leftPadding: 15
                rightPadding: 15
                Label {
                    text: qsTr("You are logged out of Flickr")
                    textStyle.base: SystemDefaults.TextStyles.BodyText
                    multiline: true
                }
            }
        }
    }

    // close action for the sheet
    actions: [
        ActionItem {
            title: "Close"
            ActionBar.placement: ActionBarPlacement.OnBar

            // close sheet when pressed
            // note that the sheet is defined in the main.qml
            onTriggered: {
                logoutSheet.close();
            }
        }
    ]
}
