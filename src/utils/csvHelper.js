/**
 * CSV Helper for parsing CSV strings/buffers and generating template downloads
 */

// Robust CSV Line/Field Parser (RFC 4180 compliant, handles quotes and commas)
const parseCsvString = (csvText) => {
  // Remove UTF-8 Byte Order Mark (BOM) if present
  let cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some(val => val.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Push remaining field & row
  currentRow.push(currentField.trim());
  if (currentRow.some(val => val.length > 0)) {
    rows.push(currentRow);
  }

  if (rows.length < 2) {
    return [];
  }

  // Normalize header names
  const headers = rows[0].map(h => normalizeHeader(h));
  const data = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const record = {};
    for (let c = 0; c < headers.length; c++) {
      const headerKey = headers[c];
      record[headerKey] = row[c] !== undefined ? row[c] : '';
    }

    // Only include if has a book title
    if (record.bookName || record.title) {
      data.push({
        bookName: record.bookName || record.title || '',
        author: record.author || '',
        category: record.category || '',
        libraryCode: (record.libraryCode || record.code || '').toUpperCase(),
        shelfNumber: (record.shelfNumber || record.shelf || '').toUpperCase()
      });
    }
  }

  return data;
};

// Normalize various common column header namings
const normalizeHeader = (rawHeader) => {
  const h = rawHeader.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (h.includes('bookname') || h === 'book' || h === 'title' || h === 'name') return 'bookName';
  if (h.includes('author') || h === 'scholar' || h === 'writer') return 'author';
  if (h.includes('cat') || h === 'subject' || h === 'genre') return 'category';
  if (h.includes('code') || h.includes('librarycode') || h === 'id' || h === 'accession') return 'libraryCode';
  if (h.includes('shelf') || h.includes('shelfnumber') || h === 'location' || h === 'rack') return 'shelfNumber';
  return h;
};

// Generate Demo/Sample CSV Template with UTF-8 BOM
const getSampleCsvContent = () => {
  const bom = '\uFEFF';
  const csvData = [
    ['bookName', 'author', 'category', 'libraryCode', 'shelfNumber'],
    ['Sahih al-Bukhari (الجامع المسند الصحيح)', 'Imam Muhammad al-Bukhari', 'Hadith', 'HDTH-001', 'A-1'],
    ['Sahih Muslim (صحيح مسلم)', 'Imam Muslim ibn al-Hajjaj', 'Hadith', 'HDTH-002', 'A-1'],
    ['Riyad as-Salihin (رياض الصالحين)', 'Imam an-Nawawi', 'Hadith & Ethics', 'HDTH-005', 'A-3'],
    ['Tafsir al-Qur\'an al-Azim', 'Imam Ibn Kathir', 'Tafsir', 'TFSR-101', 'B-1'],
    ['Al-Muwatta (الموطأ)', 'Imam Malik ibn Anas', 'Fiqh', 'FQH-201', 'C-1'],
    ['Bidayat al-Mujtahid', 'Ibn Rushd (Averroes)', 'Comparative Fiqh', 'FQH-204', 'C-3'],
    ['Ihya Ulum al-Din (إحياء علوم الدين)', 'Imam al-Ghazali', 'Tasawwuf', 'TSWF-301', 'D-1']
  ];

  return bom + csvData.map(row => 
    row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
  ).join('\r\n');
};

module.exports = {
  parseCsvString,
  getSampleCsvContent
};
