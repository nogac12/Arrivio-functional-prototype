/*
 * Arrivio · travel-profile validation rules (Task 1 of Practice 1).
 *
 * Pure functions with no DOM access, so the same rules can run in the browser and in the
 * automated tests (tests/profile-validation.test.js).
 *
 * Every message follows requirement R5 from Practice 1: it states what is wrong AND how to fix it.
 * Scope rules follow section 1.4 of Practice 1: one semester or one academic year, seven
 * supported destinations, support until 30 days after arrival.
 *
 * Added in the functional-development iteration (Task 4). Generated with AI assistance
 * (Claude, Anthropic) — see docs/AI_EVIDENCE.md.
 */
(function (root) {
  "use strict";

  var Countries = root.ArrivioCountries || (typeof require !== "undefined" ? require("./countries.js") : null);

  var RULES = {
    supportAfterArrivalDays: 30,   // Practice 1 scope: support ends 30 days after arrival
    maxDaysAhead: 365,             // a profile can be created up to one year before arrival
    semester: { min: 90, max: 200 },      // about 3 to 6.5 months
    academicYear: { min: 201, max: 380 }  // about 7 to 12 months
  };

  var PROGRAMME = { SEMESTER: "One semester", YEAR: "Full academic year" };

  // Order used for the error summary; matches the visual order of the form.
  var FIELD_ORDER = ["nationality", "residenceCountry", "residenceStatus", "destinationCountry",
    "destinationCity", "arrivalDate", "departureDate", "programmeLength", "currentStatus"];

  var DAY = 86400000;

  function parseISO(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
    var parts = value.split("-").map(Number);
    var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    // Reject impossible dates such as 2027-02-31.
    if (d.getUTCFullYear() !== parts[0] || d.getUTCMonth() !== parts[1] - 1 || d.getUTCDate() !== parts[2]) return null;
    return d;
  }

  function toISO(d) { return d.toISOString().slice(0, 10); }
  function addDays(d, n) { return new Date(d.getTime() + n * DAY); }
  function daysBetween(a, b) { return Math.round((b.getTime() - a.getTime()) / DAY); }

  function pretty(d) {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
  }

  function countryName(code) { return Countries ? Countries.name(code) : code; }

  /**
   * Validate a travel profile.
   * @param {object} p        values from the form
   * @param {string} todayISO today's date as YYYY-MM-DD (passed in so tests are deterministic)
   * @returns {{errors: Object<string,string>, stayDays: (number|null)}}
   */
  function validateProfile(p, todayISO) {
    p = p || {};
    var errors = {};
    var today = parseISO(todayISO) || parseISO(toISO(new Date()));

    // --- Nationality and residence -------------------------------------------------------
    if (!p.nationality) {
      errors.nationality = "Select your nationality. If you have more than one, choose the one on the passport you will travel with.";
    }
    if (!p.residenceCountry) {
      errors.residenceCountry = "Select the country where you currently live legally. It decides which consulate handles your case.";
    }
    if (!p.residenceStatus) {
      errors.residenceStatus = "Select your residence status in that country. Choose “Citizen” if it is your own country.";
    }

    // --- Destination ---------------------------------------------------------------------
    if (!p.destinationCountry) {
      errors.destinationCountry = "Select your destination country. Arrivio supports Spain, Italy, Portugal, France, the United States, Taiwan and Israel.";
    } else if (Countries && !Countries.isSupportedDestination(p.destinationCountry)) {
      errors.destinationCountry = "Arrivio does not support this destination yet. Choose one of the seven countries in the list.";
    } else if (p.nationality && p.nationality === p.destinationCountry) {
      errors.destinationCountry = "You are a citizen of " + countryName(p.destinationCountry) +
        ", so you do not need student immigration procedures there. Choose the country you are moving to.";
    }

    var city = String(p.destinationCity || "").trim();
    if (!city) {
      errors.destinationCity = "Enter the city where you will study, for example Madrid.";
    } else if (city.length < 2 || /[0-9@#$%^*_=+<>{}\[\]|\\/]/.test(city)) {
      errors.destinationCity = "Enter a city name using letters only, for example Madrid.";
    }

    // --- Dates ---------------------------------------------------------------------------
    var arrival = parseISO(p.arrivalDate);
    var departure = parseISO(p.departureDate);
    var stayDays = null;

    if (!p.arrivalDate) {
      errors.arrivalDate = "Enter your arrival date in the destination country.";
    } else if (!arrival) {
      errors.arrivalDate = "Enter a real date for your arrival, for example 1 February 2027.";
    } else if (arrival < addDays(today, -RULES.supportAfterArrivalDays)) {
      errors.arrivalDate = "Arrivio supports you until 30 days after arrival. Enter an arrival date on or after " +
        pretty(addDays(today, -RULES.supportAfterArrivalDays)) + ".";
    } else if (arrival > addDays(today, RULES.maxDaysAhead)) {
      errors.arrivalDate = "Enter an arrival date within the next 12 months, on or before " +
        pretty(addDays(today, RULES.maxDaysAhead)) + ".";
    }

    if (!p.departureDate) {
      errors.departureDate = "Enter your departure date, the day your exchange ends.";
    } else if (!departure) {
      errors.departureDate = "Enter a real date for your departure, for example 30 June 2027.";
    } else if (arrival && !errors.arrivalDate) {
      stayDays = daysBetween(arrival, departure);
      if (stayDays <= 0) {
        errors.departureDate = "Your departure date must be after your arrival date (" + pretty(arrival) + "). Check both dates.";
      } else if (stayDays < RULES.semester.min) {
        errors.departureDate = "Your stay is " + stayDays + " days. Arrivio supports exchanges of one semester (about 3 months) or longer. Check your departure date.";
      } else if (stayDays > RULES.academicYear.max) {
        errors.departureDate = "Your stay is " + stayDays + " days. Arrivio supports stays of up to one academic year (about 12 months). Check your departure date.";
      }
    }

    // --- Programme length (must match the dates) -----------------------------------------
    if (!p.programmeLength) {
      errors.programmeLength = "Select your programme length: one semester or a full academic year.";
    } else if (p.programmeLength !== PROGRAMME.SEMESTER && p.programmeLength !== PROGRAMME.YEAR) {
      errors.programmeLength = "Arrivio supports one semester or a full academic year. Choose one of these options.";
    } else if (stayDays !== null && !errors.departureDate) {
      if (p.programmeLength === PROGRAMME.SEMESTER && stayDays > RULES.semester.max) {
        errors.programmeLength = "A " + stayDays + "-day stay is longer than one semester (up to about 6 months). Choose “Full academic year” or check your departure date.";
      } else if (p.programmeLength === PROGRAMME.YEAR && stayDays < RULES.academicYear.min) {
        errors.programmeLength = "A " + stayDays + "-day stay is shorter than a full academic year (about 7 months or more). Choose “One semester” or check your departure date.";
      }
    }

    if (!p.currentStatus) {
      errors.currentStatus = "Select where you are in the visa or residence process. Choose “Not started” if you have not begun.";
    }

    return { errors: errors, stayDays: stayDays };
  }

  /** Human-readable stay length for the hint under the date fields. */
  function describeStay(arrivalISO, departureISO) {
    var a = parseISO(arrivalISO), d = parseISO(departureISO);
    if (!a || !d) return "The length of your stay will appear after you enter both dates.";
    var n = daysBetween(a, d);
    if (n <= 0) return "Departure is not after arrival yet. Check both dates.";
    var months = Math.round(n / 30.44 * 10) / 10;
    return "Stay length: " + n + " days (about " + months + " months).";
  }

  function orderedErrors(errors) {
    return FIELD_ORDER.filter(function (f) { return errors[f]; }).map(function (f) { return { field: f, message: errors[f] }; });
  }

  var api = {
    RULES: RULES,
    PROGRAMME: PROGRAMME,
    FIELD_ORDER: FIELD_ORDER,
    validateProfile: validateProfile,
    describeStay: describeStay,
    orderedErrors: orderedErrors
  };

  root.ArrivioValidation = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
