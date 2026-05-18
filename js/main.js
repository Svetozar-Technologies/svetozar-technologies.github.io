/**
 * Svetozar Technologies - Main JavaScript
 */

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            document.querySelector('.nav-links')?.classList.remove('active');
            document.querySelector('.mobile-menu-btn')?.classList.remove('active');
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks?.classList.remove('active');
        mobileMenuBtn?.classList.remove('active');
    });
});

// Scroll animations using Intersection Observer
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

// Observe all animatable elements
document.querySelectorAll(
    '.product-card, .manifesto-block, .commitment, .join-card, .proof-stat'
).forEach(el => {
    el.classList.add('animate-target');
    observer.observe(el);
});
