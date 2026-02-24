const yearNode = document.getElementById('year');
if (yearNode) yearNode.textContent = new Date().getFullYear();

function showMessage() {
  const messageNode = document.getElementById('form-message');
  if (!messageNode) return;
  messageNode.textContent = 'Thanks — your inquiry has been captured. We will reach out shortly.';
}
