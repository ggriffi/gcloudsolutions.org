document.getElementById('mobileMenu').addEventListener('click', () => {
    const nav = document.getElementById('navLinks');
    nav.classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('active');
    });
});
