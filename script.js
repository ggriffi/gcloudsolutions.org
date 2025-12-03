document.getElementById('mobileMenu').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const originalBtnText = submitButton.textContent;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
            });

            if (response.status === 303 && response.headers.get('Location')) {
                // Follow redirect manually (browser won't do this on fetch)
                window.location.href = response.headers.get('Location');
            } else if (response.ok) {
                window.location.hash = '#contact-success';
            } else {
                const errText = await response.text();
                console.error('[contact-form] Error:', errText);
                alert('There was a problem submitting your request. Please try again.');
            }
        } catch (err) {
            console.error('[contact-form] Network error:', err);
            alert('Network error. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalBtnText;
        }
    });
});
