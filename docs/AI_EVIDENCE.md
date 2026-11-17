# Use of generative AI in the functional prototype

**Tool:** Claude (Anthropic), November 2026.

Generative AI was used to extend the Version 2 interactive prototype into a working travel-profile form with real validation. It was used in three steps:

1. **Analysing the existing prototype.** The AI identified the gaps in the travel-profile form: errors shown only in temporary messages, no scope checks, and the save status hidden on small screens.
2. **Generating code.** It produced the validation rules, the inline error and error-summary behaviour, the country list and the unit tests.
3. **Checking the result.** The generated code was checked with the included unit tests (16/16 passing) and an automated WCAG 2.2 AA audit (0 violations at 1280 px and 360 px).

## Example prompts

| Prompt (condensed; originals partly in Hebrew) | Result |
|---|---|
| "Summarise which functions already exist in the prototype code and which are missing." | List of existing features and gaps |
| "Implement the missing validation and feedback." | `profile-validation.js`, `profile-form.js`, `countries.js`, tests |

## Generated and adapted code

| File | Origin |
|---|---|
| `js/profile-validation.js`, `js/profile-form.js`, `js/countries.js`, `tests/` | Generated |
| `index.html` (profile form), `js/app.js`, `css/app.css` | Adapted from the Version 2 prototype (changes marked `Task 4`) |

## Example of derived code

```js
if (p.nationality && p.nationality === p.destinationCountry) {
  errors.destinationCountry = "You are a citizen of " + countryName(p.destinationCountry) +
    ", so you do not need student immigration procedures there. Choose the country you are moving to.";
}
```
