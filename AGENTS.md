# Repository Guidelines

## Project Structure

- `generate_invoices.js` contains the Google Apps Script entry points and receipt-generation logic.
- `presale.csv` is an exported form-response fixture used to inspect current input shape.
- `example.csv` shows the intended receipt output format from a prior sale.

This is a Google Form → Google Sheet → bound Apps Script workflow. The source sheet is named `Form Responses 1`; generated receipts are written to `Receipts`.

## Development and Validation

No package manager, build step, linter, or automated test runner is configured. Validate changes in the target spreadsheet:

1. Paste or sync `generate_invoices.js` into the bound Apps Script project.
2. Reload the spreadsheet to run `onOpen` and expose **Seedling Sale → Generate Receipts**.
3. Run the generator against representative form responses and confirm receipt lines, totals, and bold formatting in `Receipts`.

Use `rg` for local inspection, for example `rg "extractPlantName|totalPlants" generate_invoices.js`. Do not edit `output.csv` if it exists locally; it is generated, untracked output.

## Coding Style and Naming

Use two-space indentation, semicolons, `const` by default, and `let` only for reassigned bindings. Keep Apps Script entry points in camelCase, such as `generateInvoices()` and `onOpen()`. Name helpers as verbs (`extractPlantName`) and use descriptive collection names (`plantColumns`, `boldRows`).

Keep spreadsheet-specific strings and column assumptions near the code that consumes them. Preserve the zero-based JavaScript indexes and document any spreadsheet-column mapping changes.

## Testing Guidelines

There are no automated tests. Exercise both normal and edge cases manually: empty submissions, submissions with no quantities, numeric quantities, and headers containing descriptions or colons. Compare generated output with `example.csv` when changing formatting or receipt layout.

## Commits and Pull Requests

Write imperative commit subjects under 50 characters, for example `Improve plant name extraction`. For substantial changes, add a body explaining what changed and why, followed by a `Changes:` list. Keep commits narrowly scoped.

Pull requests must state the affected sheet behavior, describe manual validation, link the relevant issue when one exists, and include screenshots when receipt layout or formatting changes.
