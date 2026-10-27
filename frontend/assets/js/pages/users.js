Layout.init('users');
UI.crudPage({
  resource: 'users',
  title: 'Agency Users',
  singular: 'User',
  subtitle: 'Staff accounts and roles',
  fields: [
    { key: 'full_name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'role', label: 'Role', options: ['Admin', 'Manager', 'Sales'] },
    // Sent to the backend, which stores only password_hash.
    { key: 'password', label: 'Password', type: 'password', table: false },
  ],
});
