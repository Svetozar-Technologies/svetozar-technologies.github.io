/**
 * LocalCode Website JavaScript
 * Svetozar Technologies
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                if (navLinks) navLinks.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Animate elements on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const parent = entry.target.parentElement;
                const siblings = [...parent.children];
                const index = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${index * 80}ms`;
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.feature-card, .download-card, .step, .use-case-card, .testimonial-card, .faq-item, .proof-stat').forEach(el => {
        el.classList.add('animate-target');
        observer.observe(el);
    });

    // OS-based download card highlighting
    const ua = navigator.userAgent;
    const macCards = document.querySelectorAll('#download-macos-arm, #download-macos-intel');
    const linuxCards = document.querySelectorAll('#download-linux-deb, #download-linux-appimage');

    if (ua.includes('Mac')) {
        macCards.forEach(c => c.classList.add('os-highlight'));
        linuxCards.forEach(c => c.classList.add('os-dimmed'));
    } else if (ua.includes('Linux')) {
        linuxCards.forEach(c => c.classList.add('os-highlight'));
        macCards.forEach(c => c.classList.add('os-dimmed'));
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            faqItems.forEach(otherItem => {
                if (otherItem !== item) otherItem.classList.remove('active');
            });
            item.classList.toggle('active', !isActive);
        });
    });
});
