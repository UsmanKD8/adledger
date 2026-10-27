Layout.init('clients');
UI.crudPage({
  resource: 'clients',
  title: 'Clients',
  singular: 'Client',
  subtitle: 'Companies the agency runs campaigns for',
  fields: [
    { key: 'company_name', label: 'Company', required: true },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'phone', label: 'Phone' },
    { key: 'industry', label: 'Industry' },
    { key: 'status', label: 'Status', options: ['Active', 'Inactive'], badge: true },
  ],
});
