document.addEventListener('DOMContentLoaded', () => {
    // mobile nav toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('navLinks');
    mobileBtn.addEventListener('click', () => {
        nav.classList.toggle('show');
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (nav.classList.contains('show')) {
                    nav.classList.remove('show');
                }
            }
        });
    });
});


document.querySelectorAll('.contact-form').forEach(form => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const formData = new FormData(form);
        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: formData,
            });

            if (res.status === 303 && res.headers.get('Location')) {
                window.location.href = res.headers.get('Location');
            } else if (res.ok) {
                window.location.hash = '#contact-success';
            } else {
                const errText = await res.text();
                alert('Submit failed: ' + errText);
                console.error('[form] Server error:', res.status, errText);
            }
        } catch (err) {
            alert('Network error. Try again.');
            console.error('[form] Exception:', err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});
