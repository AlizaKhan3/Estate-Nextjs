// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzpnkFF0DiZ32MVAUaMiTEu83A7QAUnx8",
  authDomain: "onlinefood-7799a.firebaseapp.com",
  databaseURL: "https://onlinefood-7799a-default-rtdb.firebaseio.com",
  projectId: "onlinefood-7799a",
  storageBucket: "onlinefood-7799a.appspot.com",
  messagingSenderId: "119235898205",
  appId: "1:119235898205:web:9a6ca0302608a92a7556b4"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);