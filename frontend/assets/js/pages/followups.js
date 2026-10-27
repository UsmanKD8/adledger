Layout.init('followups');
UI.crudPage({
  resource: 'followups',
  title: 'Lead Follow-ups',
  singular: 'Follow-up',
  subtitle: 'Calls, messages and emails made to leads',
  fields: [
    { key: 'lead_id', label: 'Lead', ref: 'leads', required: true },
    { key: 'user_id', label: 'Handled By', ref: 'users', required: true },
    { key: 'followup_date', label: 'Date', type: 'date', required: true },
    { key: 'method', label: 'Method', options: ['Call', 'WhatsApp', 'Email', 'Meeting'] },
    { key: 'outcome', label: 'Outcome', options: ['Pending', 'Positive', 'Negative'], badge: true },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
});
