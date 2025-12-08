// Firebase Configuration for FAMILYNK
const firebaseConfig = {
  apiKey: "AIzaSyDh8RJrq57lPmsLe39neiKy2PSGB2Qhny4",
  authDomain: "familynk-dfadb.firebaseapp.com",
  projectId: "familynk-dfadb",
  storageBucket: "familynk-dfadb.firebasestorage.app",
  messagingSenderId: "778921307320",
  appId: "1:778921307320:web:4cb3952ea374054409584d",
  measurementId: "G-NZ540LGYV2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('Usuario logueado:', user.email);
  } else {
    console.log('No hay usuario logueado');
  }
});
