document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted!');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const responseMessage = document.getElementById('responseMessage');
    const submitButton = document.querySelector('button[type="submit"]');

    // Clear previous messages
    responseMessage.classList.remove('show', 'success', 'error');
    responseMessage.textContent = '';
    responseMessage.style.color = '';

    if (!name || !email || !message) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    // Show loading state with cold start warning
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';

    // Show immediate feedback about potential delay
    showMessage("⏳ Sending your message... This might take up to 30 seconds if the server is starting up.", "info");

    try {
        // Increased timeout for cold start (60 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const requestData = { name, email, message };
        console.log('Sending request to:', 'https://conta-back.onrender.com/api/contact');
        console.log('Request data:', requestData);

        const startTime = Date.now();

        const res = await fetch('https://conta-back.onrender.com/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log(`Response received in ${responseTime}ms`);
        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);

        // Handle different response types
        let data;
        const contentType = res.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
            console.log('Response data:', data);
        } else {
            const textResponse = await res.text();
            console.log('Non-JSON response:', textResponse);

            // Sometimes servers return plain text success messages
            if (res.ok && textResponse.toLowerCase().includes('success')) {
                data = { message: textResponse };
            } else {
                data = { error: textResponse || 'Unknown server error' };
            }
        }

        if (res.ok) {
            const successMessage = data.message || data.success || "Message sent successfully!";
            showMessage("✅ " + successMessage, "success");
            document.getElementById('contactForm').reset();

            // Log successful submission
            console.log('Form submitted successfully!');
        } else {
            const errorMessage = data.error || data.message || `Server error (${res.status})`;
            showMessage("❌ " + errorMessage, "error");
            console.error('Server error:', errorMessage);
        }

    } catch (err) {
        console.error('Request error:', err);

        if (err.name === 'AbortError') {
            showMessage("❌ Request timed out. The server might be starting up. Please try again in a minute.", "error");
        } else if (err.message.includes('Failed to fetch')) {
            showMessage("❌ Network error. Please check your internet connection and try again.", "error");
        } else {
            showMessage("❌ Error: " + err.message, "error");
        }
    } finally {
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }

    function showMessage(text, type) {
        console.log('Showing message:', text, type);

        responseMessage.textContent = text;
        responseMessage.classList.remove('show', 'success', 'error', 'info');
        responseMessage.classList.add('show', type);

        // Set inline styles as fallback
        if (type === 'success') {
            responseMessage.style.color = 'green';
        } else if (type === 'error') {
            responseMessage.style.color = 'red';
        } else if (type === 'info') {
            responseMessage.style.color = 'blue';
        }

        // Force reflow
        responseMessage.offsetHeight;

        // Auto-hide messages after appropriate time
        if (type === 'success') {
            setTimeout(() => {
                responseMessage.classList.remove('show');
            }, 5000);
        } else if (type === 'info') {
            // Info messages stay until replaced
        }
    }
});

// Optional: Wake up the server on page load to reduce cold start time
window.addEventListener('load', () => {
    console.log('Attempting to wake up server...');
    fetch('https://conta-back.onrender.com/api/contact', {
        method: 'GET',
        mode: 'no-cors' // Avoid CORS issues for wake-up call
    }).catch(() => {
        // Ignore errors, this is just a wake-up call
        console.log('Server wake-up call sent');
    });
});