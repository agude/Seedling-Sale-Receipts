function generateInvoices() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName("Form Responses 1"); // Adjust to your sheet name

  // Create or clear the invoice sheet
  let invoiceSheet = ss.getSheetByName("Invoices");
  if (invoiceSheet) {
    invoiceSheet.clear();
  } else {
    invoiceSheet = ss.insertSheet("Invoices");
  }

  const data = sourceSheet.getDataRange().getValues();
  const headers = data[0];

  // Extract plant names from headers (columns 4 onward, index 4+)
  // Plant name is the first few words before the description
  const plantColumns = [];
  for (let col = 4; col < headers.length; col++) {
    const fullHeader = headers[col];
    if (fullHeader && fullHeader.trim()) {
      // Extract plant name - take text before common description patterns
      let plantName = extractPlantName(fullHeader);
      plantColumns.push({ col: col, name: plantName });
    }
  }

  const output = [["SEEDLING INVOICES"]];

  // Process each order row (skip header rows, start at row with actual data)
  for (let row = 1; row < data.length; row++) {
    const rowData = data[row];
    const timestamp = rowData[0];
    const email = rowData[1];
    const name = rowData[2];
    // Column 3 is coupon code, skip it

    // Skip empty rows
    if (!timestamp || (!email && !name)) continue;

    // Format date
    let orderDate = "";
    if (timestamp instanceof Date) {
      orderDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "MMM dd, yyyy");
    } else if (timestamp) {
      // Try to parse string date
      const parsed = new Date(timestamp);
      if (!isNaN(parsed)) {
        orderDate = Utilities.formatDate(parsed, Session.getScriptTimeZone(), "MMM dd, yyyy");
      }
    }

    // Collect items ordered
    const items = [];
    let totalPlants = 0;

    for (const plant of plantColumns) {
      const qty = rowData[plant.col];
      if (qty && qty !== "" && !isNaN(parseInt(qty))) {
        const quantity = parseInt(qty);
        items.push({ qty: quantity, name: plant.name });
        totalPlants += quantity;
      }
    }

    // Skip if no items ordered
    if (items.length === 0) continue;

    // Build invoice
    output.push([`Order Date: ${orderDate}`]);
    output.push([`Name: ${name || ""}`]);
    output.push([`Email: ${email || ""}`]);
    output.push(["ITEMS ORDERED:"]);

    for (const item of items) {
      output.push([`${item.qty} × ${item.name}`]);
    }

    output.push([""]);
    const total = totalPlants * 4;
    output.push([`TOTAL: ${totalPlants} plants × $4 = $${total}`]);
    output.push([""]);
    output.push(["-------------------------------------------------------"]);
    output.push([""]);
  }

  // Write to invoice sheet
  if (output.length > 0) {
    invoiceSheet.getRange(1, 1, output.length, 1).setValues(output);
  }
}

function extractPlantName(header) {
  // Common patterns that start descriptions
  const descriptionStarters = [
    " A ", " An ", " The ", " Often ", " Usually ", " These ", " This ",
    " Known ", " Widely ", " Famous ", " prized ", " is a ", " is the ",
    "(Limited", "100,000", " –"
  ];

  let name = header.trim();

  // Find the earliest description starter
  let cutoff = name.length;
  for (const starter of descriptionStarters) {
    const idx = name.indexOf(starter);
    if (idx > 0 && idx < cutoff) {
      cutoff = idx;
    }
  }

  name = name.substring(0, cutoff).trim();

  // Clean up trailing punctuation
  name = name.replace(/[:.,;]+$/, "").trim();

  return name;
}
