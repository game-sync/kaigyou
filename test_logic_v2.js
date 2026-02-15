// script.jsのロジック(v2)をここに再現してテストする

// テキスト処理ロジック：テキストをセル（行の配列）の配列に変換
function processTextToCells(text, charLimit, rowLimit) {
    if (!text) return [];

    // 1. まず全てのテキストをcharLimitで分割した「行」のリストにする
    const rawLines = text.split(/\n/);
    let allSplitLines = [];

    rawLines.forEach(line => {
        if (line === '') {
            allSplitLines.push('');
            return;
        }
        const split = splitStringByLength(line, charLimit);
        allSplitLines = allSplitLines.concat(split);
    });

    // 2. 「行」のリストをrowLimitごとにまとめて「セル」を作る
    const cells = [];
    for (let i = 0; i < allSplitLines.length; i += rowLimit) {
        const cellLines = allSplitLines.slice(i, i + rowLimit);
        cells.push(cellLines);
    }

    return cells;
}

// 文字列を指定長で分割する補助関数
function splitStringByLength(str, length) {
    if (!str) return [];
    const result = [];
    let currentIndex = 0;
    while (currentIndex < str.length) {
        result.push(str.slice(currentIndex, currentIndex + length));
        currentIndex += length;
    }
    return result;
}

// テスト実行
console.log("--- Test Case 1: Simple 3 lines (One Cell) ---");
// 25 chars * 3 = 75 chars exactly
const input1 = "1234567890123456789012345" + "1234567890123456789012345" + "1234567890123456789012345";
const output1 = processTextToCells(input1, 25, 3);
// Expected: [[line1, line2, line3]] (1 cell)
console.log(`Cells count: ${output1.length}`);
console.log(JSON.stringify(output1, null, 2));

if (output1.length === 1 && output1[0].length === 3) {
    console.log("PASS");
} else {
    console.log("FAIL");
}

console.log("\n--- Test Case 2: 4 lines (Two Cells) ---");
// 25 chars * 4 = 100 chars
const input2 = "1234567890123456789012345" + "1234567890123456789012345" + "1234567890123456789012345" + "1234567890123456789012345";
const output2 = processTextToCells(input2, 25, 3);
// Expected: [[line1, line2, line3], [line4]] (2 cells)
console.log(`Cells count: ${output2.length}`);
console.log(JSON.stringify(output2, null, 2));

if (output2.length === 2 && output2[0].length === 3 && output2[1].length === 1) {
    console.log("PASS");
} else {
    console.log("FAIL");
}

console.log("\n--- Test Case 3: Newlines in input ---");
const input3 = "Line 1\nLine 2 is long but not 25 chars\nLine 3";
const output3 = processTextToCells(input3, 25, 3);
// Expected: [[Line 1, Line 2..., Line 3]] (1 cell if Line 2 < 25 chars)
// But wait, "Line 2 is long but not 25 chars" is 31 chars.
// It will be split into: "Line 2 is long but not 25", " chars"
// So total lines: Line 1, [Line 2 part 1], [Line 2 part 2], Line 3 -> 4 lines
// Cells: [[L1, L2p1, L2p2], [L3]]

console.log(JSON.stringify(output3, null, 2));
if (output3.length === 2 && output3[0].length === 3 && output3[1].length === 1) {
    console.log("PASS");
} else {
    console.log("FAIL");
}
