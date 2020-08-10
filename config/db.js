const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');

const connectDB = async() => {
    try {
        await mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit with error -> https://nodejs.org/api/process.html#process_process_exit_code
        process.exit(1);
    }
};

module.exports = connectDB;