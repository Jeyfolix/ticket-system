document.addEventListener("DOMContentLoaded", () => {
  // Tabs from top navigation
  const tabViewTicketsTop = document.getElementById("tab-view-tickets");
  const tabSubmitTicketTop = document.getElementById("tab-submit-ticket");

  // Tabs from sidebar
  const tabViewTicketsSidebar = document.getElementById("tab-view-tickets-sidebar");
  const tabSubmitTicketSidebar = document.getElementById("tab-submit-ticket-sidebar");

  // Content Sections
  const viewTicketsSection = document.getElementById("view-tickets-section");
  const submitTicketSection = document.getElementById("submit-ticket-section");
  const iframe = document.getElementById("submitTicketFrame");

  // Path to the ticket form
  const submitTicketURL = "../frontend/submit_ticket.html"; // Adjust path if needed

  // Toggle active class in sidebar
  function setActiveSidebar(tab) {
    document.querySelectorAll(".sidebar-item").forEach(item => item.classList.remove("active"));
    if (tab) tab.classList.add("active");
  }

  // Show My Tickets section
  function showViewTickets() {
    viewTicketsSection.style.display = "block";
    submitTicketSection.style.display = "none";
    setActiveSidebar(tabViewTicketsSidebar);
  }

  // Show Submit Ticket section
  function showSubmitTicket() {
    viewTicketsSection.style.display = "none";
    submitTicketSection.style.display = "block";

    // Only load iframe if not already loaded
    if (iframe.src === "" || !iframe.src.includes("submit_ticket.html")) {
      iframe.src = submitTicketURL;
    }

    setActiveSidebar(tabSubmitTicketSidebar);
  }

  // Bind click events (with fallback safety)
  if (tabViewTicketsTop) {
    tabViewTicketsTop.addEventListener("click", (e) => {
      e.preventDefault();
      showViewTickets();
    });
  }

  if (tabSubmitTicketTop) {
    tabSubmitTicketTop.addEventListener("click", (e) => {
      e.preventDefault();
      showSubmitTicket();
    });
  }

  if (tabViewTicketsSidebar) {
    tabViewTicketsSidebar.addEventListener("click", (e) => {
      e.preventDefault();
      showViewTickets();
    });
  }

  if (tabSubmitTicketSidebar) {
    tabSubmitTicketSidebar.addEventListener("click", (e) => {
      e.preventDefault();
      showSubmitTicket();
    });
  }

  // Default view on load
  showViewTickets();
});
