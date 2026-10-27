Layout.init('campaigns');
UI.crudPage({
  resource: 'campaigns',
  title: 'Campaigns',
  singular: 'Campaign',
  subtitle: 'Advertising campaigns per client',
  fields: [
    { key: 'campaign_name', label: 'Campaign', required: true },
    { key: 'client_id', label: 'Client', ref: 'clients', required: true },
    { key: 'platform', label: 'Platform', options: ['Meta', 'Google', 'Instagram', 'TikTok', 'LinkedIn', 'YouTube'] },
    { key: 'objective', label: 'Objective', options: ['Awareness', 'Leads', 'Conversions', 'Sales'] },
    { key: 'start_date', label: 'Start Date', type: 'date', required: true },
    { key: 'end_date', label: 'End Date', type: 'date' },
    { key: 'budget', label: 'Budget', type: 'number', money: true, required: true },
    { key: 'status', label: 'Status', options: ['Active', 'Paused', 'Completed'], badge: true },
  ],
});
