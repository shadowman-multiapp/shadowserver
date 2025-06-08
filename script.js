import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🛠️ Replace this with your Firebase info
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

const usernameInput = document.getElementById("username");
const setNameBtn = document.getElementById("setNameBtn");
const currentNameBox = document.getElementById("currentNameBox");
const currentNameSpan = document.getElementById("currentName");
const changeNameBtn = document.getElementById("changeNameBtn");

const messageInput = document.getElementById("message");
const messagesDiv = document.getElementById("messages");
const roomSelector = document.getElementById("roomSelector");

let username = localStorage.getItem("chat_username") || "";
let currentRoom = roomSelector.value;
let roomRef = ref(db, `rooms/${currentRoom}`);
let unsubscribe = null;

const unseenCounts = {};

function updateRoomLabels() {
  for (const option of roomSelector.options) {
    const room = option.value;
    const count = unseenCounts[room] || 0;
    if (room === currentRoom || count === 0) {
      option.textContent = `#${room}`;
    } else {
      option.textContent = `#${room} (${count})`;
    }
  }
}

// 📥 Pings: check if msg includes @username or @everyone
function checkPings(msg) {
  if (!username) return false;
  return (
    msg.text.includes(`@${username}`) ||
    msg.text.includes(`@everyone`)
  );
}

function displayMessage(msg) {
  const msgElem = document.createElement("div");
  msgElem.innerHTML = `<b>${msg.name}</b>: ${msg.text}`;
  if (checkPings(msg)) {
    msgElem.style.background = "#ff0040";
    msgElem.style.color = "#fff";
  }
  messagesDiv.appendChild(msgElem);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function loadMessages() {
  messagesDiv.innerHTML = "";
  if (unsubscribe) unsubscribe();

  unsubscribe = onChildAdded(roomRef, (data) => {
    const msg = data.val();
    displayMessage(msg);
  });
}

// 👤 Set and change username
function setupUsername() {
  if (username) {
    usernameInput.style.display = "none";
    setNameBtn.style.display = "none";
    currentNameBox.style.display = "block";
    currentNameSpan.textContent = username;
    messageInput.disabled = false;
  } else {
    messageInput.disabled = true;
  }
}

setNameBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    localStorage.setItem("chat_username", username);
    setupUsername();
  }
};

changeNameBtn.onclick = () => {
  localStorage.removeItem("chat_username");
  location.reload();
};

// 💬 Send a message
window.sendMessage = () => {
  const text = messageInput.value.trim();
  if (!username || !text) return;

  push(roomRef, {
    name: username,
    text,
    time: new Date().toISOString()
  });
  messageInput.value = "";
};

// ⌨️ Enter key to send
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// 🔄 Room switching
roomSelector.addEventListener("change", () => {
  currentRoom = roomSelector.value;
  roomRef = ref(db, `rooms/${currentRoom}`);
  unseenCounts[currentRoom] = 0;
  updateRoomLabels();
  loadMessages();
});

// 🧨 Clear all messages
window.clearMessages = () => {
  if (confirm("Clear all messages in this channel?")) {
    remove(roomRef).then(() => {
      messagesDiv.innerHTML = "";
    });
  }
};

// 🔔 Global ping listeners
function setupRoomListeners() {
  const rooms = Array.from(roomSelector.options).map(opt => opt.value);

  rooms.forEach(room => {
    const refRoom = ref(db, `rooms/${room}`);
    onChildAdded(refRoom, (data) => {
      const msg = data.val();
      if (room !== currentRoom) {
        unseenCounts[room] = (unseenCounts[room] || 0) + 1;
        updateRoomLabels();
      }
    });
  });
}

// INIT
setupUsername();
loadMessages();
setupRoomListeners();
