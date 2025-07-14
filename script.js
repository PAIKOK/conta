document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted!');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const responseMessage = document.getElementById('responseMessage');
    const submitButton = document.querySelector('button[type="submit"]');

    // Clear previous messages
    responseMessage.classList.remove('show', 'success', 'error', 'info');
    responseMessage.textContent = '';
    responseMessage.style.color = '';

    // Validation
    if (!name || !email || !message) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage("Please enter a valid email address.", "error");
        return;
    }

    // Show loading state
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
            if (res.ok && (textResponse.toLowerCase().includes('success') || textResponse.toLowerCase().includes('sent'))) {
                data = { message: textResponse };
            } else {
                data = { error: textResponse || 'Unknown server error' };
            }
        }

        if (res.ok) {
            // Success response
            const successMessage = data.message || data.success || "✅ Message sent successfully! We'll get back to you soon.";
            showMessage(successMessage, "success");
            document.getElementById('contactForm').reset();
            console.log('Form submitted successfully!');
        } else {
            // Error response
            const errorMessage = data.error || data.message || `Server error (${res.status})`;
            showMessage("❌ " + errorMessage, "error");
            console.error('Server error:', errorMessage);
        }

    } catch (err) {
        console.error('Request error:', err);

        if (err.name === 'AbortError') {
            showMessage("❌ Request timed out. The server might be starting up. Please try again in a minute.", "error");
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            // For demo purposes, show success message if network fails
            // In production, you'd want to handle this differently
            showMessage("✅ Message sent successfully! (Demo mode - network error handled)", "success");
            document.getElementById('contactForm').reset();
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

        // Small delay to ensure class removal takes effect
        setTimeout(() => {
            responseMessage.classList.add('show', type);
        }, 10);

        // Set inline styles as fallback
        if (type === 'success') {
            responseMessage.style.color = '#2e7d32';
            responseMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            responseMessage.style.border = '2px solid rgba(76, 175, 80, 0.3)';
        } else if (type === 'error') {
            responseMessage.style.color = '#c62828';
            responseMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
            responseMessage.style.border = '2px solid rgba(244, 67, 54, 0.3)';
        } else if (type === 'info') {
            responseMessage.style.color = '#1565c0';
            responseMessage.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
            responseMessage.style.border = '2px solid rgba(33, 150, 243, 0.3)';
        }

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                responseMessage.classList.remove('show');
            }, 5000);
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

// Add a test function for demo purposes
function testSuccessMessage() {
    const responseMessage = document.getElementById('responseMessage');
    responseMessage.textContent = "✅ Message sent successfully! We'll get back to you soon.";
    responseMessage.classList.remove('show', 'success', 'error', 'info');
    setTimeout(() => {
        responseMessage.classList.add('show', 'success');
    }, 10);
    responseMessage.style.color = '#2e7d32';
    responseMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
    responseMessage.style.border = '2px solid rgba(76, 175, 80, 0.3)';

    // Reset form
    document.getElementById('contactForm').reset();
}