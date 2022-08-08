import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


const firebaseConfig = {
  apiKey: "AIzaSyCOzC5tdwdjrRJLfDtcYcYz5od3hsIwY9k",
  authDomain: "base-gamedata.firebaseapp.com",
  databaseURL: "https://base-gamedata-default-rtdb.firebaseio.com",
  projectId: "base-gamedata",
  storageBucket: "base-gamedata.appspot.com",
  messagingSenderId: "1083426347796",
  appId: "1:1083426347796:web:b32389c63b4a1f520a4001",
  measurementId: "G-D2HYRV05QR"
};
 
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
export default db;