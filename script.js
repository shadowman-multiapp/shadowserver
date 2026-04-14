import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

window.addEventListener("DOMContentLoaded", () => {
  const testerUsers = ["ForeverGray_:D", "Avery"];

  const firebaseConfig = {
    apiKey: "AIzaSyB2i8r36HXy6aUfI290pSR8XneLOad9uj8",
    authDomain: "shadowman-23898.firebaseapp.com",
    projectId: "shadowman-23898",
    storageBucket: "shadowman-23898.firebasestorage.app",
    messagingSenderId: "325147895543",
    appId: "1:325147895543:web:d41242cabcd38b239795f2",
    measurementId: "G-MXBQ75YPC0"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  const usernameInput = document.getElementById("username");
  const messageInput = document.getElementById("message");
  const messagesDiv = document.getElementById("messages");
  const roomSelector = document.getElementById("roomSelector");
  const clearBtn = document.getElementById("clearBtn");

  const rooms = ["shadowmain", "laughables", "gaming", "shadow-arts", "shadowscorner", "talktoadmins"];

  let currentRoom = "shadowmain";
  let roomRef = ref(db, `rooms/${currentRoom}`);
  let unsubscribe = null;

  const unseenCounts = {};
  let notificationEnabled = false;
  let isInitialLoad = true;

  // -----------------------------
  // HTML escape
  function escapeHTML(str) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  // -----------------------------
  // Markdown parser
  function parseMarkdown(text) {
    let safe = escapeHTML(text);

    safe = safe.replace(/\*\*\*(.*?)\*\*\*/g, "<b><i>$1</i></b>");
    safe = safe.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    safe = safe.replace(/\*(.*?)\*/g, "<i>$1</i>");

    return safe;
  }

  // -----------------------------
  // Time formatting
  function formatTime(iso) {
    return new Date(iso).toTimeString().split(" ")[0];
  }

  // -----------------------------
  // Notifications
  function setupNotifications() {
    if (!("Notification" in window)) return;

    Notification.requestPermission().then(permission => {
      notificationEnabled = permission === "granted";
    });
  }

  function notify(msg) {
    if (!notificationEnabled) return;
    if (document.visibilityState === "visible") return;
    if (msg.name === usernameInput.value.trim()) return;

    new Notification(`#${currentRoom}`, {
      body: `${msg.name}: ${msg.text}`
    });
  }

  // -----------------------------
  // Room setup
  roomSelector.innerHTML = "";
  rooms.forEach(room => {
    const opt = document.createElement("option");
    opt.value = room;
    opt.textContent = `#${room}`;
    roomSelector.appendChild(opt);
  });

  roomSelector.value = currentRoom;

  function updateRoomLabels() {
    for (const option of roomSelector.options) {
      const room = option.value;
      const count = unseenCounts[room] || 0;

      option.textContent =
        room === currentRoom || count === 0
          ? `#${room}`
          : `#${room} (${count})`;
    }
  }

  roomSelector.addEventListener("change", () => {
    currentRoom = roomSelector.value;
    roomRef = ref(db, `rooms/${currentRoom}`);

    unseenCounts[currentRoom] = 0;
    updateRoomLabels();

    loadMessages();
  });

  // -----------------------------
  // Send message
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

  messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  // -----------------------------
  // Login / PIN
  usernameInput.addEventListener("input", () => {
    const name = usernameInput.value.trim();
    localStorage.setItem("savedUsername", name);

    if (name === "ForeverSky_:D" && !window.ForeverSkyUnlocked) {
      const pin = prompt("👮 Enter PIN:");

      if (pin === "1997") {
        window.ForeverSkyUnlocked = true;
        messageInput.disabled = false;
        clearBtn.style.display = "block";
      } else {
        usernameInput.value = "";
        messageInput.disabled = true;
        clearBtn.style.display = "none";
      }
    } else {
      messageInput.disabled = !name;

      clearBtn.style.display =
        (name === "ForeverSky_:D" && window.ForeverSkyUnlocked)
          ? "block"
          : "none";
    }
  });

  // -----------------------------
  // Clear chat
  window.clearMessages = () => {
    if (confirm("Clear all messages in this channel?")) {
      remove(roomRef);
      messagesDiv.innerHTML = "";
    }
  };

  // -----------------------------
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

    const time = msg.time ? formatTime(msg.time) : "";
    const formattedText = parseMarkdown(msg.text);

    msgElem.innerHTML =
      `<span style="color:gray;">[${time}]</span> ` +
      `<span style="color:${nameColor};"><b>${msg.name}</b></span>` +
      `${nameSuffix}: <span style="color:white;">${formattedText}</span>`;

    messagesDiv.appendChild(msgElem);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // -----------------------------
  // Load messages (FIXED NOTIFICATIONS)
  function loadMessages() {
    messagesDiv.innerHTML = "";

    if (unsubscribe) unsubscribe();

    unsubscribe = onChildAdded(roomRef, data => {
      const msg = data.val();

      displayMessage(msg);

      // 🔥 KEY FIX: no notifications during initial load
      if (!isInitialLoad) {
        notify(msg);
      }

      if (msg.name !== usernameInput.value.trim()) {
        unseenCounts[currentRoom] = 0;
        updateRoomLabels();
      }
    });

    // finish initial load phase
    isInitialLoad = false;
  }

  // -----------------------------
  // Room listeners
  function setupRoomListeners() {
    rooms.forEach(room => {
      const r = ref(db, `rooms/${room}`);

      onChildAdded(r, data => {
        if (room !== currentRoom) {
          unseenCounts[room] = (unseenCounts[room] || 0) + 1;
          updateRoomLabels();
        }
      });
    });
  }

  // -----------------------------
  // INIT
  setupNotifications();
  loadMessages();
  setupRoomListeners();
});