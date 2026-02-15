// CSV生成ロジックの検証

function generateCSV(cells) {
    // 1. CSVデータの文字列を作成
    const csvRows = cells.map(cellLines => {
        // セル内の行を改行で結合
        const cellContent = cellLines.join('\n');
        // ダブルクォートがあればエスケープし、全体をダブルクォートで囲む
        const escapedContent = `"${cellContent.replace(/"/g, '""')}"`;
        return escapedContent;
    });

    // 1列のCSVとして結合
    const csvContent = csvRows.join('\r\n');
    return csvContent;
}

// テストデータ
const testCells = [
    ["Line 1", "Line 2"], // Cell 1: Should be "Line 1\nLine 2"
    ["Line 3"],           // Cell 2: Should be "Line 3"
    ['He said "Hello"', "World"] // Cell 3: Should handle quotes -> "He said ""Hello""\nWorld"
];

console.log("--- Test Case: CSV Escaping ---");
const csvOutput = generateCSV(testCells);
console.log(csvOutput);

// Expected manual check
// Cell 1: "Line 1
// Line 2" (wrapped in quotes)
// Cell 2: "Line 3"
// Cell 3: "He said ""Hello""
// World"

// Check for correct quoting
if (csvOutput.includes('"Line 1\nLine 2"') && csvOutput.includes('"Line 3"') && csvOutput.includes('"He said ""Hello""\nWorld"')) {
    console.log("PASS: Content is correctly escaped and quoted.");
} else {
    console.log("FAIL: Incorrect escaping.");
}

// Check for correct row separation
if (csvOutput.split('\r\n').length === 3) {
    console.log("PASS: 3 rows generated.");
} else {
    console.log("FAIL: Row count mismatch.");
}
