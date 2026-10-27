Layout.init('invoices');
UI.crudPage({
  resource: 'invoices',
  title: 'Invoices',
  singular: 'Invoice',
  subtitle: 'Status changes to Paid automatically once payments cover the total',
  fields: [
    { key: 'client_id', label: 'Client', ref: 'clients', required: true },
    { key: 'issue_date', label: 'Issue Date', type: 'date', required: true },
    { key: 'due_date', label: 'Due Date', type: 'date', required: true },
    { key: 'total_amount', label: 'Total', type: 'number', money: true, required: true },
    { key: 'status', label: 'Status', options: ['Unpaid', 'Partial', 'Paid', 'Overdue'], badge: true },
  ],
});
