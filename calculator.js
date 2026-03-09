// AeroSave Savings Calculator

(function () {
  "use strict";

  // Water usage benchmarks per hotel category (m³ per bed per day)
  var USAGE_PER_BED = {
    3: 0.30,
    4: 0.35,
    5: 0.45,
  };

  var BEDS_PER_ROOM = 2; // Industry standard: assumes 2 beds per double-occupancy room
  var DAYS_PER_MONTH = 30;
  var MONTHS_PER_QUAD = 4; // quadrimester = 4 months
  var SAVING_PERCENTAGE = 0.20; // 20% reduction with AeroSave aerators (can be up to 60%)
  var ROI_COST_PER_ROOM = 130; // Investment cost per room in € (aerator installation)

  // Water tariff tiers per quadrimester (rates excl. 13% VAT)
  var WATER_TIERS = [
    { max: 30, rate: 0.60 },
    { max: 50, rate: 1.15 },
    { max: 70, rate: 1.40 },
    { max: 100, rate: 2.20 },
    { max: 150, rate: 2.70 },
    { max: 400, rate: 4.90 },
    { max: Infinity, rate: 8.50 },
  ];
  var WATER_VAR_VAT = 1.13;  // 13% VAT on variable water charges
  var WATER_FIXED_QUAD = 10 * 1.24; // fixed charge per quadrimester incl. 24% VAT

  // Sewage tariff tiers per quadrimester (rates excl. 24% VAT)
  var SEWAGE_TIERS = [
    { max: 100, rate: 0.80 },
    { max: 200, rate: 1.30 },
    { max: Infinity, rate: 2.00 },
  ];
  var SEWAGE_VAR_VAT = 1.24;  // 24% VAT on variable sewage charges
  var SEWAGE_FIXED_QUAD = 10 * 1.24; // fixed charge per quadrimester incl. 24% VAT

  /**
   * Apply block/tiered pricing to a volume of m³.
   * First tier.max m³ are charged at tier.rate, then the next block at the next rate, etc.
   */
  function calcTieredCost(m3, tiers, vatMultiplier) {
    var cost = 0;
    var remaining = m3;
    var prevMax = 0;

    for (var i = 0; i < tiers.length; i++) {
      if (remaining <= 0) break;
      var tier = tiers[i];
      var tierCap = tier.max - prevMax;
      var consumed = Math.min(remaining, tierCap);
      cost += consumed * tier.rate;
      remaining -= consumed;
      prevMax = tier.max;
    }

    return cost * vatMultiplier;
  }

  /**
   * Calculate total quarterly bill (water + sewage, incl. VAT and fixed charges)
   * for a given quadrimester m³ volume.
   */
  function calcQuadBill(m3PerQuad) {
    var waterVar = calcTieredCost(m3PerQuad, WATER_TIERS, WATER_VAR_VAT);
    var sewageVar = calcTieredCost(m3PerQuad, SEWAGE_TIERS, SEWAGE_VAR_VAT);
    return waterVar + WATER_FIXED_QUAD + sewageVar + SEWAGE_FIXED_QUAD;
  }

  /**
   * Main calculation: given hotel stars and number of rooms, compute
   * current monthly water spend and projected savings at 20% reduction.
   */
  function calculate(stars, rooms) {
    var usagePerBed = USAGE_PER_BED[stars] || USAGE_PER_BED[3];

    // Current usage
    var m3PerDay = usagePerBed * BEDS_PER_ROOM * rooms;
    var m3PerMonth = m3PerDay * DAYS_PER_MONTH;
    var m3PerQuad = m3PerMonth * MONTHS_PER_QUAD;

    // Current quarterly and monthly bill
    var currentQuadBill = calcQuadBill(m3PerQuad);
    var currentMonthly = currentQuadBill / MONTHS_PER_QUAD;

    // With 20% water savings: reduced usage after AeroSave aerator installation
    var m3PerDayWithAeroSave = m3PerDay * (1 - SAVING_PERCENTAGE);
    var savedM3PerMonth = m3PerDayWithAeroSave * DAYS_PER_MONTH;
    var savedM3PerQuad = savedM3PerMonth * MONTHS_PER_QUAD;

    var savedQuadBill = calcQuadBill(savedM3PerQuad);
    var savedMonthly = savedQuadBill / MONTHS_PER_QUAD;

    var monthlySaving = currentMonthly - savedMonthly;
    var m3SavedPerMonth = m3PerMonth - savedM3PerMonth;
    var yearlySaving = monthlySaving * 12;
    var m3SavedPerYear = m3SavedPerMonth * 12;

    // ROI: investment based on €130 per room
    var investment = rooms * ROI_COST_PER_ROOM;
    var roiMonths = (monthlySaving > 0 && investment > 0) ? investment / monthlySaving : Infinity;

    return {
      m3PerMonth: Math.round(m3PerMonth),
      currentMonthly: Math.round(currentMonthly),
      savedM3PerMonth: Math.round(savedM3PerMonth),
      savedMonthly: Math.round(savedMonthly),
      monthlySaving: Math.round(monthlySaving),
      m3SavedPerMonth: Math.round(m3SavedPerMonth),
      yearlySaving: Math.round(yearlySaving),
      m3SavedPerYear: Math.round(m3SavedPerYear),
      roiMonths: Math.round(roiMonths),
    };
  }

  function formatNumber(n) {
    return n.toLocaleString("de-DE");
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Default: 4-star hotel
  var selectedStars = 4;

  function updateResults() {
    var roomsInput = document.getElementById("rooms");
    var rooms = parseInt(roomsInput ? roomsInput.value : "100", 10) || 1;

    var result = calculate(selectedStars, rooms);

    setText("result-m3-month", formatNumber(result.m3PerMonth) + " m³");
    setText("result-current-monthly", "€\u00a0" + formatNumber(result.currentMonthly));
    setText("result-saved-m3-month", formatNumber(result.savedM3PerMonth) + " m³");
    setText("result-saved-monthly", "€\u00a0" + formatNumber(result.savedMonthly));
    setText("result-m3-saved-year", formatNumber(result.m3SavedPerYear) + " m³");
    setText("result-monthly-saving", "€\u00a0" + formatNumber(result.monthlySaving));
    setText("result-yearly-saving", "€\u00a0" + formatNumber(result.yearlySaving));
    setText("result-roi-monthly-saving", "€\u00a0" + formatNumber(result.monthlySaving));
    setText("result-roi-months", (result.roiMonths === Infinity || isNaN(result.roiMonths)) ? "—" : formatNumber(result.roiMonths) + " months");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("calculator-form");
    if (!form) return;

    // Star selector buttons
    var starButtons = form.querySelectorAll("[data-stars]");

    function setActiveStarBtn(activeBtn) {
      starButtons.forEach(function (b) {
        b.classList.remove("border-sky-500", "bg-sky-50", "text-sky-700");
        b.classList.add("border-slate-200", "text-slate-600");
        b.setAttribute("aria-pressed", "false");
      });
      activeBtn.classList.add("border-sky-500", "bg-sky-50", "text-sky-700");
      activeBtn.classList.remove("border-slate-200", "text-slate-600");
      activeBtn.setAttribute("aria-pressed", "true");
    }

    starButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectedStars = parseInt(this.dataset.stars, 10);
        setActiveStarBtn(this);
        updateResults();
      });
    });

    // Activate default (4-star) button
    var defaultBtn = form.querySelector('[data-stars="4"]');
    if (defaultBtn) setActiveStarBtn(defaultBtn);

    // Rooms input live update
    var roomsInput = document.getElementById("rooms");
    if (roomsInput) roomsInput.addEventListener("input", updateResults);

    // Initial render
    updateResults();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var target = document.querySelector(this.getAttribute("href"));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  });
})();
