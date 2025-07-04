document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createAccountForm");
  const message = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const role = document.getElementById("role").value.trim();
    const user_id = document.getElementById("user_id").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    message.style.color = "red";

    if (!role || !user_id || !password || !confirmPassword) {
      message.textContent = "All fields are required.";
      return;
    }

    if (password !== confirmPassword) {
      message.textContent = "Passwords do not match.";
      return;
    }

    const formData = new FormData();
    formData.append("role", role);
    formData.append("user_id", user_id);
    formData.append("password", password);

    try {
      const response = await fetch("../backend/create_account.php", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      message.style.color = result.success ? "green" : "red";
      message.textContent = result.message;

      if (result.success) form.reset();
    } catch (error) {
      message.textContent = "Error connecting to server.";
      console.error(error);
    }
  });
});
