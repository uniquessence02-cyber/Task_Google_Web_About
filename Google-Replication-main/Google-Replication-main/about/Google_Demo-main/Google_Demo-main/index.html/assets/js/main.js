document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header-placeholder', 'header.html', initHeader);
    loadComponent('footer-placeholder', 'footer.html');
    initPurchaseFlow();
});

async function loadComponent(elementId, filePath, callback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Try multiple paths to find the component
    const paths = [filePath, '/' + filePath, '../' + filePath];
    let content = null;

    for (const path of paths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                content = await response.text();
                // Fix interior links if in subfolder
                if (window.location.pathname.includes('/products/') || window.location.pathname.includes('/resources/')) {
                    content = content.replace(/href="([^"]*\.html)"/g, (match, p1) => {
                        if (p1.startsWith('http') || p1.startsWith('#')) return match;
                        return `href="../${p1}"`;
                    });
                    content = content.replace(/src="assets\//g, 'src="../assets/');
                    content = content.replace(/href="assets\//g, 'href="../assets/');
                }
                break;
            }
        } catch (e) { }
    }

    if (content) {
        element.innerHTML = content;
        if (callback) callback();
    } else {
        console.warn(`Could not load component: ${filePath}`);
    }
}

function initHeader() {
    // Highlight active link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = navLinks.classList.contains('active') ? 'close' : 'menu';
            }
        });
    }

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    initProductFilters();
    initResourceFilters();
}

function initProductFilters() {
    const searchInput = document.getElementById('product-search');
    const filterBtns = document.querySelectorAll('.filter-btn, .filter-pill');
    const products = document.querySelectorAll('.product-card');

    if (!products.length) return;

    function filterProducts() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const activeCategory = (document.querySelector('.filter-btn.active') || document.querySelector('.filter-pill.active'))?.dataset.category || 'all';

        products.forEach(product => {
            const title = product.querySelector('h3').textContent.toLowerCase();
            const category = product.dataset.category;
            const matchesSearch = title.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;

            if (matchesSearch && matchesCategory) {
                product.classList.remove('hidden');
            } else {
                product.classList.add('hidden');
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts();
        });
    });
}

function initResourceFilters() {
    const filterBtns = document.querySelectorAll('.resource-filter-btn');
    const resources = document.querySelectorAll('.resource-card');

    if (!filterBtns.length || !resources.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            resources.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filterValue === 'all' || category === filterValue) {
                    card.classList.remove('hidden');
                    // Optional: Add a fade-in animation or reset opacity if needed
                    card.style.opacity = '1';
                    card.style.display = 'block'; // Ensure it's visible in grid
                } else {
                    card.classList.add('hidden');
                    card.style.display = 'none'; // Hide completely from grid layout
                }
            });
        });
    });
}


