var config = {
    apiKey: "AIzaSyCwBHggmC679h2Tqt0fZVjki688LMp1KIM",
    databaseURL: "https://sokulibe-decoder.firebaseio.com",
};

var currentDB = null;

function InitializeJP() {
    if (currentDB != null) {
        currentDB.delete();
    }
    currentDB = firebase.initializeApp(config, "JP");
    currentDB.database().goOffline();
}

InitializeJP();

