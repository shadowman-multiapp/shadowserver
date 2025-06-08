import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🌍 Replace this with your Firebase info
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

// Elements
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const messagesBox = document.getElementById("messages");

// 💾 Load username from localStorage
if (localStorage.getItem("chatUsername")) {
  usernameInput.value = localStorage.getItem("chatUsername");
  messageInput.disabled = false;
}

// 🔓 Enable message box once username exists
usernameInput.addEventListener("input", () => {
  const hasName = usernameInput.value.trim();
  messageInput.disabled = !hasName;

  if (hasName) {
    localStorage.setItem("chatUsername", usernameInput.value.trim());
  }
});

// 💌 Send message
window.sendMessage = () => {
  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();

  if (!username) {
    alert("Enter a username first 🤨");
    usernameInput.focus();
    return;
  }

  if (!message) {
    alert("No ghost messages allowed 👻");
    return;
  }

  const timestamp = new Date().toISOString();

  push(messagesRef, {
    name: username,
    text: message,
    time: timestamp
  });

  messageInput.value = "";
};

// 🧠 Format timestamp to HH:MM
function formatTime(iso) {
  const date = new Date(iso);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

// 📡 Realtime listener (last 50 messages)
const messagesQuery = query(messagesRef, limitToLast(50));
onChildAdded(messagesQuery, (data) => {
  const msg = data.val();
  const msgElem = document.createElement("div");
  msgElem.innerHTML = `<span class="user">${msg.name}</span> <span class="time">[${formatTime(msg.time)}]</span>: <span class="text">${msg.text}</span>`;
  messagesBox.appendChild(msgElem);
  messagesBox.scrollTop = messagesBox.scrollHeight;
});

import { remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

window.clearMessages = () => {
  const confirmDelete = confirm("Are you sure you want to wipe EVERYTHING? 😬");

  if (confirmDelete) {
    remove(messagesRef)
      .then(() => {
        messagesBox.innerHTML = "";
        alert("Chatroom has been cleared. RIP messages 💀");
      })
      .catch((error) => {
        console.error("Failed to clear chat:", error);
        alert("Couldn't nuke the chat. Try again?");
      });
  }
};

