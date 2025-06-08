window.addEventListener("load", () => {
  const saved = localStorage.getItem("savedUsername");
  if (saved) {
    usernameInput.value = saved;
    const event = new Event("input");
    usernameInput.dispatchEvent(event); // trigger the check logic
  }
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const testerUsers = ["ForeverGray_:D", "ForeverSkye_:D", "Rebecca!🐾🦴"];

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
// Load saved username on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("savedUsername");
  if (savedName) {
    usernameInput.value = savedName;

    // Trigger input event manually to re-check PIN or enable message input
    usernameInput.dispatchEvent(new Event("input"));
  }
});

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
  const name = usernameInput.value.trim();
  const clearBtn = document.getElementById("clearBtn");

  // 💾 Save to localStorage
  localStorage.setItem("savedUsername", name);

  if (name === "ForeverSky_:D" && !window.ForeverSkyUnlocked) {
    const pin = prompt("👮‍♂️ Enter PIN for ForeverSky_:D access:");
    if (pin === "1997") {
      alert("✅ Welcome, Creator!");
      window.ForeverSkyUnlocked = true;
      messageInput.disabled = false;
      clearBtn.style.display = "block";
    } else {
      alert("❌ Wrong PIN. Access denied.");
      usernameInput.value = "";
      localStorage.removeItem("savedUsername"); // nuke that imposter
      messageInput.disabled = true;
      clearBtn.style.display = "none";
    }
  } else {
    messageInput.disabled = !name;
    clearBtn.style.display = (name === "ForeverSky_:D" && window.ForeverSkyUnlocked) ? "block" : "none";
  }
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

  let nameColor = "red";
  let nameSuffix = "";

  if (msg.name === "ForeverSky_:D") {
    nameColor = "cyan";
    nameSuffix = ' <span style="color:white">(creatorr)</span>';
  } else if (testerUsers.includes(msg.name)) {
    nameColor = "limegreen";
    nameSuffix = ' <span style="color:limegreen">(tester & friend)</span>';
  }

  msgElem.innerHTML = `<span style="color:${nameColor};"><b>${msg.name}</b></span>${nameSuffix}: <span style="color:white;">${msg.text}</span>`;
  messagesDiv.appendChild(msgElem);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// INIT
loadMessages();
setupRoomListeners();
