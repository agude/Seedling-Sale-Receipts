const ACTIVE_SALE_YEAR = "2026";

const SALE_CONFIGS = {
  "2026": {
    emailHeader: "Email Address",
    firstItemColumn: 3,
    nameHeader: "Name:",
    pricePerPlant: 4,
    receiptSheetName: "Receipts",
    receiptTitle: "SEEDLING SALE RECEIPTS 2026",
    sourceSheetName: "Form Responses 1",
    timestampHeader: "Timestamp",
  },
};

function getActiveSaleConfig() {
  const saleConfig = SALE_CONFIGS[ACTIVE_SALE_YEAR];
  if (!saleConfig) {
    throw new Error(`No configuration exists for sale year ${ACTIVE_SALE_YEAR}.`);
  }

  return saleConfig;
}
