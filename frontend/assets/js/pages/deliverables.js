Layout.init('deliverables');
UI.crudPage({
  resource: 'deliverables',
  title: 'Deliverables',
  singular: 'Deliverable',
  subtitle: 'Creative and setup tasks owed for each campaign',
  fields: [
    { key: 'title', label: 'Title', required: true },
    { key: 'campaign_id', label: 'Campaign', ref: 'campaigns', required: true },
    { key: 'user_id', label: 'Assigned To', ref: 'users', required: true },
    { key: 'due_date', label: 'Due Date', type: 'date' },
    { key: 'status', label: 'Status', options: ['Pending', 'In Progress', 'Done'], badge: true },
  ],
});
