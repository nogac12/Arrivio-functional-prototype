# Arrivio · Functional prototype (Practice 2, Task 4)

First functional development of **Arrivio**, the relocation assistant for exchange students defined in Practice 1.

The focus screen is the **Travel profile form** (Task 1 in Practice 1): a real form with validation, inline error messages, an error summary, an autosaved draft and a confirmation screen. It runs inside the Version 2 interface, so the profile you save feeds the checklist and the other screens.

> **Prototype data only.** Everything is stored in your browser (`localStorage`). Nothing is sent to a server. Do not enter real passport or identity details.

---

## Requirements

- A current browser (Chrome, Edge, Firefox or Safari).
- **Python 3**, to run a small local web server. It is pre-installed on macOS and most Linux systems; on Windows, install it from python.org.
- **Node.js 18 or newer**, only if you want to run the automated tests.

No packages need to be installed.

## Run the prototype

1. Open a terminal in this folder (the one that contains `index.html`).
2. Start a local server:

   ```bash
   python3 -m http.server 8000
   ```

   On Windows, use `py -m http.server 8000`. If you have Node.js, `npm start` does the same.
3. Open **http://localhost:8000** in your browser.
4. Choose **Build my travel profile**, or **Travel profile** in the menu.

Double-clicking `index.html` also works in most browsers. The local server is recommended because some browsers limit pages opened directly from disk.

To start again from an empty state, use **Clear local demo data** in the sidebar.

## Try the validation

| What to do | What you should see |
|---|---|
| Press **Review my profile** with the form empty | An error summary at the top ("There are 9 problems…") receives focus. Each problem links to its field, and each field shows its own message. |
| Choose Israel as nationality and Israel as destination | "You are a citizen of Israel, so you do not need student immigration procedures there…" |
| Enter a departure date before the arrival date | The message names the arrival date and asks you to check both dates. |
| Enter a stay of a few weeks | The message says Arrivio supports one semester (about 3 months) or longer. |
| Choose "One semester" with a 9-month stay | The message suggests "Full academic year" or checking the departure date. |
| Correct a field | Its error disappears straight away. |
| Fill part of the form, then reload the page | Your answers come back, with a notice and an option to discard them. |
| Complete the form correctly | The review screen shows "All details passed the checks". After confirming, the checklist shows a persistent "Travel profile confirmed" banner. |

## Run the automated tests

```bash
node --test tests/profile-validation.test.js
```

`npm test` runs the same command. There are 16 unit tests for the validation rules, and they use only Node's built-in test runner.

## Folder structure

```
arrivio-functional-prototype/
├── index.html                  Page markup (Version 2 layout, with the new travel-profile form)
├── logo_arrivio.png            Arrivio logo
├── css/
│   └── app.css                 Version 2 styles + Task 4 additions (marked at the end of the file)
├── js/
│   ├── countries.js            NEW · country lists and automatic EU classification
│   ├── profile-validation.js   NEW · validation rules (pure functions, unit-tested)
│   ├── profile-form.js         NEW · inline errors, error summary and focus handling
│   └── app.js                  Version 2 application logic, adapted to use the new modules
├── tests/
│   └── profile-validation.test.js
├── docs/
│   ├── AI_EVIDENCE.md                       How generative AI was used: prompts, generated and adapted code
│   ├── USABILITY_ACCESSIBILITY_REVIEW.md    Review findings and the corrections made
│   └── screenshots/                         Before (Version 2) and after screenshots
└── package.json                Optional shortcuts: npm start / npm test
```

## Where this code comes from

- **Base:** the Arrivio Version 2 interactive prototype. Its CSS and JavaScript were moved into separate files without changing their behaviour.
- **Functional development:** the travel-profile validation, feedback and accessibility fixes described in `docs/USABILITY_ACCESSIBILITY_REVIEW.md`. The use of generative AI is documented in `docs/AI_EVIDENCE.md`.

## Known limits

- The checklist and document suggestions are illustrative. They are not current immigration rules.
- Identity-document reading is simulated with fictional values; there is no real OCR.
- "Offline" is a simulation toggle. The prototype does not sync with a server.
- Validation limits (for example, a semester is 90–200 days) are design assumptions taken from the Practice 1 scope. They are not legal definitions.
