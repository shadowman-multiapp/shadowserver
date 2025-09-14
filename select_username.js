const usernameInput = document.getElementById("username");
const pfpInput = document.getElementById("pfp");
const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (!username) return alert("Enter a username!");

  // Cache username
  localStorage.setItem("username", username);

  // Cache PFP if selected
  const file = pfpInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("pfp", reader.result);
      window.location.href = "chat.html";
    };
    reader.readAsDataURL(file);
  } else {
    window.location.href = "chat.html";
  }
});
