const mongoose = require('mongoose');
const Result = require('./models/Result');

const MONGO_URI = 'mongodb://localhost:27017/quizDB'; // change this to your connection string if using Atlas

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    const updates = [
      { quizId: '1760204884702', subject: 'English' },
      { quizId: '1760204742630', subject: 'Maths' },
      { quizId: '1760204389099', subject: 'Science' },
      { quizId: '1760204360343', subject: 'Computer' },
      { quizId: '1760202378786', subject: 'History' }
    ];

    for (const { quizId, subject } of updates) {
      const res = await Result.updateMany({ quizId }, { $set: { subject } });
      console.log(`Updated ${res.modifiedCount} results for ${subject}`);
    }

    mongoose.connection.close();
  })
  .catch(err => console.error('❌ Error:', err));
