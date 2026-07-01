/* ============================================================
   Sama & Faiyaz — Wedding Invitation
   Envelope open choreography + background music (Step 2)
   ============================================================ */

(function () {
    "use strict";

    const body = document.body;
    const gate = document.getElementById("envelope-gate");
    const seal = document.getElementById("open-envelope") || document.getElementById("seal-button");
    const siteMain = document.getElementById("site-main");
    const music = document.getElementById("bg-music");
    const audioToggle = document.getElementById("audio-toggle");
    const audioIcon = audioToggle
        ? audioToggle.querySelector(".audio-toggle__icon")
        : null;

    if (!gate || !seal || !siteMain) {
        return;
    }

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const REVEAL_DELAY_MS = prefersReducedMotion ? 0 : 1600;
    const OPEN_TOTAL_MS = prefersReducedMotion ? 50 : 2400;
    const GATE_HIDE_MS = prefersReducedMotion ? 80 : 3800;

    let opened = false;

    function startMusic() {
        if (!music) {
            return;
        }
        try {
            const p = music.play();
            if (p && typeof p.catch === "function") {
                p.catch(function () {
                    // Autoplay policy blocked us; user can toggle manually.
                    setAudioIcon(false);
                });
            }
        } catch (_) {
            setAudioIcon(false);
        }
    }

    function setAudioIcon(isPlaying) {
        if (!audioToggle || !audioIcon) {
            return;
        }
        if (isPlaying) {
            audioIcon.textContent = "\u258C\u258C"; // ▌▌ pause
            audioIcon.dataset.state = "playing";
            audioToggle.setAttribute("aria-pressed", "true");
            audioToggle.setAttribute("aria-label", "Pause music");
        } else {
            audioIcon.textContent = "\u25B6";       // ▶ play
            audioIcon.dataset.state = "paused";
            audioToggle.setAttribute("aria-pressed", "false");
            audioToggle.setAttribute("aria-label", "Play music");
        }
    }

    function openEnvelope() {
        if (opened) {
            return;
        }
        opened = true;
        seal.disabled = true;

        // 1. Kick off the flap animation immediately.
        body.classList.add("is-opening");

        // 2. Start music (user gesture makes autoplay legal here).
        startMusic();

        // 3. Reveal the main site after the initial flap movement starts.
        window.setTimeout(function () {
            siteMain.hidden = false;
            siteMain.setAttribute("aria-hidden", "false");
        }, REVEAL_DELAY_MS);

        // 4. Mark the envelope as open.
        window.setTimeout(function () {
            body.classList.add("is-open");
            if (audioToggle) {
                audioToggle.hidden = false;
            }
        }, OPEN_TOTAL_MS);

        // 5. Once gate fade finishes, detach from accessibility tree.
        window.setTimeout(function () {
            gate.setAttribute("aria-hidden", "true");
            gate.hidden = true;
        }, GATE_HIDE_MS);
    }

    seal.addEventListener("click", openEnvelope);

    // Desktop / PC: skip the envelope gate entirely and show the site.
    if (window.matchMedia("(min-width: 1025px)").matches) {
        opened = true;
        siteMain.hidden = false;
        siteMain.setAttribute("aria-hidden", "false");
        body.classList.add("is-open");
        gate.setAttribute("aria-hidden", "true");
        gate.hidden = true;
        if (audioToggle) {
            audioToggle.hidden = false;
        }
    }

    function setupScrollReveal() {
        const items = document.querySelectorAll(".reveal-on-scroll");
        if (!items.length) {
            return;
        }

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            items.forEach(function (el) {
                el.classList.add("is-visible");
            });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.18,
            rootMargin: "0px 0px -8% 0px"
        });

        items.forEach(function (el) {
            observer.observe(el);
        });
    }

    setupScrollReveal();

    // Audio toggle wiring (button stays hidden until the site opens).
    if (audioToggle && music) {
        audioToggle.addEventListener("click", function () {
            if (music.paused) {
                const p = music.play();
                if (p && typeof p.catch === "function") {
                    p.catch(function () { setAudioIcon(false); });
                }
                setAudioIcon(true);
            } else {
                music.pause();
                setAudioIcon(false);
            }
        });
        music.addEventListener("play",  function () { setAudioIcon(true); });
        music.addEventListener("pause", function () { setAudioIcon(false); });
    }
})();
