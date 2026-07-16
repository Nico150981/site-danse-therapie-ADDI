(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Menu mobile accessible ---------------------------------------------
  var bascule = document.querySelector(".bascule-nav");
  var nav = document.getElementById("nav-principale");
  if (bascule && nav) {
    bascule.addEventListener("click", function () {
      var ouvert = nav.getAttribute("data-ouvert") === "true";
      nav.setAttribute("data-ouvert", String(!ouvert));
      bascule.setAttribute("aria-expanded", String(!ouvert));
    });
  }

  // --- Apparition douce au défilement --------------------------------------
  var cibles = document.querySelectorAll(".au-scroll");
  if (prefersReducedMotion) {
    cibles.forEach(function (el) { el.classList.add("est-visible"); });
  } else if ("IntersectionObserver" in window) {
    var observateur = new IntersectionObserver(
      function (entrees) {
        entrees.forEach(function (entree) {
          if (entree.isIntersecting) {
            entree.target.classList.add("est-visible");
            observateur.unobserve(entree.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cibles.forEach(function (el) { observateur.observe(el); });
  } else {
    cibles.forEach(function (el) { el.classList.add("est-visible"); });
  }

  // --- Trait-signature : effet de "tracé à la main" ------------------------
  // On mesure la vraie longueur du tracé (path.getTotalLength) plutôt que de
  // deviner une valeur de stroke-dasharray, pour un rendu toujours correct
  // quel que soit le tracé utilisé.
  var traits = document.querySelectorAll(".trait-signature path");
  traits.forEach(function (path) {
    var longueur = path.getTotalLength();
    if (prefersReducedMotion) {
      path.style.strokeDasharray = "none";
      return;
    }
    path.style.strokeDasharray = longueur;
    path.style.strokeDashoffset = longueur;
    path.style.transition = "stroke-dashoffset 1.6s ease-out";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        path.style.strokeDashoffset = "0";
      });
    });
  });
})();
