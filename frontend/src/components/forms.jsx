import React from 'react';
import { api } from '../api.js';
import { useToast } from '../toast.jsx';
import { useFetch, dateVal } from '../utils.js';
import { Async, Form, Modal } from './ui.jsx';

const id = (v) => (v && v._id) || v || '';
const staffOptions = (users) => [
  { v: '', l: 'Unassigned Technician' },
  ...users
    .filter((u) => u.role !== 'viewer')
    .map((u) => ({ v: u._id, l: `${u.name} (${u.role})` })),
];

export function CustomerFormModal({ values = {}, onClose, onSaved }) {
  const users = useFetch('/users');
  const toast = useToast();
  const edit = !!values._id;

  return (
    <Modal
      title={edit ? 'Edit Customer Details' : 'Register New Customer'}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <Async res={users}>
        {(us) => (
          <Form
            onCancel={onClose}
            submitLabel={edit ? 'Update Customer' : 'Register Customer'}
            initial={{
              ...values,
              technician: id(values.technician),
              installationDate: dateVal(values.installationDate || new Date()),
              installationType: values.installationType || 'residential',
            }}
            fields={[
              { name: 'name', label: 'Customer / Facility Name', required: true, placeholder: 'e.g. ABC Residence' },
              { name: 'phone', label: 'Phone Number', placeholder: 'e.g. +234 803 123 4567' },
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'customer@example.com' },
              { name: 'address', label: 'Installation Address / City', placeholder: 'e.g. 14 Crescent Way, Abuja' },
              { name: 'installationDate', label: 'Initial Installation Date', type: 'date', required: true },
              {
                name: 'installationType',
                label: 'Installation Type',
                type: 'select',
                options: [
                  { v: 'residential', l: 'Residential' },
                  { v: 'commercial', l: 'Commercial' },
                  { v: 'industrial', l: 'Industrial' },
                ],
              },
              {
                name: 'technician',
                label: 'Assigned Lead Technician',
                type: 'select',
                options: staffOptions(us),
                full: true,
              },
            ]}
            onSubmit={async (v) => {
              if (edit) {
                await api.put('/customers/' + values._id, v);
              } else {
                await api.post('/customers', v);
              }
              toast(edit ? 'Customer updated successfully' : 'New customer registered successfully');
              onClose();
              onSaved();
            }}
          />
        )}
      </Async>
    </Modal>
  );
}

export function InstallationFormModal({ values = {}, customerId, onClose, onSaved }) {
  const users = useFetch('/users');
  const custs = useFetch('/customers');
  const toast = useToast();
  const edit = !!values._id;

  return (
    <Modal
      title={edit ? 'Edit Solar Installation' : 'Create Solar Installation & Auto-Schedule Maintenance'}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <Async res={users}>
        {(us) => (
          <Async res={custs}>
            {(cs) => (
              <Form
                onCancel={onClose}
                submitLabel={edit ? 'Save Installation' : 'Create Installation & Generate Schedule'}
                initial={{
                  warrantyMonths: 24,
                  intervalMonths: 6,
                  status: 'active',
                  ...values,
                  customer: id(values.customer) || customerId || (cs[0] && cs[0]._id) || '',
                  technician: id(values.technician),
                  installationDate: dateVal(values.installationDate || new Date()),
                  components: values.components && values.components.length > 0
                    ? values.components
                    : [
                        { type: 'panel', brand: 'Jinko Solar', model: 'Tiger Neo 550W', quantity: 18 },
                        { type: 'inverter', brand: 'Growatt', model: 'SPF 10000TL', quantity: 1 },
                        { type: 'battery', brand: 'Pylontech', model: 'US5000 4.8kWh', quantity: 3 },
                        { type: 'charge_controller', brand: 'Victron', model: 'SmartSolar 150/70', quantity: 1 },
                        { type: 'cable', brand: 'Generic', model: '6mm2 Solar PV Cable', quantity: 100 },
                        { type: 'protection', brand: 'Schneider', model: 'DC Breaker & Surge Protector', quantity: 2 },
                        { type: 'mounting', brand: 'Generic', model: 'Aluminium Roof Rail Kit', quantity: 1 },
                      ],
                }}
                fields={[
                  {
                    name: 'customer',
                    label: 'Customer',
                    type: 'select',
                    required: true,
                    options: cs.map((c) => ({ v: c._id, l: `${c.name} (${c.address || 'No address'})` })),
                  },
                  { name: 'location', label: 'Installation Location / Site', required: true, placeholder: 'e.g. Abuja Main Residence' },
                  { name: 'capacityKw', label: 'System Capacity (kW)', type: 'number', required: true, min: 0.1, placeholder: 'e.g. 5 or 10' },
                  { name: 'installationDate', label: 'Commissioning Date', type: 'date', required: true },
                  {
                    name: 'technician',
                    label: 'Lead Installer / Technician',
                    type: 'select',
                    options: staffOptions(us),
                  },
                  { name: 'warrantyMonths', label: 'Warranty Period (Months)', type: 'number', min: 0, placeholder: 'e.g. 24' },
                  {
                    name: 'status',
                    label: 'Operational Status',
                    type: 'select',
                    options: [
                      { v: 'active', l: 'Active' },
                      { v: 'planned', l: 'Planned' },
                      { v: 'faulty', l: 'Faulty' },
                      { v: 'decommissioned', l: 'Decommissioned' },
                    ],
                  },
                  {
                    name: 'intervalMonths',
                    label: 'Periodic Maintenance Interval (Months)',
                    type: 'number',
                    min: 1,
                    placeholder: 'Default 6 months',
                  },
                  { name: 'components', type: 'components' },
                ]}
                onSubmit={async (v) => {
                  if (edit) {
                    await api.put('/installations/' + values._id, v);
                  } else {
                    await api.post('/installations', v);
                  }
                  toast(
                    edit
                      ? 'Installation details updated'
                      : 'Installation created with automatic 4-cycle maintenance schedule!'
                  );
                  onClose();
                  onSaved();
                }}
              />
            )}
          </Async>
        )}
      </Async>
    </Modal>
  );
}
