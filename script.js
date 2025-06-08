import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ⚠️ Your Firebase Config here
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
const messageInput = document.getElementById("message");
const messagesDiv = document.getElementById("messages");
const roomSelector = document.getElementById("roomSelector");

let currentRoom = roomSelector.value;
let roomRef = ref(db, `rooms/${currentRoom}`);
let unsubscribe = null;

// ✨ Track unseen messages
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

// 🔄 Switch room
roomSelector.addEventListener("change", () => {
  currentRoom = roomSelector.value;
  roomRef = ref(db, `rooms/${currentRoom}`);
  unseenCounts[currentRoom] = 0;
  updateRoomLabels();
  loadMessages();
});

// 💬 Send message
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

// ⌨️ Enter key sends message
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// Enable/disable message typing
usernameInput.addEventListener("input", () => {
  messageInput.disabled = !usernameInput.value.trim();
});

// ☢️ Clear current room
window.clearMessages = () => {
  if (confirm("Clear all messages in this channel?")) {
    remove(roomRef).then(() => {
      messagesDiv.innerHTML = "";
    });
  }
};

// 📡 Load messages in selected room
function loadMessages() {
  messagesDiv.innerHTML = "";
  if (unsubscribe) unsubscribe();

  unsubscribe = onChildAdded(roomRef, (data) => {
    const msg = data.val();
    displayMessage(msg);
  });
}

// 🔔 Listen globally to ALL rooms
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

// 📥 Display message
function displayMessage(msg) {
  const msgElem = document.createElement("div");
  msgElem.innerHTML = `<b>${msg.name}</b>: ${msg.text}`;
  messagesDiv.appendChild(msgElem);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function displayMessage(msg) {
  const msgElem = document.createElement("div");
  msgElem.innerHTML = `<b>${msg.name}</b>: ${msg.text}`;
  messagesDiv.appendChild(msgElem);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  const username = usernameInput.value.trim();

  // 🛎 PING CHECK
  if (msg.name !== username) {
    const msgLower = msg.text.toLowerCase();
    const userLower = `@${username.toLowerCase()}`;

    if (msgLower.includes(userLower) || msgLower.includes("@everyone")) {
      // Ping the current user
      alert(`🔔 Ping from ${msg.name}:\n${msg.text}`);
      // Optional: you could also vibrate the device or flash the tab title
    }
  }
}

usernameInput.addEventListener("input", () => {
  const hasUsername = usernameInput.value.trim().length > 0;
  messageInput.disabled = !hasUsername;
});


// INIT
loadMessages();
setupRoomListeners();
