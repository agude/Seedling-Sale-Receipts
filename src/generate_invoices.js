function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Seedling Sale")
    .addItem("Generate Receipts", "generateReceipts")
    .addToUi();
}

function generateReceipts() {
  const saleConfig = getActiveSaleConfig();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = spreadsheet.getSheetByName(saleConfig.sourceSheetName);

  if (!sourceSheet) {
    throw new Error(`Source sheet not found: ${saleConfig.sourceSheetName}.`);
  }

  const data = sourceSheet.getDataRange().getValues();
  if (data.length === 0) {
    throw new Error("Source sheet has no header row.");
  }

  const [headers, ...orderRows] = data;
  const readOrder = createOrderReader(headers, saleConfig);
  const outputRows = [[saleConfig.receiptTitle]];
  const boldRows = [1];

  for (const orderRow of orderRows) {
    const order = readOrder(orderRow);
    if (!order) {
      continue;
    }

    const receipt = buildReceiptRows(
      order,
      formatOrderDate(order.timestamp),
      saleConfig,
    );
    const firstReceiptRow = outputRows.length + 1;
    outputRows.push(...receipt.rows);

    for (const rowOffset of receipt.boldRowOffsets) {
      boldRows.push(firstReceiptRow + rowOffset - 1);
    }
  }

  writeReceipts(spreadsheet, saleConfig.receiptSheetName, outputRows, boldRows);
}

function formatOrderDate(timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Order timestamp is invalid: ${timestamp}.`);
  }

  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    "MMM dd, yyyy",
  );
}

function writeReceipts(spreadsheet, receiptSheetName, outputRows, boldRows) {
  let receiptSheet = spreadsheet.getSheetByName(receiptSheetName);
  if (!receiptSheet) {
    receiptSheet = spreadsheet.insertSheet(receiptSheetName);
  }

  const rowsToReset = Math.max(receiptSheet.getLastRow(), outputRows.length);
  if (rowsToReset > 0) {
    receiptSheet.getRange(1, 1, rowsToReset, 1)
      .clearContent()
      .setFontWeight("normal");
  }

  receiptSheet.getRange(1, 1, outputRows.length, 1).setValues(outputRows);
  receiptSheet.getRangeList(boldRows.map((row) => `A${row}`))
    .setFontWeight("bold");
}
