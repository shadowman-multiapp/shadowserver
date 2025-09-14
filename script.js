import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ------------------- Firebase config -------------------
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
const auth = getAuth(app);

// ------------------- DOM Elements -------------------
const messagesDiv = document.getElementById("messages");
const roomSelector = document.getElementById("roomSelector");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");

// ------------------- Chat Setup -------------------
const rooms = ["shadowmain", "laughables", "gaming", "shadow-arts", "shadowscorner", "talktoadmins"];
let currentRoom = "shadowmain";
let roomRef = ref(db, `rooms/${currentRoom}`);
let unsubscribe = null;
const unseenCounts = {};
const testerUsers = ["ForeverGray_:D", "Avery"];
let currentUser = { username: null, pfp: null };

// Populate room selector dynamically
roomSelector.innerHTML = "";
rooms.forEach(room => {
  const opt = document.createElement("option");
  opt.value = room;
  opt.textContent = `#${room}`;
  roomSelector.appendChild(opt);
});
roomSelector.value = currentRoom;

// ------------------- Auth Check -------------------
onAuthStateChanged(auth, user => {
  if (!user) {
    // Not logged in, redirect to login
    window.location.href = "login.html";
  } else {
    // Logged in → get cached username and PFP
    currentUser.username = localStorage.getItem("username") || "Anonymous";
    currentUser.pfp = localStorage.getItem("pfp") || null;

    messageInput.disabled = false; // enable typing
    initChat();
  }
});

// ------------------- Chat Functions -------------------
function updateRoomLabels() {
  for (const option of roomSelector.options) {
    const room = option.value;
    const count = unseenCounts[room] || 0;
    option.textContent = (room === currentRoom || count === 0) ? `#${room}` : `#${room} (${count})`;
  }
}

roomSelector.addEventListener("change", () => {
  currentRoom = roomSelector.value;
  roomRef = ref(db, `rooms/${currentRoom}`);
  unseenCounts[currentRoom] = 0;
  updateRoomLabels();
  loadMessages();
});

// Send message
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentUser.username) return;

  push(roomRef, {
    name: currentUser.username,
    pfp: currentUser.pfp,
    text,
    time: new Date().toISOString()
  });

  messageInput.value = "";
}

// Clear messages
clearBtn.addEventListener("click", () => {
  if (confirm("Clear all messages in this channel?")) {
    remove(roomRef).then(() => messagesDiv.innerHTML = "");
  }
});

// Display message
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

  const pfpHtml = msg.pfp ? `<img src="${msg.pfp}" class="chat-pfp" /> ` : "";
  msgElem.innerHTML = `${pfpHtml}<span style="color:${nameColor};"><b>${msg.name}</b></span>${nameSuffix}: <span style="color:white;">${msg.text}</span>`;
  messagesDiv.appendChild(msgElem);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Load messages
function loadMessages() {
  messagesDiv.innerHTML = "";
  if (unsubscribe) unsubscribe();

  unsubscribe = onChildAdded(roomRef, data => {
    displayMessage(data.val());
  });
}

// Listen for unseen messages in all rooms
function setupRoomListeners() {
  rooms.forEach(room => {
    const refRoom = ref(db, `rooms/${room}`);
    onChildAdded(refRoom, data => {
      if (room !== currentRoom) {
        unseenCounts[room] = (unseenCounts[room] || 0) + 1;
        updateRoomLabels();
      }
    });
  });
}

// Initialize chat after auth
function initChat() {
  loadMessages();
  setupRoomListeners();
  messageInput.disabled = false;
}

