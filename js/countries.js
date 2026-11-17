/*
 * Arrivio · country data used by the travel-profile form.
 * Added in the functional-development iteration (Task 4). Generated with AI assistance
 * (Claude, Anthropic) — see docs/AI_EVIDENCE.md.
 *
 * Country names come from the browser's built-in Intl.DisplayNames, so the list does not
 * need a hand-maintained translation table.
 */
(function (root) {
  "use strict";

  // ISO 3166-1 alpha-2 codes of sovereign states (plus Kosovo, Palestine and Taiwan).
  var CODES = ("AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ " +
    "CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR " +
    "GA GB GD GE GH GM GN GQ GR GT GW GY HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI " +
    "KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MR MT MU MV " +
    "MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB " +
    "SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG " +
    "US UY UZ VA VC VE VN VU WS XK YE ZA ZM ZW").split(" ");

  // The 27 EU member states. EU / non-EU status is derived from this list, never chosen by the user.
  var EU = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
    "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"];

  // The seven destinations in the Practice 1 scope.
  var DESTINATIONS = ["ES", "IT", "PT", "FR", "US", "TW", "IL"];

  var displayNames = null;
  try { displayNames = new Intl.DisplayNames(["en"], { type: "region" }); } catch (e) { displayNames = null; }

  function name(code) {
    if (!code) return "";
    var label = displayNames ? displayNames.of(code) : code;
    return label && label !== code ? label : code;
  }

  function sortedList() {
    return CODES.map(function (code) { return { code: code, name: name(code) }; })
      .sort(function (a, b) { return a.name.localeCompare(b.name, "en"); });
  }

  var api = {
    codes: CODES.slice(),
    eu: EU.slice(),
    destinations: DESTINATIONS.slice(),
    isEU: function (code) { return EU.indexOf(code) !== -1; },
    isSupportedDestination: function (code) { return DESTINATIONS.indexOf(code) !== -1; },
    name: name,
    sortedList: sortedList
  };

  root.ArrivioCountries = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
