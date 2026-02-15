// script.jsのロジックをここに再現してテストする

function processText(text, limit) {
    if (!text) return '';
    if (limit < 1) return text;

    // 段落（既存の改行）ごとに分割して処理する
    const paragraphs = text.split(/\n/);

    const processedParagraphs = paragraphs.map(paragraph => {
        // 各段落を指定文字数で分割する
        return splitStringByLength(paragraph, limit).join('\n');
    });

    return processedParagraphs.join('\n');
}

function splitStringByLength(str, length) {
    if (!str) return ['']; // 空行の維持のため
    const result = [];
    let currentIndex = 0;

    while (currentIndex < str.length) {
        result.push(str.slice(currentIndex, currentIndex + length));
        currentIndex += length;
    }
    return result;
}

// テスト実行
console.log("--- Test Case 1: Simple wrap ---");
const input1 = "123456789012345678901234567890"; // 30 chars
const output1 = processText(input1, 25);
console.log(`Input length: ${input1.length}`);
console.log(`Output:\n${output1}`);
if (output1 === "1234567890123456789012345\n67890") {
    console.log("PASS");
} else {
    console.log("FAIL");
}

console.log("\n--- Test Case 2: Paragraphs ---");
const input2 = "Paragraph 1 is short.\nParagraph 2 is very long and should be wrapped after 25 characters.";
const output2 = processText(input2, 25);
console.log(`Output:\n${output2}`);
// Paragraph 1 is short. (21 chars) -> No wrap
// Paragraph 2... -> wrapped
const expected2 = "Paragraph 1 is short.\nParagraph 2 is very long \nand should be wrapped aft\ner 25 characters.";
if (output2 === expected2) {
    console.log("PASS");
} else {
    console.log("FAIL");
    console.log(`Expected:\n${expected2}`);
}

console.log("\n--- Test Case 3: Empty lines ---");
const input3 = "Line 1\n\nLine 3";
const output3 = processText(input3, 25);
console.log(`Output:\n${output3}`);
if (output3 === "Line 1\n\nLine 3") {
    console.log("PASS");
} else {
    console.log("FAIL");
}

console.log("\n--- Test Case 4: Custom Limit (10) ---");
const input4 = "123456789012345";
const output4 = processText(input4, 10);
console.log(`Output:\n${output4}`);
if (output4 === "1234567890\n12345") {
    console.log("PASS");
} else {
    console.log("FAIL");
}
