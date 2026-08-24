function runReceiptCoreTests() {
  const tests = [
    test2026FormSchema,
    testReceiptRows,
    testMalformedQuantity,
    testMissingRequiredHeader,
    testOrderWithoutItems,
  ];

  const failures = [];
  for (const test of tests) {
    try {
      test();
    } catch (error) {
      failures.push(`${test.name}: ${error.message}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Receipt tests failed:\n${failures.join("\n")}`);
  }

  return `${tests.length} receipt tests passed.`;
}

function test2026FormSchema() {
  const headers = get2026Headers();
  const saleConfig = getActiveSaleConfig();
  const itemColumns = findItemColumns(headers, saleConfig.firstItemColumn);

  assertEqual(itemColumns[0].index, 3, "Green broccoli column");
  assertEqual(itemColumns[0].name, "Green broccoli", "Green broccoli name");
  assertEqual(itemColumns.length, 13, "2026 item column count");
  assertEqual(itemColumns[12].name, "Lettuce mix", "Lettuce mix name");
}

function testReceiptRows() {
  const saleConfig = getActiveSaleConfig();
  const readOrder = createOrderReader(get2026Headers(), saleConfig);
  const order = readOrder([
    "2/1/2026 15:50:38",
    "customer@example.com",
    "Test Customer",
    2,
    1,
  ]);
  const receipt = buildReceiptRows(order, "Feb 01, 2026", saleConfig);

  assertEqual(receipt.rows[3][0], "ITEMS ORDERED:", "items heading");
  assertEqual(receipt.rows[4][0], "2 × Green broccoli", "first item row");
  assertEqual(receipt.rows[5][0], "1 × Purple broccoli", "second item row");
  assertEqual(receipt.rows[7][0], "TOTAL: 3 plants × $4 = $12", "total row");
  assertEqual(receipt.boldRowOffsets.join(","), "4,8", "bold row offsets");
}

function testMalformedQuantity() {
  assertThrows(
    () => parseQuantity("2, 4", "Green broccoli"),
    "must be a whole number",
  );
}

function testMissingRequiredHeader() {
  const headers = get2026Headers().filter((header) => header !== "Email Address");
  const saleConfig = getActiveSaleConfig();

  assertThrows(
    () => createOrderReader(headers, saleConfig),
    "Required form header is missing: Email Address.",
  );
}

function testOrderWithoutItems() {
  const saleConfig = getActiveSaleConfig();
  const readOrder = createOrderReader(get2026Headers(), saleConfig);

  assertEqual(
    readOrder(["2/1/2026 15:50:38", "customer@example.com", "Test Customer"]),
    null,
    "order without selected items",
  );
}

function get2026Headers() {
  return [
    "Timestamp",
    "Email Address",
    "Name:",
    "Green broccoli: Classic green florets.",
    "Purple broccoli: Sweet purple florets.",
    "White cauliflower: Mild white curds.",
    "Orange cauliflower: Bright orange heads.",
    "Purple cauliflower: Violet florets.",
    "Cone shape cabbage: Sweet pointed heads.",
    "Green cabbage: Firm green leaves.",
    "Red cabbage: Deep purple leaves.",
    "Red beet/ golden beet mix seeded: Earthy roots and greens.",
    "Chard/ collard greens mix: Robust hearty greens.",
    "Tsoi sim: Delicate Chinese green.",
    "Chinese broccoli/ pak choy mix: Premium Asian greens.",
    "Lettuce mix: Tender crisp leaves.",
    "",
  ];
}

function assertEqual(actual, expected, description) {
  if (actual !== expected) {
    throw new Error(`${description}: expected ${expected}, received ${actual}.`);
  }
}

function assertThrows(action, expectedMessage) {
  try {
    action();
  } catch (error) {
    if (error.message.includes(expectedMessage)) {
      return;
    }

    throw new Error(`Expected "${expectedMessage}", received "${error.message}".`);
  }

  throw new Error(`Expected error containing "${expectedMessage}".`);
}
