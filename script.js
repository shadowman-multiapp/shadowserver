import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🔥 Replace these with your Firebase config
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
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");

// 🔓 Unlock message input once username is filled
usernameInput.addEventListener("input", () => {
  messageInput.disabled = !usernameInput.value.trim();
});

// 💌 Send message
window.sendMessage = () => {
  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();

  if (!username) {
    alert("Enter a username first, ya goober 😤");
    usernameInput.focus();
    return;
  }

  if (!message) {
    alert("You can't send air 💨");
    return;
  }

  push(messagesRef, {
    name: username,
    text: message
  });

  messageInput.value = "";
};

// 📡 Listen for incoming messages
onChildAdded(messagesRef, (data) => {
  const msg = data.val();
  const msgElem = document.createElement("div");
  msgElem.textContent = `${msg.name}: ${msg.text}`;
  document.getElementById("messages").appendChild(msgElem);
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
});
