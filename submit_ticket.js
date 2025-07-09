const form = document.getElementById('ticketForm');
const formMessage = document.getElementById('formMessage');

const userIdInput = form.user_id;
const nameInput = form.name;
const emailInput = form.email;
const subjectInput = form.subject;

const userIdError = document.getElementById('userIdError');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const subjectError = document.getElementById('subjectError');

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  let valid = true;

  // Clear previous errors
  [userIdError, nameError, emailError, subjectError].forEach(el => el.classList.add('hidden'));
  formMessage.textContent = '';
  formMessage.className = 'hidden';

  // Validate inputs
  if (!userIdInput.value.trim()) {
    userIdError.classList.remove('hidden');
    valid = false;
  }
  if (!nameInput.value.trim()) {
    nameError.classList.remove('hidden');
    valid = false;
  }
  if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
    emailError.classList.remove('hidden');
    valid = false;
  }
  if (!subjectInput.value.trim()) {
    subjectError.classList.remove('hidden');
    valid = false;
  }

  if (!valid) return;

  // Prepare form data
  const formData = new FormData(form);

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.6";
  submitBtn.style.cursor = "not-allowed";

  fetch(form.action, {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        formMessage.textContent = "Your ticket has been submitted successfully!";
        formMessage.className = "success-message";
        formMessage.style.color = "green";
        form.reset();
      } else {
        formMessage.textContent = data.error || "An error occurred while submitting your ticket.";
        formMessage.className = "error-message";
        formMessage.style.color = "red";
      }
    })
    .catch(() => {
      formMessage.textContent = "Network error occurred while submitting your ticket.";
      formMessage.className = "error-message";
      formMessage.style.color = "red";
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
    });
});
