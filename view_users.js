// View Users JavaScript
class UserManager {
  constructor() {
    this.users = []
    this.filteredUsers = []
    this.currentPage = 1
    this.pageSize = 25
    this.sortField = "name"
    this.sortDirection = "asc"
    this.currentView = "table"

    this.init()
  }

  init() {
    this.bindEvents()
    this.loadUsers()
  }

  bindEvents() {
    // Search functionality
    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.handleSearch(e.target.value)
    })

    document.getElementById("searchBtn").addEventListener("click", () => {
      const searchTerm = document.getElementById("searchInput").value
      this.handleSearch(searchTerm)
    })

    // Filter functionality
    document.getElementById("roleFilter").addEventListener("change", (e) => {
      this.handleFilter()
    })

    document.getElementById("statusFilter").addEventListener("change", (e) => {
      this.handleFilter()
    })

    // Action buttons
    document.getElementById("refreshBtn").addEventListener("click", () => {
      this.loadUsers()
    })

    document.getElementById("addUserBtn").addEventListener("click", () => {
      this.showAddUserModal()
    })

    document.getElementById("exportBtn").addEventListener("click", () => {
      this.exportUsers()
    })

    document.getElementById("clearFiltersBtn").addEventListener("click", () => {
      this.clearFilters()
    })

    // View toggle
    document.getElementById("tableViewBtn").addEventListener("click", () => {
      this.switchView("table")
    })

    document.getElementById("cardViewBtn").addEventListener("click", () => {
      this.switchView("card")
    })

    // Sorting
    document.querySelectorAll(".sortable").forEach((header) => {
      header.addEventListener("click", (e) => {
        const field = e.currentTarget.dataset.sort
        this.handleSort(field)
      })
    })

    // Select all checkbox
    document.getElementById("selectAll").addEventListener("change", (e) => {
      this.handleSelectAll(e.target.checked)
    })

    // Pagination
    document.getElementById("prevPageBtn").addEventListener("click", () => {
      this.goToPage(this.currentPage - 1)
    })

    document.getElementById("nextPageBtn").addEventListener("click", () => {
      this.goToPage(this.currentPage + 1)
    })

    document.getElementById("pageSize").addEventListener("change", (e) => {
      this.pageSize = Number.parseInt(e.target.value)
      this.currentPage = 1
      this.renderUsers()
    })

    // Modal events
    document.getElementById("closeModal").addEventListener("click", () => {
      this.hideModal()
    })

    document.getElementById("cancelModalBtn").addEventListener("click", () => {
      this.hideModal()
    })

    // Close modal on outside click
    document.getElementById("userModal").addEventListener("click", (e) => {
      if (e.target.id === "userModal") {
        this.hideModal()
      }
    })
  }

  async loadUsers() {
    this.showLoading(true)

    try {
      const response = await fetch("users-api.php?action=getUsers")
      const data = await response.json()

      if (data.success) {
        this.users = data.users
        this.filteredUsers = [...this.users]
        this.renderUsers()
        this.updateUserCount()
      } else {
        this.showError("Failed to load users: " + data.message)
      }
    } catch (error) {
      this.showError("Error loading users: " + error.message)
    } finally {
      this.showLoading(false)
    }
  }

  handleSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim()

    if (term === "") {
      this.filteredUsers = [...this.users]
    } else {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term),
      )
    }

    this.currentPage = 1
    this.renderUsers()
  }

  handleFilter() {
    const roleFilter = document.getElementById("roleFilter").value
    const statusFilter = document.getElementById("statusFilter").value
    const searchTerm = document.getElementById("searchInput").value.toLowerCase().trim()

    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)

      const matchesRole = roleFilter === "" || user.role === roleFilter
      const matchesStatus = statusFilter === "" || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })

    this.currentPage = 1
    this.renderUsers()
  }

  handleSort(field) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
    } else {
      this.sortField = field
      this.sortDirection = "asc"
    }

    this.filteredUsers.sort((a, b) => {
      let aVal = a[field]
      let bVal = b[field]

      // Handle date fields
      if (field === "created_at" || field === "last_login") {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }

      if (aVal < bVal) return this.sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return this.sortDirection === "asc" ? 1 : -1
      return 0
    })

    this.updateSortIndicators()
    this.renderUsers()
  }

  updateSortIndicators() {
    document.querySelectorAll(".sortable").forEach((header) => {
      header.classList.remove("asc", "desc")
      if (header.dataset.sort === this.sortField) {
        header.classList.add(this.sortDirection)
      }
    })
  }

  handleSelectAll(checked) {
    const checkboxes = document.querySelectorAll(".user-checkbox")
    checkboxes.forEach((checkbox) => {
      checkbox.checked = checked
    })
  }

  switchView(view) {
    this.currentView = view

    // Update view buttons
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.getElementById(view + "ViewBtn").classList.add("active")

    // Show/hide views
    document.getElementById("tableView").style.display = view === "table" ? "block" : "none"
    document.getElementById("cardView").style.display = view === "card" ? "block" : "none"

    this.renderUsers()
  }

  renderUsers() {
    const startIndex = (this.currentPage - 1) * this.pageSize
    const endIndex = startIndex + this.pageSize
    const paginatedUsers = this.filteredUsers.slice(startIndex, endIndex)

    if (this.currentView === "table") {
      this.renderTableView(paginatedUsers)
    } else {
      this.renderCardView(paginatedUsers)
    }

    this.renderPagination()
    this.updateUserCount()

    // Show empty state if no users
    const emptyState = document.getElementById("emptyState")
    if (this.filteredUsers.length === 0) {
      emptyState.style.display = "block"
      document.getElementById("tableView").style.display = "none"
      document.getElementById("cardView").style.display = "none"
    } else {
      emptyState.style.display = "none"
    }
  }

  renderTableView(users) {
    const tbody = document.getElementById("usersTableBody")
    tbody.innerHTML = ""

    users.forEach((user) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>
                    <input type="checkbox" class="checkbox user-checkbox" data-user-id="${user.id}">
                </td>
                <td>
                    <div class="user-info-cell">
                        <div class="user-avatar-table">
                            ${this.getInitials(user.name)}
                        </div>
                        <div class="user-details">
                            <div class="user-name">${user.name}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                <td class="date-cell">${this.formatDate(user.created_at)}</td>
                <td class="date-cell">${this.formatDate(user.last_login)}</td>
                <td class="actions-cell">
                    <button class="action-btn action-view" onclick="userManager.viewUser(${user.id})">👁️</button>
                    <button class="action-btn action-edit" onclick="userManager.editUser(${user.id})">✏️</button>
                    <button class="action-btn action-delete" onclick="userManager.deleteUser(${user.id})">🗑️</button>
                </td>
            `
      tbody.appendChild(row)
    })
  }

  renderCardView(users) {
    const container = document.getElementById("usersCardContainer")
    container.innerHTML = ""

    users.forEach((user) => {
      const card = document.createElement("div")
      card.className = "user-card"
      card.innerHTML = `
                <div class="user-card-header">
                    <div class="user-avatar-card">
                        ${this.getInitials(user.name)}
                    </div>
                    <div class="user-card-info">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                    </div>
                </div>
                <div class="user-card-details">
                    <div class="user-card-detail">
                        <strong>Role</strong>
                        <span class="role-badge role-${user.role}">${user.role}</span>
                    </div>
                    <div class="user-card-detail">
                        <strong>Status</strong>
                        <span class="status-badge status-${user.status}">${user.status}</span>
                    </div>
                    <div class="user-card-detail">
                        <strong>Joined</strong>
                        ${this.formatDate(user.created_at)}
                    </div>
                    <div class="user-card-detail">
                        <strong>Last Login</strong>
                        ${this.formatDate(user.last_login)}
                    </div>
                </div>
                <div class="user-card-actions">
                    <button class="action-btn action-view" onclick="userManager.viewUser(${user.id})">👁️ View</button>
                    <button class="action-btn action-edit" onclick="userManager.editUser(${user.id})">✏️ Edit</button>
                    <button class="action-btn action-delete" onclick="userManager.deleteUser(${user.id})">🗑️ Delete</button>
                </div>
            `
      container.appendChild(card)
    })
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredUsers.length / this.pageSize)
    const startIndex = (this.currentPage - 1) * this.pageSize
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredUsers.length)

    // Update pagination info
    document.getElementById("showingStart").textContent = this.filteredUsers.length > 0 ? startIndex + 1 : 0
    document.getElementById("showingEnd").textContent = endIndex
    document.getElementById("totalUsers").textContent = this.filteredUsers.length

    // Update pagination buttons
    document.getElementById("prevPageBtn").disabled = this.currentPage <= 1
    document.getElementById("nextPageBtn").disabled = this.currentPage >= totalPages

    // Render page numbers
    const pageNumbers = document.getElementById("pageNumbers")
    pageNumbers.innerHTML = ""

    const maxVisiblePages = 5
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button")
      pageBtn.className = `page-number ${i === this.currentPage ? "active" : ""}`
      pageBtn.textContent = i
      pageBtn.addEventListener("click", () => this.goToPage(i))
      pageNumbers.appendChild(pageBtn)
    }
  }

  goToPage(page) {
    const totalPages = Math.ceil(this.filteredUsers.length / this.pageSize)
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page
      this.renderUsers()
    }
  }

  updateUserCount() {
    document.getElementById("userCount").textContent = `${this.filteredUsers.length} users`
  }

  clearFilters() {
    document.getElementById("searchInput").value = ""
    document.getElementById("roleFilter").value = ""
    document.getElementById("statusFilter").value = ""
    this.filteredUsers = [...this.users]
    this.currentPage = 1
    this.renderUsers()
  }

  async viewUser(userId) {
    const user = this.users.find((u) => u.id === userId)
    if (!user) return

    document.getElementById("modalTitle").textContent = "User Details"
    document.getElementById("modalBody").innerHTML = `
            <div class="user-details-modal">
                <div class="user-avatar-large">
                    ${this.getInitials(user.name)}
                </div>
                <h3>${user.name}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> <span class="role-badge role-${user.role}">${user.role}</span></p>
                <p><strong>Status:</strong> <span class="status-badge status-${user.status}">${user.status}</span></p>
                <p><strong>Phone:</strong> ${user.phone || "Not provided"}</p>
                <p><strong>Department:</strong> ${user.department || "Not assigned"}</p>
                <p><strong>Joined:</strong> ${this.formatDate(user.created_at)}</p>
                <p><strong>Last Login:</strong> ${this.formatDate(user.last_login)}</p>
                <p><strong>Total Logins:</strong> ${user.login_count || 0}</p>
            </div>
        `

    this.showModal()
  }

  editUser(userId) {
    // Implement edit user functionality
    alert(`Edit user ${userId} - This would open an edit form`)
  }

  async deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const response = await fetch("users-api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deleteUser",
          userId: userId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        this.loadUsers() // Reload users
        this.showSuccess("User deleted successfully")
      } else {
        this.showError("Failed to delete user: " + data.message)
      }
    } catch (error) {
      this.showError("Error deleting user: " + error.message)
    }
  }

  showAddUserModal() {
    alert("Add user functionality - This would open an add user form")
  }

  exportUsers() {
    const csvContent = this.generateCSV(this.filteredUsers)
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users_export.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  generateCSV(users) {
    const headers = ["ID", "Name", "Email", "Role", "Status", "Joined", "Last Login"]
    const rows = users.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.status,
      this.formatDate(user.created_at),
      this.formatDate(user.last_login),
    ])

    return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
  }

  showModal() {
    document.getElementById("userModal").style.display = "flex"
  }

  hideModal() {
    document.getElementById("userModal").style.display = "none"
  }

  showLoading(show) {
    document.getElementById("loadingIndicator").style.display = show ? "flex" : "none"
  }

  showError(message) {
    alert("Error: " + message)
  }

  showSuccess(message) {
    alert("Success: " + message)
  }

  getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  formatDate(dateString) {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
}

// Initialize the user manager when the page loads
let userManager
document.addEventListener("DOMContentLoaded", () => {
  userManager = new UserManager()
})
