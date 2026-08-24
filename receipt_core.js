function createOrderReader(headers, saleConfig) {
  const customerColumns = {
    email: findRequiredHeaderColumn(headers, saleConfig.emailHeader),
    name: findRequiredHeaderColumn(headers, saleConfig.nameHeader),
    timestamp: findRequiredHeaderColumn(headers, saleConfig.timestampHeader),
  };
  const itemColumns = findItemColumns(headers, saleConfig.firstItemColumn);

  return function readOrder(row) {
    const timestamp = row[customerColumns.timestamp];
    const email = row[customerColumns.email];
    const name = row[customerColumns.name];

    if (!timestamp || (!email && !name)) {
      return null;
    }

    const items = [];
    for (const itemColumn of itemColumns) {
      const quantity = parseQuantity(row[itemColumn.index], itemColumn.name);
      if (quantity > 0) {
        items.push({ name: itemColumn.name, quantity: quantity });
      }
    }

    if (items.length === 0) {
      return null;
    }

    return { email: email, items: items, name: name, timestamp: timestamp };
  };
}

function findRequiredHeaderColumn(headers, expectedHeader) {
  const column = headers.indexOf(expectedHeader);
  if (column === -1) {
    throw new Error(`Required form header is missing: ${expectedHeader}.`);
  }

  return column;
}

function findItemColumns(headers, firstItemColumn) {
  const itemColumns = [];

  for (let column = firstItemColumn; column < headers.length; column++) {
    const header = headers[column];
    if (!header || !String(header).trim()) {
      continue;
    }

    itemColumns.push({ index: column, name: extractPlantName(String(header)) });
  }

  return itemColumns;
}

function parseQuantity(value, itemName) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  const text = String(value).trim();
  if (text === "") {
    return 0;
  }

  if (!/^\d+$/.test(text)) {
    throw new Error(`Quantity for ${itemName} must be a whole number; received "${value}".`);
  }

  return Number(text);
}

function extractPlantName(header) {
  const trimmedHeader = header.trim();
  const colonIndex = trimmedHeader.indexOf(":");
  const name = colonIndex === -1
    ? trimmedHeader
    : trimmedHeader.substring(0, colonIndex).trim();

  if (!name) {
    throw new Error(`Item header has no plant name: "${header}".`);
  }

  return name;
}

function buildReceiptRows(order, formattedOrderDate, saleConfig) {
  const totalPlantCount = order.items.reduce(
    (count, item) => count + item.quantity,
    0,
  );
  const totalPrice = totalPlantCount * saleConfig.pricePerPlant;
  const rows = [
    [`Order Date: ${formattedOrderDate}`],
    [`Name: ${order.name || ""}`],
    [`Email: ${order.email || ""}`],
    ["ITEMS ORDERED:"],
    ...order.items.map((item) => [`${item.quantity} × ${item.name}`]),
    [""],
    [
      `TOTAL: ${totalPlantCount} plants × $${saleConfig.pricePerPlant} = $${totalPrice}`,
    ],
    [""],
    ["-------------------------------------------------------"],
    [""],
  ];

  return {
    boldRowOffsets: [4, order.items.length + 6],
    rows: rows,
  };
}
