/**
 * HYNA STUDIO WORKSPACE - FIREBASE CLOUD BACKEND CONFIGURATION
 * Connected Live to User's Firebase Realtime Database
 */

const firebaseConfig = {
  databaseURL: "https://hyna-workspace-b8748-default-rtdb.firebaseio.com/",
  projectId: "hyna-workspace-b8748",
  authDomain: "hyna-workspace-b8748.firebaseapp.com",
  storageBucket: "hyna-workspace-b8748.appspot.com"
};

// Initialize Firebase App & Realtime Database
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  window.db = firebase.database ? firebase.database() : null;
  console.log("⚡ [Firebase Live] Connected to https://hyna-workspace-b8748-default-rtdb.firebaseio.com/");
} else {
  console.warn("⚠️ [Firebase] SDK loading...");
}
