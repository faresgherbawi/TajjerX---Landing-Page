// ==============================
// Mobile menu toggle with close-on-link and a11y
// ==============================
(function() {
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    const openMenu = () => {
        menu.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // lock scroll
    };
    const closeMenu = () => {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // unlock scroll
    };

    btn.addEventListener('click', () => {
        const isHidden = menu.classList.contains('hidden');
        isHidden ? openMenu() : closeMenu();
    });

    // Close on any link click inside the mobile menu
    menu.querySelectorAll('a[href]').forEach(a => {
        a.addEventListener('click', () => setTimeout(closeMenu, 50));
    });

    // Also close on hash change (same-page links)
    window.addEventListener('hashchange', () => {
        if (!menu.classList.contains('hidden')) closeMenu();
    });

    // Optional: close on background tap
    menu.addEventListener('click', (e) => {
        if (e.target === menu) closeMenu();
    });
})();

// ==============================
// Reveal on scroll
// ==============================
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('on');
            io.unobserve(e.target);
        }
    });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ==============================
// Hero animation: Arabic-safe (per-word) with HARD RESET + SINGLE-RUN GUARD
// ==============================
(function() {
    if (window.__heroInitDone) return; // prevent double-run
    window.__heroInitDone = true;

    const h = document.getElementById('heroTitle');
    if (!h) return;

    // Reset to raw text (remove any old spans)
    const rawText = (h.innerText || h.textContent || '').replace(/\s+/g, ' ').trim();
    if (!rawText) return;
    h.textContent = rawText;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Word segmentation (keep spaces)
    let words = [];
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const seg = new Intl.Segmenter('ar', { granularity: 'word' });
        words = Array.from(seg.segment(rawText), s => s.segment);
    } else {
        words = rawText.split(/(\s+)/);
    }

    // Build spans per WORD only
    h.innerHTML = '';
    let idx = 0;
    for (const w of words) {
        if (/^\s+$/.test(w)) { h.appendChild(document.createTextNode(w)); continue; }
        const span = document.createElement('span');
        span.textContent = w;
        span.style.display = 'inline-block';
        span.style.willChange = 'opacity, transform';
        if (!prefersReduced) {
            span.style.opacity = '0';
            span.style.transform = 'translateY(14px)';
            span.style.transition = 'opacity 420ms ease, transform 420ms ease';
            span.style.transitionDelay = (idx * 70) + 'ms';
        }
        idx++;
        h.appendChild(span);
    }

    if (!prefersReduced) {
        requestAnimationFrame(() => {
            h.querySelectorAll('span').forEach(s => {
                s.style.opacity = '1';
                s.style.transform = 'translateY(0)';
            });
        });
    }
})();

// ==============================
// Rotate KPIs
// ==============================
(function() {
    const kpis = [
        ['×8.4', '+27%', '+230%', '-18%'],
        ['×12.1', '+31%', '+180%', '-24%'],
        ['×9.6', '+28%', '+210%', '-21%']
    ];
    let ki = 0;
    const ids = ['kpi1', 'kpi2', 'kpi3', 'kpi4'];

    function swap() {
        ki = (ki + 1) % kpis.length;
        ids.forEach((id, j) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.style.opacity = '0';
            setTimeout(() => {
                el.textContent = kpis[ki][j];
                el.style.opacity = '1';
            }, 200);
        });
    }

    setInterval(swap, 3500);
})();

// ==============================
// Hero Parallax (hero only)
// ==============================
(function() {
    const wrap = document.getElementById('heroVisual');
    if (!wrap) return;
    const items = wrap.querySelectorAll('.parallax-item');

    wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        items.forEach(el => {
            const depth = parseFloat(el.dataset.depth || '8');
            const tx = -x * depth;
            const ty = -y * depth;
            el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        });
    });

    wrap.addEventListener('mouseleave', () => {
        items.forEach(el => el.style.transform = 'translate3d(0,0,0)');
    });
})();

// ==============================
// Magnetic CTA (subtle)
// ==============================
(function() {
    const btn = document.getElementById('primaryCta');
    if (!btn) return;
    const strength = 10;
    btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        btn.style.transform = `translate(${x*strength}px, ${y*strength}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
})();

// ==============================
// Robust Testimonials Slider (measures width, RTL-safe, resize-safe)
// ==============================
(function() {
    const wrap = document.getElementById('sliderWrap');
    const track = document.getElementById('slider');
    const dots = document.querySelectorAll('.dot');
    if (!wrap || !track || !dots.length) return;

    const slides = Array.from(track.querySelectorAll('figure'));
    if (!slides.length) return;

    let index = 0;
    let slideW = 0;
    let autoTimer = null;

    function measure() {
        slideW = Math.round(wrap.clientWidth);
        slides.forEach(s => { s.style.width = slideW + 'px'; });
        apply(index, false);
    }

    function apply(i, animate = true) {
        track.style.transition = animate ? 'transform 500ms ease' : 'none';
        const offset = -(i * slideW);
        track.style.transform = `translateX(${offset}px)`;
        dots.forEach((d, di) => {
            d.style.width = di === i ? '1.5rem' : '0.5rem';
            d.setAttribute('aria-current', di === i ? 'true' : 'false');
        });
    }

    function go(i) {
        index = (i + slides.length) % slides.length;
        apply(index, true);
    }

    // Dots
    dots.forEach((d, i) => d.addEventListener('click', () => {
        stop();
        go(i);
        start();
    }));

    // Auto
    function start() {
        stop();
        autoTimer = setInterval(() => go(index + 1), 5000);
    }

    function stop() {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
    }

    wrap.addEventListener('mouseenter', stop);
    wrap.addEventListener('mouseleave', start);

    // Touch swipe
    let startX = 0,
        dx = 0,
        dragging = false;
    track.addEventListener('touchstart', (e) => {
        stop();
        dragging = true;
        track.style.transition = 'none';
        startX = e.touches[0].clientX;
        dx = 0;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        dx = e.touches[0].clientX - startX;
        const offset = -(index * slideW) + dx;
        track.style.transform = `translateX(${offset}px)`;
    }, { passive: true });

    track.addEventListener('touchend', () => {
        dragging = false;
        const threshold = Math.max(40, slideW * 0.1);
        if (Math.abs(dx) > threshold) {
            index = dx < 0 ? (index + 1) % slides.length :
                (index - 1 + slides.length) % slides.length;
        }
        apply(index, true);
        start();
    });

    // Resize & fonts load
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(measure); }

    // Init
    measure();
    start();
})();

// ==============================
// Year
// ==============================
(function() {
    const yEl = document.getElementById('year');
    if (yEl) yEl.textContent = new Date().getFullYear();
})();




// new section
// بيانات الرسم
const revenueData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    datasets: [{
        label: 'الإيرادات',
        data: [1200, 1600, 1800, 2200, 2800, 2500, 3100, 3400, 3700, 4000, 4200, 4800],
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        backgroundColor: 'rgba(16,185,129,0.08)',
        borderColor: '#10B981',
        pointRadius: 3
    }]
};

let revenueChart;

// تهيئة الرسم
function initCharts() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: revenueData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// عداد رقمي متحرك
function animateCounter(el, to) {
    const duration = 1200;
    const start = 0;
    const startTime = performance.now();

    function step(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = t * (2 - t);
        const value = Math.floor(start + (to - start) * eased);
        el.textContent = value.toLocaleString();
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// الدائرة المتحركة والبار
function animateProgress(percent) {
    const circle = document.getElementById('svgProgress');
    const full = 276.46;
    const offset = full - (percent / 100) * full;
    circle.style.transition = "stroke-dashoffset 1.4s ease";
    circle.style.strokeDashoffset = offset;
    document.querySelector('.js-svg-percent').textContent = percent + '%';
    document.getElementById('barProgress').style.width = percent + '%';
}

// تفعيل عند ظهور السكشن
const section = document.getElementById('stats');
let activated = false;
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !activated) {
            activated = true;
            document.querySelectorAll('.js-counter').forEach(el => {
                animateCounter(el, +el.dataset.target);
            });
            initCharts();
            animateProgress(85);
        }
    });
}, { threshold: 0.25 });

observer.observe(section);

// زر تحديث البيانات
document.getElementById('refreshBtn').addEventListener('click', () => {
    const newPercent = Math.floor(Math.random() * 90) + 5;
    animateProgress(newPercent);
    document.querySelectorAll('.js-counter').forEach(el => {
        const newVal = Math.floor(Math.random() * 12000);
        el.dataset.target = newVal;
        animateCounter(el, newVal);
    });
    revenueChart.data.datasets[0].data = revenueChart.data.datasets[0].data.map(() => Math.floor(Math.random() * 5000) + 1000);
    revenueChart.update();
});