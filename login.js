document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch("../backend/login_api.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      message.style.color = result.success ? "green" : "red";
      message.textContent = result.message;

      if (result.success) {
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      }
    } catch (error) {
      message.textContent = "Failed to connect to server.";
      console.error(error);
    }
  });
});
