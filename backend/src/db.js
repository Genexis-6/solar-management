const mongoose = require('mongoose');
let conn;
exports.connect = async () => (conn ||= mongoose.connect(process.env.MONGODB_URI));
