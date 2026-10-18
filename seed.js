require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./src/models/Book');

const sampleBooks = [
  {
    bookName: 'Sahih al-Bukhari (الجامع المسند الصحيح)',
    author: 'Imam Muhammad al-Bukhari',
    category: 'Hadith',
    libraryCode: 'HDTH-001',
    shelfNumber: 'A-1'
  },
  {
    bookName: 'Sahih Muslim (صحيح مسلم)',
    author: 'Imam Muslim ibn al-Hajjaj',
    category: 'Hadith',
    libraryCode: 'HDTH-002',
    shelfNumber: 'A-1'
  },
  {
    bookName: 'Sunan Abi Dawud (سنن أبي داود)',
    author: 'Imam Abu Dawud',
    category: 'Hadith',
    libraryCode: 'HDTH-003',
    shelfNumber: 'A-2'
  },
  {
    bookName: 'Jami` at-Tirmidhi (جامع الترمذي)',
    author: 'Imam at-Tirmidhi',
    category: 'Hadith',
    libraryCode: 'HDTH-004',
    shelfNumber: 'A-2'
  },
  {
    bookName: 'Riyad as-Salihin (رياض الصالحين)',
    author: 'Imam Yahya ibn Sharaf an-Nawawi',
    category: 'Hadith & Ethics',
    libraryCode: 'HDTH-005',
    shelfNumber: 'A-3'
  },
  {
    bookName: 'Tafsir al-Qur\'an al-Azim (تفسير ابن كثير)',
    author: 'Imam Ibn Kathir',
    category: 'Tafsir',
    libraryCode: 'TFSR-101',
    shelfNumber: 'B-1'
  },
  {
    bookName: 'Tafsir al-Jalalayn (تفسير الجلالين)',
    author: 'Jalal al-Din al-Mahalli & Jalal al-Din al-Suyuti',
    category: 'Tafsir',
    libraryCode: 'TFSR-102',
    shelfNumber: 'B-1'
  },
  {
    bookName: 'Al-Muwatta (الموطأ)',
    author: 'Imam Malik ibn Anas',
    category: 'Fiqh & Hadith',
    libraryCode: 'FQH-201',
    shelfNumber: 'C-1'
  },
  {
    bookName: 'Al-Umm (كتاب الأم)',
    author: 'Imam Muhammad ibn Idris ash-Shafi`i',
    category: 'Fiqh (Shafi`i)',
    libraryCode: 'FQH-202',
    shelfNumber: 'C-2'
  },
  {
    bookName: 'Minhaj at-Talibin (منهاج الطالبين)',
    author: 'Imam Yahya ibn Sharaf an-Nawawi',
    category: 'Fiqh (Shafi`i)',
    libraryCode: 'FQH-203',
    shelfNumber: 'C-2'
  },
  {
    bookName: 'Bidayat al-Mujtahid (بداية المجتهد ونهاية المقتصد)',
    author: 'Ibn Rushd (Averroes)',
    category: 'Comparative Fiqh',
    libraryCode: 'FQH-204',
    shelfNumber: 'C-3'
  },
  {
    bookName: 'Ihya Ulum al-Din (إحياء علوم الدين)',
    author: 'Imam Abu Hamid al-Ghazali',
    category: 'Tasawwuf & Ethics',
    libraryCode: 'TSWF-301',
    shelfNumber: 'D-1'
  },
  {
    bookName: 'Al-Risalah al-Qushayriyyah (الرسالة القشيرية)',
    author: 'Imam Abu al-Qasim al-Qushayri',
    category: 'Tasawwuf',
    libraryCode: 'TSWF-302',
    shelfNumber: 'D-1'
  },
  {
    bookName: 'Al-Aqeedah at-Tahawiyyah (العقيدة الطحاوية)',
    author: 'Imam Abu Ja\'far at-Tahawi',
    category: 'Aqeedah',
    libraryCode: 'AQD-401',
    shelfNumber: 'E-1'
  },
  {
    bookName: 'Ar-Raheeq Al-Makhtum (The Sealed Nectar)',
    author: 'Safiur Rahman Mubarakpuri',
    category: 'Seerah & Biography',
    libraryCode: 'SRH-501',
    shelfNumber: 'F-1'
  },
  {
    bookName: 'Al-Muqaddimah (مقدمة ابن خلدون)',
    author: 'Ibn Khaldun',
    category: 'History & Sociology',
    libraryCode: 'HIST-601',
    shelfNumber: 'G-1'
  }
];

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/islamicLibrary';
  
  try {
    console.log(`Connecting to MongoDB at: ${uri}`);
    await mongoose.connect(uri);
    console.log('Connected! Checking existing books...');

    // Delete existing or insert only missing
    const existingCount = await Book.countDocuments();
    console.log(`Found ${existingCount} existing books.`);

    if (existingCount > 0) {
      console.log('Clearing existing books for fresh seed...');
      await Book.deleteMany({});
    }

    const inserted = await Book.insertMany(sampleBooks);
    console.log(`Successfully seeded ${inserted.length} Islamic library books with shelf numbers!`);
    console.log('Sample shelves populated: A-1, A-2, A-3, B-1, C-1, C-2, C-3, D-1, E-1, F-1, G-1');

    await mongoose.disconnect();
    console.log('Database disconnected successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

seedDatabase();
