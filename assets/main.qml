import bb.cascades 1.0

Page {
    Container {
        //Todo: fill me with QML
        Label {
            // Localized text with the dynamic translation and locale updates support
            text: qsTr("Hello World") + Retranslate.onLocaleOrLanguageChanged
            textStyle.base: SystemDefaults.TextStyles.BigText
        }
    }
}
