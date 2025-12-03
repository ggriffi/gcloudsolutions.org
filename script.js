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
