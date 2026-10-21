
const mongoose = require('mongoose');

let conn;

exports.connect = async () => {
  // Reuse an existing connection promise when available.
  if (conn) {
    return conn;
  }

  const uri = process.env.MONGODB_URI;

  // Fail immediately with a clear message if the variable is missing.
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  conn = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 10000,
    })
    .catch((error) => {
      // Allow a later request to retry after a failed connection.
      conn = null;
      throw error;
    });

  return conn;
};
