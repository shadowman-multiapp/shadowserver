import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🚨 REPLACE WITH YOUR FIREBASE CONFIG!
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

// 🧠 Elements
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const messagesDiv = document.getElementById("messages");
const roomSelector = document.getElementById("roomSelector");

let currentRoom = roomSelector.value;
let roomRef = ref(db, `rooms/${currentRoom}`);
let unsubscribe = null;

// Enable/disable input
usernameInput.addEventListener("input", () => {
  messageInput.disabled = !usernameInput.value.trim();
});

// 🔄 Handle room switch
roomSelector.addEventListener("change", () => {
  currentRoom = roomSelector.value;
  roomRef = ref(db, `rooms/${currentRoom}`);
  loadMessages();
});

// 💬 Send a message
window.sendMessage = () => {
  const name = usernameInput.value.trim();
  const text = messageInput.value.trim();
  if (!name || !text) return;

  push(roomRef, {
    name,
    text,
    time: new Date().toISOString()
  });
  messageInput.value = "";
};

// 🧨 Clear chat in current room
window.clearMessages = () => {
  if (confirm("Clear all messages in this channel?")) {
    remove(roomRef).then(() => {
      messagesDiv.innerHTML = "";
    });
  }
};

// 📡 Load messages in current room
function loadMessages() {
  messagesDiv.innerHTML = "";

  if (unsubscribe) unsubscribe(); // detach old listener

  unsubscribe = onChildAdded(roomRef, (data) => {
    const msg = data.val();
    const msgElem = document.createElement("div");
    msgElem.innerHTML = `<b>${msg.name}</b>: ${msg.text}`;
    messagesDiv.appendChild(msgElem);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// 🔃 Initial load
loadMessages();
