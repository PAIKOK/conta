document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const responseMessage = document.getElementById('responseMessage');

    if (!name || !email || !message) {
        responseMessage.textContent = "Please fill in all fields.";
        responseMessage.style.color = "red";
        return;
    }

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
            responseMessage.textContent = "✅ " + data.message;
            responseMessage.style.color = "green";
            document.getElementById('contactForm').reset();
        } else {
            responseMessage.textContent = "❌ " + (data.error || "Submission failed.");
            responseMessage.style.color = "red";
        }
    } catch (err) {
        responseMessage.textContent = "❌ Network error.";
        responseMessage.style.color = "red";
    }
});