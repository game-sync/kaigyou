document.addEventListener('DOMContentLoaded', () => {
    // 要素の取得
    const inputText = document.getElementById('input-text');
    const outputPreview = document.getElementById('output-preview'); // プレビュー用コンテナ
    const charLimitInput = document.getElementById('char-limit');
    const rowLimitInput = document.getElementById('row-limit'); // 行数制限入力
    const inputCount = document.getElementById('input-count');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn'); // 追加
    const copyIcon = copyBtn.querySelector('.copy-icon');
    const checkIcon = copyBtn.querySelector('.check-icon');
    const btnText = copyBtn.querySelector('.btn-text');

    // 定数
    const DEFAULT_CHAR_LIMIT = 25;
    const DEFAULT_ROW_LIMIT = 3;

    // 現在の処理結果を保持する変数（コピー時に使用）
    let currentCells = [];

    // ローカルストレージのキー
    const STORAGE_KEY_TEXT = 'line_breaker_text';
    const STORAGE_KEY_CHAR_LIMIT = 'line_breaker_char_limit';
    const STORAGE_KEY_ROW_LIMIT = 'line_breaker_row_limit';

    // 初期化処理
    function init() {
        loadSavedData();
        updateOutput();
        addEventListeners();
    }

    // 保存されたデータを読み込む
    function loadSavedData() {
        try {
            const savedText = localStorage.getItem(STORAGE_KEY_TEXT);
            const savedCharLimit = localStorage.getItem(STORAGE_KEY_CHAR_LIMIT);
            const savedRowLimit = localStorage.getItem(STORAGE_KEY_ROW_LIMIT);

            if (savedText !== null) inputText.value = savedText;
            if (savedCharLimit !== null) charLimitInput.value = savedCharLimit;
            if (savedRowLimit !== null) rowLimitInput.value = savedRowLimit;
        } catch (e) {
            console.error('Failed to load data from localStorage:', e);
        }
    }

    // データを保存する
    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY_TEXT, inputText.value);
            localStorage.setItem(STORAGE_KEY_CHAR_LIMIT, charLimitInput.value);
            localStorage.setItem(STORAGE_KEY_ROW_LIMIT, rowLimitInput.value);
        } catch (e) {
            console.error('Failed to save data to localStorage:', e);
        }
    }

    // イベントリスナーの登録
    function addEventListeners() {
        inputText.addEventListener('input', updateOutput);
        charLimitInput.addEventListener('input', updateOutput);
        charLimitInput.addEventListener('change', validateInputs);
        rowLimitInput.addEventListener('input', updateOutput);
        rowLimitInput.addEventListener('change', validateInputs);
        copyBtn.addEventListener('click', copyToClipboard);
        downloadBtn.addEventListener('click', downloadCSV); // 追加
    }

    // 数値入力のバリデーション
    function validateInputs() {
        let charVal = parseInt(charLimitInput.value);
        if (isNaN(charVal) || charVal < 1) charLimitInput.value = DEFAULT_CHAR_LIMIT;
        if (charVal > 1000) charLimitInput.value = 1000;

        let rowVal = parseInt(rowLimitInput.value);
        if (isNaN(rowVal) || rowVal < 1) rowLimitInput.value = DEFAULT_ROW_LIMIT;
        if (rowVal > 50) rowLimitInput.value = 50; // 安全策

        updateOutput();
    }

    // 出力の更新
    function updateOutput() {
        const text = inputText.value;
        const charLimit = parseInt(charLimitInput.value) || DEFAULT_CHAR_LIMIT;
        const rowLimit = parseInt(rowLimitInput.value) || DEFAULT_ROW_LIMIT;

        // データ保存
        saveData();

        // 文字数カウント更新
        inputCount.textContent = `${text.length}文字`;

        // 処理実行
        currentCells = processTextToCells(text, charLimit, rowLimit);

        // プレビュー描画
        renderPreview(currentCells);
    }

    // テキスト処理ロジック：テキストをセル（行の配列）の配列に変換
    function processTextToCells(text, charLimit, rowLimit) {
        if (!text) return [];

        // 1. まず全てのテキストをcharLimitで分割した「行」のリストにする
        // 段落(改行)で分け、さらにそれをcharLimitで分ける
        const rawLines = text.split(/\n/);
        let allSplitLines = [];

        rawLines.forEach(line => {
            // 空行も維持したい場合
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

    // プレビューの描画
    function renderPreview(cells) {
        outputPreview.innerHTML = '';

        if (cells.length === 0) {
            outputPreview.innerHTML = '<div class="placeholder-text">ここに結果が表示されます</div>';
            return;
        }

        cells.forEach(cellLines => {
            const card = document.createElement('div');
            card.className = 'preview-card';

            cellLines.forEach(line => {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'preview-line';
                lineDiv.textContent = line;
                // 空行の場合の高さを確保
                if (line === '') lineDiv.innerHTML = '&nbsp;';
                card.appendChild(lineDiv);
            });

            outputPreview.appendChild(card);
        });
    }

    // CSVダウンロード処理
    function downloadCSV() {
        if (currentCells.length === 0) return;

        // 1. CSVデータの文字列を作成
        // 各セルは1つのフィールド。改行を含む場合はダブルクォートで囲む必要がある。
        // Excelで開くため、セル内改行は通常のLF(\n)でOKだが、ダブルクォートのエスケープ("")が必要。
        const csvRows = currentCells.map(cellLines => {
            // セル内の行を改行で結合
            const cellContent = cellLines.join('\n');
            // ダブルクォートがあればエスケープし、全体をダブルクォートで囲む
            const escapedContent = `"${cellContent.replace(/"/g, '""')}"`;
            return escapedContent;
        });

        // 1列のCSVとして結合（改行コードはCRLF \r\n がWindows Excelには親切だが、モダンExcelはLFでもいける。
        // ここでは念のためCRLFを使う）
        const csvContent = csvRows.join('\r\n');

        // 2. Blobを作成 (BOM付きUTF-8)
        // \uFEFF がBOM
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });

        // 3. ダウンロードリンクを作成してクリック
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // ファイル名: line_breaker_YYYYMMDD_HHmm.csv
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
        link.setAttribute('download', `line_breaker_${timestamp}.csv`);

        document.body.appendChild(link);
        link.click();

        // クリーンアップ
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // クリップボードへのコピー（HTML構造を使う）
    async function copyToClipboard() {
        if (currentCells.length === 0) return;

        // HTML形式の作成（スプレッドシート用）
        // <table><tr><td>Line1<br>Line2<br>Line3</td></tr>...</table>
        let htmlContent = '<table>';
        let plainContent = '';

        currentCells.forEach(cellLines => {
            // HTML: セル内の改行は <br>
            const cellHtml = cellLines.join('<br>');
            htmlContent += `<tr><td>${cellHtml}</td></tr>`;

            // Plain: セル内改行を維持するか、ダブルクォートで囲むかなど。
            // Excel等はプレーンテキスト貼り付けだと改行でセルが変わってしまうことが多い。
            // ここではシンプルなテキストとして、各行を改行でつなぐ（セル構造は失われる可能性がある）
            plainContent += cellLines.join('\n') + '\n';
        });
        htmlContent += '</table>';

        try {
            // HTMLタイプとPlainタイプの両方をクリップボードにセット
            const blobHtml = new Blob([htmlContent], { type: 'text/html' });
            const blobText = new Blob([plainContent], { type: 'text/plain' });

            const data = [new ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobText
            })];

            await navigator.clipboard.write(data);
            showCopyFeedback();
        } catch (err) {
            console.error('Advanced copy failed:', err);
            // フォールバック: 単純テキストコピー
            fallbackCopy(plainContent);
        }
    }

    function fallbackCopy(text) {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = text;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        showCopyFeedback();
    }

    // コピー成功時のフィードバック表示
    function showCopyFeedback() {
        copyIcon.classList.add('hidden');
        checkIcon.classList.remove('hidden');
        copyBtn.style.backgroundColor = 'var(--text-main)';
        copyBtn.style.color = 'var(--bg-dark)';
        btnText.textContent = '完了!';

        setTimeout(() => {
            copyIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
            copyBtn.style.backgroundColor = '';
            copyBtn.style.color = '';
            btnText.textContent = 'コピー';
        }, 2000);
    }

    // 開始
    init();
});
