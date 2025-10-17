document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ticketForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch("../backend/ticket.php", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        alert("⚠️ Server error. Please try again later.");
        return;
      }

      const result = await response.json();
      console.log("Server Response:", result); // 🔍 Check the exact server reply in DevTools

      if (result.success) {
        alert(result.message); // ✅ Shows "Ticket submitted successfully!"
        form.reset();
      } else {
        alert(result.message); // ❌ Shows proper error reason
      }
    } catch (error) {
      console.error("Error:", error);
      alert("⚠️ Network error while submitting the ticket.");
    }
  });
});
