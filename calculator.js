// AeroSave Savings Calculator

(function () {
  "use strict";

  const FLOW_WITHOUT_AERATOR = 12; // L/min
  const FLOW_WITH_AERATOR = 6; // L/min
  const DAYS_PER_YEAR = 365;

  function calculateSavings({ rooms, usesPerDay, minutesPerUse, pricePerM3 }) {
    const dailyUsageWithout =
      rooms * usesPerDay * minutesPerUse * FLOW_WITHOUT_AERATOR; // litres
    const dailyUsageWith =
      rooms * usesPerDay * minutesPerUse * FLOW_WITH_AERATOR; // litres

    const dailySavingsLitres = dailyUsageWithout - dailyUsageWith;
    const yearlySavingsLitres = dailySavingsLitres * DAYS_PER_YEAR;
    const yearlySavingsM3 = yearlySavingsLitres / 1000;
    const yearlySavingsEur = yearlySavingsM3 * pricePerM3;

    return {
      yearlySavingsM3: Math.round(yearlySavingsM3),
      yearlySavingsEur: Math.round(yearlySavingsEur),
    };
  }

  function formatNumber(n) {
    return n.toLocaleString("de-DE");
  }

  function updateResults() {
    const rooms = parseFloat(document.getElementById("rooms").value) || 0;
    const usesPerDay =
      parseFloat(document.getElementById("uses-per-day").value) || 0;
    const minutesPerUse =
      parseFloat(document.getElementById("minutes-per-use").value) || 0;
    const pricePerM3 =
      parseFloat(document.getElementById("price-per-m3").value) || 0;

    const { yearlySavingsM3, yearlySavingsEur } = calculateSavings({
      rooms,
      usesPerDay,
      minutesPerUse,
      pricePerM3,
    });

    document.getElementById("result-water").textContent =
      formatNumber(yearlySavingsM3) + " m³";
    document.getElementById("result-money").textContent =
      "€" + formatNumber(yearlySavingsEur);

    // Show results panel
    const panel = document.getElementById("results-panel");
    if (panel) {
      panel.classList.remove("opacity-0", "translate-y-4");
      panel.classList.add("opacity-100", "translate-y-0");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("calculator-form");
    if (!form) return;

    // Attach listeners to all inputs for live updates
    form.querySelectorAll("input[type=number]").forEach(function (input) {
      input.addEventListener("input", updateResults);
    });

    // Run once on load to populate default values
    updateResults();

    // Smooth scroll for CTA button
    document
      .querySelectorAll('a[href^="#"]')
      .forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
          const target = document.querySelector(this.getAttribute("href"));
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
          }
        });
      });
  });
})();
