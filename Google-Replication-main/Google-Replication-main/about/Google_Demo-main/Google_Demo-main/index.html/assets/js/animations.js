document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Lowered threshold for earlier triggering
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.dataset.delay || 0;

                // Apply transition delay via inline style if specified
                if (delay > 0) {
                    element.style.transitionDelay = `${delay}ms`;
                }

                element.classList.add('visible');
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // Parallax Effect
    document.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const parallaxElements = document.querySelectorAll('.parallax');

        parallaxElements.forEach(el => {
            const speed = el.dataset.speed || 0.5;
            const offset = el.offsetTop;
            const distance = scrolled - offset + window.innerHeight / 2;

            // Only animate if in view roughly
            if (distance > -window.innerHeight && distance < window.innerHeight) {
                const translateY = distance * speed * 0.1;
                el.style.transform = `translateY(${translateY}px)`;
            }
        });
    });

    // Number Counter Animation
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                const duration = 2000; // 2 seconds
                const start = 0;
                const startTime = performance.now();

                const updateCount = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Ease out quart
                    const ease = 1 - Math.pow(1 - progress, 4);

                    const current = Math.floor(ease * target);
                    el.innerText = current + (el.getAttribute('data-suffix') || '');

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        el.innerText = target + (el.getAttribute('data-suffix') || '');
                    }
                };

                requestAnimationFrame(updateCount);
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

    // Failsafe: Only reveal elements that are currently in or above the viewport
    // Elements below the fold stay hidden until scrolled to
    setTimeout(() => {
        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isAboveFold = rect.top < window.innerHeight;
            if (isAboveFold && getComputedStyle(el).opacity === '0') {
                el.classList.add('visible');
            }
        });
    }, 2000);
});
