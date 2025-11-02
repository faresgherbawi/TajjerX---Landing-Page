// stats-static.js
// متطلبات: Chart.js يجب أن يُدرج قبل هذا الملف في الصفحة.

document.addEventListener('DOMContentLoaded', function() {
    // ====== بيانات ثابتة (الجميع هنا ثابت) ======
    var STATIC = {
        kpis: {
            sales: 378450,
            active_customers: 4230,
            completed_projects: 142
        },
        revenue: {
            labels12: ['2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10'],
            data12: [12000, 14000, 11500, 16000, 17500, 19000, 21000, 19500, 22000, 24000, 23000, 25600],
            labels6: ['2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10'],
            data6: [21000, 19500, 22000, 24000, 23000, 25600],
            labels3: ['2025-08', '2025-09', '2025-10'],
            data3: [24000, 23000, 25600]
        },
        shots: [
            { src: './assert/1.jpg', type: 'sales', title: 'مخطط مبيعات يومي', time: '2025-10-29', note: 'إجمالي الطلبات: 1,240' },
            { src: './assert/2.jpg', type: 'reports', title: 'تقرير الأداء الشهري', time: '2025-10-01', note: 'مؤشرات أداء عالية' },
            { src: './assert/3.jpg', type: 'orders', title: 'قائمة الطلبات الأخيرة', time: '2025-10-30', note: 'طلبات قيد المعالجة: 128' },
            // { src: '/dashshots/sales-2.png', type: 'sales', title: 'مبيعات حسب الفئة', time: '2025-09-15', note: 'فئة الإلكترونيات متقدمة' }
        ]
    };

    // ====== أنيميشن للعدادات (من 0 إلى القيمة) ======
    function animateNumber(el, target, duration) {
        duration = duration || 1100;
        var start = 0;
        var startTime = performance.now();

        function step(now) {
            var t = Math.min((now - startTime) / duration, 1);
            var eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            var val = Math.floor(start + (target - start) * eased);
            el.textContent = val.toLocaleString();
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // ====== تهيئة Chart.js بالبيانات الثابتة ======
    var canvas = document.getElementById('revenueChartNew');
    if (!canvas) {
        console.error('revenueChartNew canvas not found');
        return;
    }
    var ctx = canvas.getContext('2d');
    var smooth = false;
    var config = {
        type: 'line',
        data: {
            labels: STATIC.revenue.labels12,
            datasets: [{
                label: 'الإيرادات',
                data: STATIC.revenue.data12,
                fill: true,
                tension: 0.0,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            animation: { duration: 1200, easing: 'easeOutCubic' },
            scales: { y: { beginAtZero: true } }
        }
    };
    var revenueChart = new Chart(ctx, config);

    // ====== ملء KPIs (وأنيميشن) ======
    var kpiEls = document.querySelectorAll('.js-kpi');
    kpiEls.forEach(function(el) {
        var key = el.getAttribute('data-key');
        var val = STATIC.kpis[key] || 0;
        animateNumber(el, val);
    });

    // ====== ملء المعرض بالصور الثابتة ======
    var gallery = document.getElementById('galleryGrid');
    if (gallery) {
        gallery.innerHTML = '';
        STATIC.shots.forEach(function(s) {
            var card = document.createElement('div');
            card.className = 'bg-white rounded-lg overflow-hidden shadow cursor-pointer dashboard-card';
            card.setAttribute('data-type', s.type);
            card.setAttribute('data-meta', JSON.stringify({ title: s.title, time: s.time, note: s.note, src: s.src }));
            card.innerHTML = '' +
                '<img src="' + s.src + '" alt="' + s.title + '" class="w-full h-36 object-cover" />' +
                '<div class="p-3">' +
                '<div class="text-sm font-medium text-gray-700">' + s.title + '</div>' +
                '<div class="text-xs text-gray-400 mt-1">' + s.time + '</div>' +
                '</div>';
            gallery.appendChild(card);
        });
    }

    // ====== فلترة بسيطة ======
    var filterBtns = document.querySelectorAll('.filterBtn');
    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var filter = btn.getAttribute('data-filter');
            var cards = document.querySelectorAll('#galleryGrid .dashboard-card');
            cards.forEach(function(card) {
                var type = card.getAttribute('data-type');
                card.style.display = (filter === 'all' || filter === type) ? '' : 'none';
            });
            filterBtns.forEach(function(b) { b.classList.remove('bg-emerald-600', 'text-white'); });
            btn.classList.add('bg-emerald-600', 'text-white');
        });
    });

    // ====== مودال التفاصيل + تحميل فتح جديد ======
    var modal = document.getElementById('shotModal');
    var modalImg = document.getElementById('modalImg');
    var modalTitle = document.getElementById('modalTitle');
    var modalTime = document.getElementById('modalTime');
    var modalNote = document.getElementById('modalNote');
    var downloadBtn = document.getElementById('downloadShot');

    document.body.addEventListener('click', function(e) {
        var card = e.target.closest ? e.target.closest('.dashboard-card') : null;
        if (!card) return;
        var meta = {};
        try { meta = JSON.parse(card.getAttribute('data-meta') || '{}'); } catch (err) { meta = {}; }
        if (modalImg) modalImg.src = meta.src || '';
        if (modalTitle) modalTitle.textContent = meta.title || '';
        if (modalTime) modalTime.textContent = meta.time || '';
        if (modalNote) modalNote.textContent = meta.note || '';
        if (downloadBtn) downloadBtn.setAttribute('data-src', meta.src || '');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    });

    var closeBtn = document.getElementById('closeShot');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        });
    }

    var openInTabBtn = document.getElementById('openInTab');
    if (openInTabBtn) {
        openInTabBtn.addEventListener('click', function() {
            var src = modalImg ? modalImg.src : '';
            if (src) window.open(src, '_blank');
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            var src = downloadBtn.getAttribute('data-src');
            if (!src) return;
            var a = document.createElement('a');
            a.href = src;
            a.download = src.split('/').pop();
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    }

    // ====== زر تحديث العرض (يعيد تشغيل أنيميشن دون تغيير البيانات) ======
    var refreshBtn = document.getElementById('refreshAll');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            kpiEls.forEach(function(el) {
                var key = el.getAttribute('data-key');
                var val = STATIC.kpis[key] || 0;
                animateNumber(el, val);
            });
            revenueChart.data.labels = STATIC.revenue.labels12;
            revenueChart.data.datasets[0].data = STATIC.revenue.data12;
            revenueChart.options.animation.duration = 1000;
            revenueChart.update();
        });
    }

    // ====== زر تصدير CSV (ثابت) ======
    var exportBtn = document.getElementById('exportCSV');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            var rows = [
                ['metric', 'value'],
                ['sales', STATIC.kpis.sales],
                ['active_customers', STATIC.kpis.active_customers],
                ['completed_projects', STATIC.kpis.completed_projects]
            ];
            var csv = rows.map(function(r) { return r.join(','); }).join('\n');
            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'dashboard_summary_' + new Date().toISOString().slice(0, 10) + '.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        });
    }

    // ====== تبديل نعومة الخط (يعمل محلياً) ======
    var toggleCurveBtn = document.getElementById('toggleCurve');
    if (toggleCurveBtn) {
        toggleCurveBtn.addEventListener('click', function(e) {
            smooth = !smooth;
            revenueChart.data.datasets[0].tension = smooth ? 0.5 : 0.0;
            revenueChart.update();
            e.target.classList.toggle('bg-emerald-600');
            e.target.classList.toggle('text-white');
        });
    }

    // ====== اختيار نطاق الرسم البياني (يعرض مجموعات ثابتة) ======
    var chartRange = document.getElementById('chartRange');
    if (chartRange) {
        chartRange.addEventListener('change', function(e) {
            var v = e.target.value;
            if (v === '12') {
                revenueChart.data.labels = STATIC.revenue.labels12;
                revenueChart.data.datasets[0].data = STATIC.revenue.data12;
            } else if (v === '6') {
                revenueChart.data.labels = STATIC.revenue.labels6;
                revenueChart.data.datasets[0].data = STATIC.revenue.data6;
            } else {
                revenueChart.data.labels = STATIC.revenue.labels3;
                revenueChart.data.datasets[0].data = STATIC.revenue.data3;
            }
            revenueChart.update();
        });
    }

    // تهيئة أولية: تأخير طفيف لعرض التحريك
    setTimeout(function() {
        revenueChart.update();
    }, 150);
});