// Mobile-Menü: Klasse "show" am <body> schaltet Menü, Icon und Overlay um
document.addEventListener('DOMContentLoaded', function () {
    var body = document.body;
    var toggle = document.querySelector('.menu-toggle');
    var navbar = document.querySelector('.navbar');

    if (toggle) {
        toggle.addEventListener('click', function () {
            body.classList.toggle('show');
        });
    }

    // Menü schließen, wenn ein Link oder das abgedunkelte Overlay angeklickt wird
    document.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            body.classList.remove('show');
        });
    });
    if (navbar) {
        navbar.addEventListener('click', function (e) {
            if (e.target === navbar && body.classList.contains('show')) {
                body.classList.remove('show');
            }
        });
    }

    // Einblend-Animationen: Elemente sichtbar machen, sobald sie ins Bild scrollen
    var animated = document.querySelectorAll('.animate-left, .animate-right, .animate-top, .animate-bottom');

    if (!('IntersectionObserver' in window)) {
        animated.forEach(function (el) { el.classList.add('animate-visible'); });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    animated.forEach(function (el) { observer.observe(el); });
});
