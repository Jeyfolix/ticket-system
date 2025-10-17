document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.querySelector(".student-search button");
  const searchInput = document.getElementById("searchInput");

  searchBtn.addEventListener("click", async function () {
    const regno = searchInput.value.trim();

    if (!regno) {
      alert("⚠️ Please enter a registration number.");
      return;
    }

    try {
      // 🔹 Fetch data from backend
      const response = await fetch(`../backend/admin_student_ticket.php?regno=${encodeURIComponent(regno)}`);
      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;

        // ✅ Populate the form fields with ticket data
        document.getElementById("student-name").value = data.fullname || "";
        document.getElementById("student-reg").value = data.regno || "";
        document.getElementById("student-email").value = data.email || "";
        document.getElementById("student-phone").value = data.phone || "";
          document.getElementById("ticket-service").value = data.category || "";
  
        document.getElementById("ticket-title").value = data.title || "";
        document.getElementById("ticket-description").value = data.description || "";
        document.getElementById("ticket-priority").value = data.priority || "";

        alert("✅ Student ticket loaded successfully!");
      } else {
        alert(result.message || "⚠️ No ticket found for that registration number.");
      }

    } catch (error) {
      console.error("Error fetching ticket:", error);
      alert("❌ An error occurred while searching for the ticket.");
    }
  });
});
