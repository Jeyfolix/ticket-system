document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const messageDiv = document.getElementById('message');

  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(registerForm);

    try {
      const response = await fetch('../backend/register.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      messageDiv.textContent = data.message;
      messageDiv.className = 'message ' + (data.success ? 'success' : 'error');
      messageDiv.style.display = 'block';

      if (data.success) {
        setTimeout(() => {
          window.location.href = 'dashboard.html'; // or 'login.html' if needed
        }, 2000);
      }
    } catch (error) {
      console.error('Request failed:', error);
      messageDiv.textContent = 'An error occurred. Please try again.';
      messageDiv.className = 'message error';
      messageDiv.style.display = 'block';
    }
  });
});
