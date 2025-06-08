import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🔧 YOUR FIREBASE CONFIG HERE
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
const messagesDiv = document.getElementById("messages");

// 🔓 Enable typing only if name exists
usernameInput.addEventListener("input", () => {
  messageInput.disabled = !usernameInput.value.trim();
});

// 💌 Send message
window.sendMessage = () => {
  const name = usernameInput.value.trim();
  const text = messageInput.value.trim();
  if (!name || !text) return;

  push(messagesRef, {
    name,
    text,
    time: new Date().toISOString()
  });
  messageInput.value = "";
};

// 📡 Live message updates
onChildAdded(messagesRef, (data) => {
  const msg = data.val();
  const msgElem = document.createElement("div");
  msgElem.innerHTML = `<b>${msg.name}</b>: ${msg.text}`;
  messagesDiv.appendChild(msgElem);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// 🧨 Nuke it
window.clearMessages = () => {
  if (confirm("Nuke the entire chatroom? 💣")) {
    remove(messagesRef).then(() => {
      messagesDiv.innerHTML = "";
    });
  }
};
