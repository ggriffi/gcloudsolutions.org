document.addEventListener('DOMContentLoaded', () => {
    // mobile nav toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('navLinks');

    if (mobileBtn && nav) {
        mobileBtn.addEventListener('click', () => {
            nav.classList.toggle('show');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (nav && nav.classList.contains('show')) {
                    nav.classList.remove('show');
                }
            }
        });
    });

    // ===== Service cards → popup modal =====
    const modal = document.getElementById('serviceModal');
    const titleEl = document.getElementById('serviceModalTitle');
    const bodyEl = document.getElementById('serviceModalBody');

    if (modal && titleEl && bodyEl) {
        const descriptions = {
            network: {
                title: 'Network Hardening & VLAN Design',
                body:
                    'We map your existing network, design clean VLAN segmentation for staff, guests and IoT, and lock it down with least-privilege firewall rules so your business stays fast and secure.'
            },
            firewall: {
                title: 'Firewall & DNS Security',
                body:
                    'From UniFi firewalls to custom Linux gateways, we apply best-practice rules, threat feeds and DNS filtering to block malicious traffic before it ever hits your endpoints.'
            },
            wifi: {
                title: 'Wi-Fi Optimization & Reliability',
                body:
                    'We tune channels, power levels, roaming and QoS so your Wi-Fi feels stable and fast everywhere you actually work – not just next to the router.'
            }
        };

        const openModal = key => {
            const data = descriptions[key];
            if (!data) return;
            titleEl.textContent = data.title;
            bodyEl.textContent = data.body;
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
        };

        const closeModal = () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
        };

        // Click on cards
        document.querySelectorAll('[data-service]').forEach(card => {
            card.addEventListener('click', () => {
                const key = card.getAttribute('data-service');
                openModal(key);
            });
        });

        // Close buttons / backdrop
        modal.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        modal.addEventListener('click', e => {
            if (e.target.classList.contains('service-modal-backdrop')) {
                closeModal();
            }
        });

        // Esc key closes modal
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });
    }
});

// ===== Contact form handler (unchanged) =====
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
