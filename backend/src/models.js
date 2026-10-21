const { Schema, model } = require('mongoose');
const ref = (m) => ({ type: Schema.Types.ObjectId, ref: m });

const User = model('User', new Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['admin', 'technician', 'viewer'], default: 'viewer' },
}, { timestamps: true }));

const Customer = model('Customer', new Schema({
  name: { type: String, required: true }, phone: String, email: String, address: String,
  installationDate: Date,
  installationType: { type: String, enum: ['residential', 'commercial', 'industrial'] },
  technician: ref('User'),
}, { timestamps: true }));

const Installation = model('Installation', new Schema({
  code: { type: String, unique: true },
  customer: { ...ref('Customer'), required: true },
  location: String,
  capacityKw: Number,
  installationDate: Date,
  technician: ref('User'),
  warrantyMonths: { type: Number, default: 24 },
  status: { type: String, enum: ['planned', 'active', 'faulty', 'decommissioned'], default: 'active' },
  intervalMonths: { type: Number, default: 6 },
  components: [{
    type: { type: String, enum: ['panel', 'battery', 'inverter', 'charge_controller', 'cable', 'protection', 'mounting'] },
    brand: String, model: String, quantity: Number,
  }],
}, { timestamps: true }));

const Maintenance = model('Maintenance', new Schema({
  installation: { ...ref('Installation'), required: true },
  dueDate: { type: Date, required: true },
  state: { type: String, enum: ['scheduled', 'completed', 'rescheduled'], default: 'scheduled' },
  completedAt: Date, rescheduledFrom: Date, notes: String,
}, { timestamps: true }));

const Notification = model('Notification', new Schema({
  key: { type: String, unique: true },
  maintenance: ref('Maintenance'),
  level: { type: String, enum: ['info', 'warning', 'danger'], default: 'info' },
  message: String,
  read: { type: Boolean, default: false },
}, { timestamps: true }));

module.exports = { User, Customer, Installation, Maintenance, Notification };
