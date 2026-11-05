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

    // Schließzeiten (offen.html):
    // - Betriebsurlaub: drei Wochen (Montag bis Sonntag) im August, der 15. August
    //   liegt immer in der mittleren Woche. Start ist der Montag eine Woche vor dem
    //   Montag der 15.-August-Woche (immer zwischen 2. und 8. August), Ende der Sonntag 20 Tage danach.
    // - Verschnaufpause: Neujahr (1.1.) bis Heilige Drei Könige (6.1.).
    // Angezeigt wird jeweils der kürzeste Zeitraum: Tage, an denen sowieso geschlossen ist
    // (Sonntag, Montag, Feiertage), werden am Anfang und Ende weggelassen.
    // Ist eine Schließzeit vorbei, wird automatisch der Termin im nächsten Jahr angezeigt.
    // Normal: kleine Boxen unter den Öffnungszeiten, die nächste Schließzeit zuerst.
    // Während einer Schließzeit: Öffnungszeiten ausblenden, stattdessen Warnhinweis zeigen.
    var schliesszeitenEl = document.getElementById('schliesszeiten');
    if (schliesszeitenEl) {
        var heute = new Date();

        // ─── TESTEN ───────────────────────────────────────────────────────────────
        // Um die Ansicht an einem anderen Tag zu sehen: EINE der Zeilen unten
        // einkommentieren (// am Anfang entfernen), speichern, offen.html mit Strg+F5 neu laden.
        // Achtung: Monat zählt ab 0 → 0 = Januar, 7 = August.
        // Vor dem Commit wieder auskommentieren!
        //
        // heute = new Date(2027, 7, 10);  // während Betriebsurlaub   → Warnbox „Betriebsurlaub“
        // heute = new Date(2027, 0, 3);   // während Verschnaufpause  → Warnbox „Kurze Verschnaufpause“
        // heute = new Date(2027, 5, 1);   // normal, im Juni          → Boxen: Betriebsurlaub zuerst
        // heute = new Date(2026, 11, 1);  // normal, im Dezember      → Boxen: Verschnaufpause zuerst
        // ──────────────────────────────────────────────────────────────────────────

        heute.setHours(0, 0, 0, 0);

        var tagDazu = function (d, n) {
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
        };
        // Regulär geöffnet: Dienstag bis Samstag, außer an Feiertagen in der Nähe der Schließzeiten
        var geoeffnet = function (d) {
            var feiertag = (d.getMonth() === 0 && (d.getDate() === 1 || d.getDate() === 6)) ||
                           (d.getMonth() === 7 && d.getDate() === 15);
            return d.getDay() >= 2 && d.getDay() <= 6 && !feiertag;
        };

        var schliesszeiten = [
            {
                box: document.getElementById('info-sommer'),
                titel: 'Betriebsurlaub',
                zeitraum: function (jahr) {
                    var seitMontag = (new Date(jahr, 7, 15).getDay() + 6) % 7;   // Mo = 0 … So = 6
                    var start = new Date(jahr, 7, 15 - seitMontag - 7);          // Montag der Woche davor
                    return { start: start, ende: tagDazu(start, 20) };           // Sonntag 3 Wochen später
                }
            },
            {
                box: document.getElementById('info-winter'),
                titel: 'Kurze Verschnaufpause',
                zeitraum: function (jahr) {
                    return { start: new Date(jahr, 0, 1), ende: new Date(jahr, 0, 6) };
                }
            }
        ];

        var fmt = function (d) {
            return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.';
        };
        var wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

        schliesszeiten.forEach(function (s) {
            var t = s.zeitraum(heute.getFullYear());
            if (heute > t.ende) t = s.zeitraum(heute.getFullYear() + 1);
            s.start = t.start;
            s.ende = t.ende;

            // kürzester Zeitraum für die Anzeige
            var von = t.start, bis = t.ende;
            while (!geoeffnet(von)) von = tagDazu(von, 1);
            while (!geoeffnet(bis)) bis = tagDazu(bis, -1);
            s.text = fmt(von) + ' – ' + fmt(bis) + bis.getFullYear();

            // erster regulärer Öffnungstag danach
            var wieder = tagDazu(t.ende, 1);
            while (!geoeffnet(wieder)) wieder = tagDazu(wieder, 1);
            s.wieder = wieder;
        });

        // nächste Schließzeit zuerst
        schliesszeiten.sort(function (a, b) { return a.start - b.start; });

        var aktuell = schliesszeiten.filter(function (s) { return heute >= s.start; })[0];
        if (aktuell) {
            document.getElementById('urlaub-hinweis-titel').textContent = aktuell.titel;
            document.getElementById('urlaub-hinweis-text').innerHTML =
                'Vom ' + aktuell.text + ' haben wir geschlossen.<br />' +
                'Ab ' + wochentage[aktuell.wieder.getDay()] + ', ' + fmt(aktuell.wieder) +
                ' sind wir wieder für Sie da.';
            document.getElementById('urlaub-hinweis').hidden = false;
            document.getElementById('oeffnungszeiten-normal').hidden = true;
        } else {
            schliesszeiten.forEach(function (s) {
                s.box.querySelector('.urlaub-info-datum').textContent = s.text;
                schliesszeitenEl.appendChild(s.box);   // in Reihenfolge einsortieren
            });
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
