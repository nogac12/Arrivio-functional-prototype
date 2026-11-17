# Usability and accessibility review of the functional screen

**Screen:** Travel profile form (Task 1), with its review and confirmation steps
**Base version reviewed:** Arrivio Version 2 prototype
**Corrected version:** this folder (Task 4)
**Methods:**

- Automated WCAG 2.2 AA scan with axe-core 4.
- Scripted browser tests at 1280 px (desktop) and 360 px (mobile, requirement R8).
- Keyboard walkthrough.
- Inspection against the Practice 1 requirements (R5–R8, R13, R14) and Nielsen's heuristics.

---

## 1. Findings and corrections

| # | Finding in Version 2 | Impact on the student | Principle / requirement | Correction made | Evidence |
|---|---|---|---|---|---|
| 1 | A date conflict and missing "Other" values were reported only in a toast that disappeared after 3.3 s. On mobile the toast covered the bottom navigation. | Students who read slowly or use translation apps (Pablo) can miss the message. Screen-reader users may not hear it, and nothing marks the field. | Nielsen #9 (help users recover from errors); WCAG 3.3.1 Error Identification; R5 | Every error is now shown in text next to its field, with an icon and a red border, and stays until it is fixed. | `before-mobile-1-date-error-toast.png` → `after-mobile-2-invalid-input.png` |
| 2 | Empty required fields produced only the browser's generic bubble ("Please select an item in the list"). `aria-invalid` was not set, and there was no overview of the problems. | Students do not know how many problems there are or how to fix them. The bubble cannot be styled or translated consistently. | Nielsen #9; WCAG 3.3.1, 3.3.3 Error Suggestion; R5 | On submit, an error summary lists every problem as a link and receives keyboard focus. Fields get `aria-invalid` and `aria-describedby`, and every message says how to fix the problem. | `after-desktop-1-empty-submit.png` |
| 3 | Out-of-scope profiles were accepted, for example an Israeli citizen going to Israel for 19 days with "Short exchange". | The student gets a checklist that does not apply to them, which breaks trust in the system (a key concern for Pablo in Practice 1). | Nielsen #5 (error prevention); Practice 1 scope (section 1.4) | New rules check: destination equal to nationality; stays under one semester or over one academic year; programme length that does not match the dates; arrival outside the support window; impossible dates. Programme options were reduced to the two supported lengths. | `before-mobile-2-out-of-scope-accepted.png`; unit tests |
| 4 | Text bug: with reversed dates, the hint read "Check the dates travel days between these dates." | Confusing text exactly when the student is already making a mistake. | Nielsen #8 (aesthetic and minimalist design); robustness | The hint now reads "Departure is not after arrival yet. Check both dates." For valid dates it shows days and months. | `after-mobile-2-invalid-input.png` |
| 5 | Required fields were not marked. | Students learn which fields are mandatory only by failing. | Nielsen #6 (recognition rather than recall); WCAG 3.3.2 Labels or Instructions | Each label says "(required)". Hints explain unfamiliar fields, for example why residence matters. | `after-mobile-1-empty-submit.png` |
| 6 | Nationality offered 7 options plus free text. Free text could not be classified ("Needs confirmation"). | Most nationalities had to be typed, and the automatic EU classification promised in Practice 1 (Task 1) failed for them. | Practice 1 Task 1 (exact nationality from a dropdown); Nielsen #5 | Full list of 197 countries, generated from the browser's built-in country names. EU classification is derived for every one of them. | `after-mobile-2-invalid-input.png` |
| 7 | The form was not saved until submission, and "Leave without saving" discarded everything. | Ori fills the profile between exams. An interruption meant starting again. | R6 (progress saved automatically); flexibility | The draft is autosaved on every change, and the form shows "Draft saved on this device at …". After a reload, a notice offers to keep or discard the answers. "Leave without saving" became "Continue later". | e2e check: draft restored after reload |
| 8 | At widths of 420 px or less, the save/sync status pill was hidden, and the "Simulate offline" button appeared twice. | On a phone (the main device of the mobile-first persona, Bea), the student cannot see whether changes are saved or pending sync. | R7 (visible sync status); Nielsen #1 (visibility of system status) | The status pill stays visible on narrow screens. The duplicate button and the decorative tagline are hidden instead. | `before-mobile-3-no-sync-status.png` → `after-mobile-4-checklist-confirmed.png` |
| 9 | Success after confirming the profile was shown only in a 3.3 s toast. | No lasting confirmation that the task finished (Practice 1 stress-aware feedback). | Nielsen #1; Practice 1 section 5.2 | A persistent "Travel profile confirmed" banner with an icon shows the date and how many steps remain. The review screen shows "All details passed the checks". | `after-*-3-review-success.png`, `after-*-4-checklist-confirmed.png` |
| 10 | The whole checklist and the whole document list were live regions, so every re-render re-announced the full list. | Screen-reader users hear long, repeated announcements. | WCAG 4.1.3 Status Messages (used appropriately) | These live regions were removed. Short status messages still use the existing `role="status"` toast. | Code: `index.html` |
| 11 | The stepper's `aria-label` was on a plain `div` and was ignored. The top bar sat outside any landmark (axe "region"). | Minor: unreliable announcements and harder landmark navigation. | WCAG 1.3.1 Info and Relationships | The decorative stepper bars are hidden from assistive technology, and the visible "Step 1 of 2" text is read. The top bar is a labelled region. | axe: 0 violations |

---

## 2. Results after the corrections

| Check | Desktop 1280 px | Mobile 360 px |
|---|---|---|
| axe-core WCAG 2.2 AA + best practices: empty form | 0 violations | 0 violations |
| axe-core: form showing all 9 errors | 0 violations | 0 violations |
| axe-core: review screen / checklist | 0 / 0 | 0 / 0 |
| Focus moves to the error summary on submit | Yes | Yes |
| Summary link moves focus to the field | Yes | Yes |
| Errors still visible after 3.6 s | Yes | Yes |
| Error removed as soon as the field is fixed | Yes | Yes |
| Draft restored after a page reload | Yes | Yes |
| Horizontal scrolling | None | None |
| Save/sync status visible | Yes | Yes |
| Keyboard order through the form follows the visual order | Yes | Yes |
| Unit tests for the validation rules | 16 / 16 pass | — |

## 3. Assessment against the Practice 2 usability criteria

- **Ease of learning:**
  - Required fields are labelled, unfamiliar fields have hints, and EU status is calculated for the student.
  - Every error message gives the next action ("Choose…", "Enter…", "Check…").
- **Flexibility:**
  - The student can leave and return without losing answers.
  - Errors can be reached by mouse, touch, keyboard or the summary links.
  - The same form works at 360 px and on desktop.
- **Robustness:**
  - Impossible dates, reversed dates and out-of-scope trips are caught before they produce a wrong checklist.
  - The rules are pure functions with automated tests.
  - The prototype uses its own storage key, so it cannot corrupt Version 2 data.
- **Accessibility:**
  - Errors are shown with text, an icon and a border, never colour alone (R14).
  - Error red `#a4161a` on white has a contrast ratio above 7:1.
  - Touch targets from Version 2 (at least 44–48 px) are unchanged.
  - Status messages are announced without repeating whole lists.

## 4. Still to do

- **Manual screen-reader test** of the form with VoiceOver or NVDA (required by R13). It has not been done yet; record the result here.
- **Usability test with students** (Practice 3), for example: can participants fix every error without help, and how long does it take?
- **Unreachable code:** the Version 2 code that handled the "Other" nationality is no longer reached and can be removed in the next iteration.
- **Deadlines:** Version 2 does not show deadlines in the checklist, and requirement R1 asks for the next action and its deadline. This is a design decision for the iteration analysis (Task 5), not part of this screen.
