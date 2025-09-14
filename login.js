import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEXb38Ot27LILYnzgvAigufQqSKAtki4c",
  authDomain: "shadowman-23898.firebaseapp.com",
  projectId: "shadowman-23898",
  storageBucket: "shadowman-23898.firebasestorage.app",
  messagingSenderId: "325147895543",
  appId: "1:325147895543:web:5715c8dc5000dd719795f2",
  measurementId: "G-PE4KRDY7S6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("loginBtn"); // button text can say "Register"
const googleBtn = document.getElementById("googleBtn");
const status = document.getElementById("status");

// Registration with email/password
registerBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    status.textContent = "Please enter both email and password.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      localStorage.setItem("uid", userCredential.user.uid);
      localStorage.setItem("email", userCredential.user.email);
      window.location.href = "select_username.html";
    })
    .catch(error => {
      status.textContent = error.message;
    });
});

// Google OAuth registration/login
googleBtn.addEventListener("click", () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(result => {
      const user = result.user;
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("email", user.email);
      window.location.href = "select_username.html";
    })
    .catch(err => status.textContent = err.message);
});
