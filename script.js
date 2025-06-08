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
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abc123def456"
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

// INIT
loadMessages();
setupRoomListeners();
