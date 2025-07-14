document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const responseMessage = document.getElementById('responseMessage');
    const submitButton = document.querySelector('button[type="submit"]');

    // Clear previous messages and classes
    responseMessage.classList.remove('show', 'success', 'error');
    responseMessage.textContent = '';

    if (!name || !email || !message) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';

    try {
        const res = await fetch('https://conta-back.onrender.com/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, message }),
        });

        const data = await res.json();

        if (res.ok) {
            showMessage("✅ " + (data.message || "Message sent successfully!"), "success");
            document.getElementById('contactForm').reset();
        } else {
            showMessage("❌ " + (data.error || "Submission failed. Please try again."), "error");
        }
    } catch (err) {
        console.error('Network error:', err);
        showMessage("❌ Network error. Please check your connection and try again.", "error");
    } finally {
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }

    function showMessage(text, type) {
        responseMessage.textContent = text;
        responseMessage.classList.add('show', type);

        // Force reflow to ensure animation works
        responseMessage.offsetHeight;

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                responseMessage.classList.remove('show');
            }, 5000);
        }
    }
});