Layout.init('payments');
UI.crudPage({
  resource: 'payments',
  title: 'Payments',
  singular: 'Payment',
  subtitle: 'Payments received against invoices',
  fields: [
    { key: 'invoice_id', label: 'Invoice', ref: 'invoices', required: true },
    { key: 'payment_date', label: 'Date', type: 'date', required: true },
    { key: 'amount', label: 'Amount', type: 'number', money: true, required: true },
    { key: 'payment_method', label: 'Method', options: ['Bank Transfer', 'Cash', 'Cheque', 'Card'] },
  ],
});
