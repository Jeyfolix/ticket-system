document.addEventListener("DOMContentLoaded", () => {
  initializeForm();

  const form = document.getElementById("addUserForm");
  const generateIdBtn = document.getElementById("generateIdBtn");
  const resetBtn = document.getElementById("resetBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const submitBtn = document.getElementById("submitBtn");
  const roleField = document.getElementById("role");
  const messageContainer = document.getElementById("messageContainer");
  const messageContent = document.getElementById("messageContent");
  const loadingOverlay = document.getElementById("loadingOverlay");

  function initializeForm() {
    generateUserId(); // Generate default or initial ID
    setCurrentTimestamp();
    document.getElementById("lastLogin").value = "Never";
    document.getElementById("loginCount").value = "0";
  }

  function generateUserId() {
    const role = document.getElementById("role").value.toLowerCase();
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    let prefix = "USR";

    switch (role) {
      case "admin":
        prefix = "ADB";
        break;
      case "user":
        prefix = "UDB";
        break;
      case "moderator":
        prefix = "MDB";
        break;
      case "guest":
        prefix = "GDB";
        break;
      default:
        prefix = "USR";
    }

    const userId = `${prefix}-${random}-${year}`;
    document.getElementById("userId").value = userId;
  }

  function setCurrentTimestamp() {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace("T", " ");
    document.getElementById("createdAt").value = formattedDate;
  }

  // Re-generate user ID when role is selected/changed
  roleField.addEventListener("change", generateUserId);
  generateIdBtn.addEventListener("click", () => {
    generateUserId();
    showMessage("New User ID generated successfully!", "success");
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset the form?")) {
      form.reset();
      initializeForm();
      hideMessage();
      showMessage("Form has been reset successfully!", "info");
    }
  });

  cancelBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to cancel?")) {
      window.location.href = "view-users.html";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateForm()) submitForm();
  });

  function validateForm() {
    const formData = new FormData(form);
    const errors = [];

    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const role = formData.get("role").trim();
    const phone = formData.get("phone").trim();

    if (!name || name.length < 2) errors.push("Full name must be at least 2 characters.");
    if (!email || !isValidEmail(email)) errors.push("A valid email is required.");
    if (!role) errors.push("Role selection is required.");
    if (phone && !isValidKenyanPhone(phone)) errors.push("Enter a valid Kenyan phone number.");

    if (errors.length > 0) {
      showMessage(errors.join("<br>"), "error");
      return false;
    }
    return true;
  }

  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function isValidKenyanPhone(phone) {
    const sanitized = phone.replace(/\s+/g, "");
    return /^(?:254|\+254|0)?7\d{8}$/.test(sanitized);
  }

  function submitForm() {
    const formData = new FormData(form);
    showLoading(true);
    setSubmitButtonLoading(true);

    fetch("../backend/add_user_api.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showMessage(`User "${data.user.name}" created successfully!`, "success");
          setTimeout(() => {
            form.reset();
            initializeForm();
          }, 2000);

          setTimeout(() => {
            if (confirm("Go to users list now?")) {
              window.location.href = "view-users.html";
            }
          }, 3000);
        } else {
          showMessage(data.message || "Failed to create user.", "error");
        }
      })
      .catch(() => {
        showMessage("Network or server error. Please try again.", "error");
      })
      .finally(() => {
        showLoading(false);
        setSubmitButtonLoading(false);
      });
  }

  function showMessage(message, type) {
    messageContent.innerHTML = message;
    messageContainer.className = `message-container ${type}`;
    messageContainer.style.display = "block";

    if (type === "success" || type === "info") {
      setTimeout(hideMessage, 5000);
    }

    messageContainer.scrollIntoView({ behavior: "smooth" });
  }

  function hideMessage() {
    messageContainer.style.display = "none";
  }

  function showLoading(show) {
    loadingOverlay.style.display = show ? "flex" : "none";
  }

  function setSubmitButtonLoading(loading) {
    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoading = submitBtn.querySelector(".btn-loading");

    if (loading) {
      btnText.style.display = "none";
      btnLoading.style.display = "inline-flex";
      submitBtn.disabled = true;
    } else {
      btnText.style.display = "inline";
      btnLoading.style.display = "none";
      submitBtn.disabled = false;
    }
  }

  // Real-time feedback
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");

  nameField.addEventListener("blur", () => {
    nameField.style.borderColor = nameField.value.length > 0 && nameField.value.length < 2 ? "#ef4444" : "";
  });

  emailField.addEventListener("blur", () => {
    emailField.style.borderColor = emailField.value.length > 0 && !isValidEmail(emailField.value) ? "#ef4444" : "";
  });

  form.addEventListener("focusin", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") {
      e.target.style.borderColor = "";
    }
  });
});
