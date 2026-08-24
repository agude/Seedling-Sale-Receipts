# Repository Guidelines

## Project Structure

- `src/` contains the Google Apps Script source and manifest.
- `fixtures/form-responses-2026.csv` is an anonymized form-response fixture.
- `fixtures/receipt-output-2026.csv` shows the intended receipt output.

This is a Google Form → Google Sheet → bound Apps Script workflow. The source sheet is named `Form Responses 1`; generated receipts are written to `Receipts`.

## Development and Validation

No local package manager, build step, linter, or CI job is configured. Validate changes in the target spreadsheet:

1. Paste or sync every JavaScript file in `src/` into the bound Apps Script project.
2. Reload the spreadsheet to run `onOpen` and expose **Seedling Sale → Generate Receipts**.
3. Run the generator against representative form responses and confirm receipt lines, totals, and bold formatting in `Receipts`.

Use `rg` for local inspection, for example `rg "extractPlantName|totalPlantCount" src/`. Do not edit `output.csv` if it exists locally; it is generated, untracked output.

## Coding Style and Naming

Use two-space indentation, semicolons, `const` by default, and `let` only for reassigned bindings. Keep Apps Script entry points in camelCase, such as `generateReceipts()` and `onOpen()`. Name helpers as verbs (`extractPlantName`) and use descriptive collection names (`itemColumns`, `boldRows`).

Keep spreadsheet-specific strings and column assumptions near the code that consumes them. Preserve the zero-based JavaScript indexes and document any spreadsheet-column mapping changes.

## Testing Guidelines

Run `runReceiptCoreTests()` from the bound Apps Script project before deploying. It verifies the 2026 headers, totals, malformed quantities, missing headers, and empty orders. Also exercise changes manually with representative form responses and compare generated output with `fixtures/receipt-output-2026.csv` when changing receipt layout.

## Commits and Pull Requests

Write imperative commit subjects under 50 characters, for example `Improve plant name extraction`. For substantial changes, add a body explaining what changed and why, followed by a `Changes:` list. Keep commits narrowly scoped.

Pull requests must state the affected sheet behavior, describe manual validation, link the relevant issue when one exists, and include screenshots when receipt layout or formatting changes.
