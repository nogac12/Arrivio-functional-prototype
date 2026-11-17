/*
 * Unit tests for the travel-profile validation rules.
 * Run with:  node --test tests/
 * Uses only Node's built-in test runner (Node 18+), no packages needed.
 */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const V = require("../js/profile-validation.js");

const TODAY = "2026-11-13";

// A valid profile: Israeli student going to Madrid for one semester.
const valid = () => ({
  nationality: "IL",
  residenceCountry: "IL",
  residenceStatus: "Citizen",
  destinationCountry: "ES",
  destinationCity: "Madrid",
  arrivalDate: "2027-02-01",
  departureDate: "2027-06-30",
  programmeLength: "One semester",
  currentStatus: "Not started"
});

test("a complete, in-scope profile has no errors", () => {
  const r = V.validateProfile(valid(), TODAY);
  assert.deepEqual(r.errors, {});
  assert.equal(r.stayDays, 149);
});

test("every empty field gets its own message", () => {
  const r = V.validateProfile({}, TODAY);
  assert.deepEqual(Object.keys(r.errors).sort(), [...V.FIELD_ORDER].sort());
});

test("messages say what is wrong and how to fix it (R5)", () => {
  const r = V.validateProfile({}, TODAY);
  for (const msg of Object.values(r.errors)) {
    assert.match(msg, /^(Select|Enter)/, msg); // tells the student the action to take
  }
});

test("destination equal to nationality is rejected", () => {
  const r = V.validateProfile({ ...valid(), destinationCountry: "IL", destinationCity: "Tel Aviv" }, TODAY);
  assert.match(r.errors.destinationCountry, /citizen of Israel/);
});

test("departure before arrival is rejected", () => {
  const r = V.validateProfile({ ...valid(), departureDate: "2027-01-01" }, TODAY);
  assert.match(r.errors.departureDate, /must be after your arrival date/);
});

test("stays shorter than a semester are out of scope", () => {
  const r = V.validateProfile({ ...valid(), departureDate: "2027-02-20" }, TODAY);
  assert.match(r.errors.departureDate, /19 days/);
});

test("stays longer than an academic year are out of scope", () => {
  const r = V.validateProfile({ ...valid(), departureDate: "2028-03-01", programmeLength: "Full academic year" }, TODAY);
  assert.match(r.errors.departureDate, /up to one academic year/);
});

test("programme length must match the dates", () => {
  const long = V.validateProfile({ ...valid(), departureDate: "2027-10-30" }, TODAY);
  assert.match(long.errors.programmeLength, /longer than one semester/);
  const short = V.validateProfile({ ...valid(), programmeLength: "Full academic year" }, TODAY);
  assert.match(short.errors.programmeLength, /shorter than a full academic year/);
});

test("old Version 2 options outside the scope are rejected", () => {
  const r = V.validateProfile({ ...valid(), programmeLength: "Short exchange" }, TODAY);
  assert.ok(r.errors.programmeLength);
});

test("arrival more than 30 days ago is outside the support window", () => {
  const r = V.validateProfile({ ...valid(), arrivalDate: "2026-09-01", departureDate: "2027-01-15" }, TODAY);
  assert.match(r.errors.arrivalDate, /30 days after arrival/);
});

test("arrival more than 12 months ahead is rejected", () => {
  const r = V.validateProfile({ ...valid(), arrivalDate: "2028-01-10", departureDate: "2028-05-10" }, TODAY);
  assert.match(r.errors.arrivalDate, /next 12 months/);
});

test("impossible calendar dates are rejected", () => {
  const r = V.validateProfile({ ...valid(), arrivalDate: "2027-02-31" }, TODAY);
  assert.match(r.errors.arrivalDate, /real date/);
});

test("city must be a name, not a number", () => {
  const r = V.validateProfile({ ...valid(), destinationCity: "12345" }, TODAY);
  assert.match(r.errors.destinationCity, /letters only/);
});

test("unsupported destinations are rejected", () => {
  const r = V.validateProfile({ ...valid(), destinationCountry: "DE" }, TODAY);
  assert.match(r.errors.destinationCountry, /does not support this destination/);
});

test("stay description handles reversed dates without broken text", () => {
  assert.equal(V.describeStay("2027-02-01", "2027-01-01"), "Departure is not after arrival yet. Check both dates.");
  assert.match(V.describeStay("2027-02-01", "2027-06-30"), /149 days/);
});

test("ordered errors follow the visual order of the form", () => {
  const ordered = V.orderedErrors(V.validateProfile({}, TODAY).errors).map((e) => e.field);
  assert.deepEqual(ordered, V.FIELD_ORDER);
});
