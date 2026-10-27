Layout.init('sales');
UI.crudPage({
  resource: 'sales',
  title: 'Sales',
  singular: 'Sale',
  subtitle: 'Closed sales, each linked back to a lead',
  fields: [
    { key: 'lead_id', label: 'Lead', ref: 'leads', required: true },
    { key: 'sale_date', label: 'Sale Date', type: 'date', required: true },
    { key: 'sale_amount', label: 'Amount', type: 'number', money: true, required: true },
    { key: 'product_service', label: 'Product / Service' },
  ],
});
