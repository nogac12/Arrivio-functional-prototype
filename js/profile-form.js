/*
 * Arrivio · travel-profile form behaviour: inline errors, error summary and touched-field logic.
 *
 * Feedback pattern:
 *   - A field is checked when the student leaves it, but only after they have entered something,
 *     so they are not told off for fields they have not reached yet.
 *   - "Required" errors for empty fields appear when the form is submitted.
 *   - On submit, an error summary at the top lists every problem as a link to its field and
 *     receives keyboard focus, so screen-reader users hear how many problems there are.
 *   - An error disappears as soon as the field is corrected.
 *   - Errors are shown with text, an icon and a border, never colour alone (requirement R14).
 *
 * Added in the functional-development iteration (Task 4). Generated with AI assistance
 * (Claude, Anthropic) — see docs/AI_EVIDENCE.md.
 */
(function (root) {
  "use strict";

  var V = root.ArrivioValidation;
  var form = null, summary = null, summaryTitle = null, summaryList = null, todayFn = null;
  var touched = {};
  var current = {};

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch];
    });
  }

  function control(field) { return form.elements[field]; }

  function labelText(field) {
    var label = form.querySelector('label[for="' + field + '"]');
    if (!label) return field;
    var clone = label.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll(".req"), function (n) { n.remove(); });
    return clone.textContent.trim();
  }

  function collect() {
    var values = {};
    V.FIELD_ORDER.forEach(function (field) {
      var input = control(field);
      values[field] = input ? String(input.value || "").trim() : "";
    });
    return values;
  }

  function setFieldError(field, message) {
    var input = control(field);
    var error = document.getElementById(field + "-error");
    if (!input || !error) return;
    var wrap = input.closest(".field");
    if (message) {
      error.innerHTML = '<span class="error-icon" aria-hidden="true">!</span><span><span class="visually-hidden">Error: </span>' + escapeHtml(message) + "</span>";
      error.hidden = false;
      input.setAttribute("aria-invalid", "true");
      if (wrap) wrap.classList.add("has-error");
    } else {
      error.hidden = true;
      error.textContent = "";
      input.removeAttribute("aria-invalid");
      if (wrap) wrap.classList.remove("has-error");
    }
  }

  // The summary stays short; the full explanation (including how to fix it) is next to the field.
  function firstSentence(message) {
    var match = String(message).match(/^.*?[.!?](\s|$)/);
    return match ? match[0].trim() : message;
  }

  function renderSummary(ordered) {
    if (!ordered.length) { summary.hidden = true; summaryList.innerHTML = ""; return; }
    summaryTitle.textContent = ordered.length === 1
      ? "There is 1 problem with your travel profile"
      : "There are " + ordered.length + " problems with your travel profile";
    summaryList.innerHTML = ordered.map(function (e) {
      return '<li><a href="#' + e.field + '" data-error-link="' + e.field + '">' +
        escapeHtml(labelText(e.field)) + ": " + escapeHtml(firstSentence(e.message)) + "</a></li>";
    }).join("");
    summary.hidden = false;
  }

  function apply(onlyTouched) {
    var result = V.validateProfile(collect(), todayFn());
    current = result.errors;
    V.FIELD_ORDER.forEach(function (field) {
      var show = !onlyTouched || touched[field];
      setFieldError(field, show ? result.errors[field] : null);
    });
    // Keep an open summary in sync while the student corrects the fields.
    if (!summary.hidden) {
      renderSummary(V.orderedErrors(result.errors).filter(function (e) { return touched[e.field]; }));
    }
    return result;
  }

  function onLeave(ev) {
    var field = ev.target && ev.target.name;
    if (!field || V.FIELD_ORDER.indexOf(field) === -1) return;
    if (String(ev.target.value || "").trim() !== "") touched[field] = true;
    apply(true);
  }

  function onInput(ev) {
    var field = ev.target && ev.target.name;
    // Remove an error as soon as the field becomes valid; never add new errors while typing.
    if (field && current[field]) {
      var result = V.validateProfile(collect(), todayFn());
      if (!result.errors[field]) { current[field] = null; apply(true); }
    }
  }

  /** Validate every field. Returns the profile values when valid, otherwise null. */
  function validateAll() {
    V.FIELD_ORDER.forEach(function (field) { touched[field] = true; });
    var result = apply(false);
    var ordered = V.orderedErrors(result.errors);
    renderSummary(ordered);
    if (ordered.length) {
      summary.focus();
      return null;
    }
    return collect();
  }

  function clearAll() {
    touched = {};
    current = {};
    V.FIELD_ORDER.forEach(function (field) { setFieldError(field, null); });
    if (summary) { summary.hidden = true; summaryList.innerHTML = ""; }
  }

  function init(options) {
    form = options.form;
    summary = options.summary;
    summaryTitle = options.summaryTitle;
    summaryList = options.summaryList;
    todayFn = options.today;
    form.setAttribute("novalidate", "");
    form.addEventListener("focusout", onLeave);
    form.addEventListener("change", onLeave);
    form.addEventListener("input", onInput);
    summaryList.addEventListener("click", function (ev) {
      var link = ev.target.closest("[data-error-link]");
      if (!link) return;
      ev.preventDefault();
      var input = control(link.getAttribute("data-error-link"));
      if (input) {
        input.focus();
        try { input.scrollIntoView({ block: "center" }); } catch (e) { input.scrollIntoView(); }
      }
    });
  }

  root.ArrivioProfileForm = { init: init, collect: collect, validateAll: validateAll, clearAll: clearAll };
})(window);
