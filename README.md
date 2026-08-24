# Seedling Sale Receipts

Google Apps Script that turns Google Form responses in a Google Sheet into
formatted seedling-sale receipts.

## Repository layout

- `src/` — Apps Script source and manifest. Copy these files into the
  spreadsheet-bound Apps Script project.
- `fixtures/` — anonymized 2026 form-response and receipt-output examples.
- `AGENTS.md` — contributor and validation requirements.

Never commit live Form exports, generated receipts, or Apps Script credentials.

## Install in a spreadsheet

1. Open the Google Sheet that receives the Form responses.
2. Select **Extensions → Apps Script**.
3. Add each JavaScript file from `src/` as a script file. The Apps Script
   editor uses `.gs` filenames; the code remains JavaScript.
4. Save the project, run `runReceiptCoreTests`, then run `generateReceipts`
   once to authorize it.
5. Reload the spreadsheet and use **Seedling Sale → Generate Receipts**.

The 2026 configuration expects a source tab named `Form Responses 1` and
writes receipts to a `Receipts` tab.

## New sale years

Add a configuration entry to `src/sale_config.js`, then select it with
`ACTIVE_SALE_YEAR`. Keep form-specific headers and the first item column in
that configuration. Keep receipt rendering in `src/receipt_core.js` generic.

Update the anonymized fixture and extend `src/receipt_core_test.js` for each
new form schema. Run `runReceiptCoreTests` in the bound Apps Script project
before using the new sale form.

## GitHub workflow

This repository has no local build or CI job because its test runner executes
inside the bound Apps Script project. Use the Apps Script editor for runtime
validation. `.clasp.json` and `.clasprc.json` are ignored so a future `clasp`
setup cannot publish script IDs or OAuth credentials accidentally.

## License

This project is released under [CC0 1.0](LICENSE).
