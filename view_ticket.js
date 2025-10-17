document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("searchBtn");
  const loadAllBtn = document.getElementById("loadAllBtn");
  const searchInput = document.getElementById("searchInput");
  const tableBody = document.querySelector("#ticketsTable tbody");

  // Function to populate table
  function populateTable(tickets) {
    tableBody.innerHTML = "";
    tickets.forEach((ticket, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${ticket.regno}</td>
        <td>${ticket.fullname}</td>
        <td>${ticket.email}</td>
        <td>${ticket.phone}</td>
        <td>${ticket.category}</td>
        <td>${ticket.title}</td>
        <td>${ticket.description}</td>
        <td>${ticket.priority}</td>
        <td>${ticket.attachment ? `<a href="../${ticket.attachment}" target="_blank">View</a>` : "No File"}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Fetch tickets (all or by regno)
  async function fetchTickets(regno = "") {
    try {
      const url = regno
        ? `../backend/view_tickets.php?regno=${encodeURIComponent(regno)}`
        : `../backend/view_tickets.php`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        populateTable(result.data);
      } else {
        alert(result.message || "No tickets found.");
        tableBody.innerHTML = "";
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching tickets.");
    }
  }

  // Event listeners
  searchBtn.addEventListener("click", () => {
    const regno = searchInput.value.trim();
    fetchTickets(regno);
  });

  loadAllBtn.addEventListener("click", () => {
    searchInput.value = "";
    fetchTickets();
  });

  // Load all tickets on page load
  fetchTickets();
});
