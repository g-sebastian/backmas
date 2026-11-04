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

    // Betriebsurlaub (offen.html): die zwei mittleren Augustwochen,
    // Start ist der Montag zwischen 6. und 12. August, Ende der Sonntag eine Woche danach
    // (so liegt der Urlaub immer möglichst mittig um den 16. August).
    // Nach Ende des Urlaubs wird automatisch der Termin im nächsten Jahr angezeigt.
    // Normal: dezenter Hinweis unter den Öffnungszeiten.
    // Während des Urlaubs: Öffnungszeiten ausblenden, stattdessen Warnhinweis zeigen.
    var urlaubInfo = document.getElementById('urlaub-info');
    if (urlaubInfo) {
        var urlaub = function (jahr) {
            var start = new Date(jahr, 7, 6);                          // 6. August
            start.setDate(6 + ((8 - start.getDay()) % 7));             // nächster Montag ab dem 6.
            var ende = new Date(jahr, 7, start.getDate() + 13);        // Sonntag 2 Wochen später
            return { start: start, ende: ende };
        };
        var heute = new Date();
        // var heute = new Date(2027, 7, 10); // Test wie die Urlaubsansicht aussieht
        heute.setHours(0, 0, 0, 0);
        var termin = urlaub(heute.getFullYear());
        if (heute > termin.ende) termin = urlaub(heute.getFullYear() + 1);

        var fmt = function (d) {
            return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.';
        };
        var zeitraum = fmt(termin.start) + ' – ' + fmt(termin.ende) + termin.ende.getFullYear();

        if (heute >= termin.start) {
            // Wieder offen ab Dienstag nach dem Urlaub (Sonntag/Montag ist ohnehin Ruhetag)
            var wiederOffen = new Date(termin.ende);
            wiederOffen.setDate(wiederOffen.getDate() + 2);
            document.getElementById('urlaub-hinweis-text').innerHTML =
                'Vom ' + zeitraum + ' haben wir geschlossen.<br />' +
                'Ab Dienstag, ' + fmt(wiederOffen) + ' sind wir wieder für Sie da.';
            document.getElementById('urlaub-hinweis').hidden = false;
            document.getElementById('oeffnungszeiten-normal').hidden = true;
        } else {
            document.getElementById('urlaub-info-datum').textContent = zeitraum;
        }
    }

    // Einblend-Animationen: Elemente sichtbar machen, sobald sie ins Bild scrollen
    var animated = document.querySelectorAll('.animate-left, .animate-right, .animate-top, .animate-bottom');

    if (!('IntersectionObserver' in window)) {
        animated.forEach(function (el) { el.classList.add('animate-visible'); });
        return;
    }

    // Beobachtet wird das (nicht verschobene) Elternelement statt des Elements selbst:
    // Die Elemente starten bis zu 250px verschoben. Liegt das Elternelement mit
    // overflow:hidden drumherum (z.B. .footer__content), ist das verschobene Element
    // komplett abgeschnitten und würde sonst nie als "sichtbar" erkannt.
    var gruppen = new Map();
    animated.forEach(function (el) {
        var eltern = el.parentElement;
        if (!gruppen.has(eltern)) gruppen.set(eltern, []);
        gruppen.get(eltern).push(el);
    });

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                gruppen.get(entry.target).forEach(function (el) {
                    el.classList.add('animate-visible');
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    gruppen.forEach(function (_, eltern) { observer.observe(eltern); });
});
