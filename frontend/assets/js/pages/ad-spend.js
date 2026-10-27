Layout.init('ad-spend');
UI.crudPage({
  resource: 'ad_spend',
  title: 'Ad Spend',
  singular: 'Spend Record',
  subtitle: 'Daily spend, impressions and clicks per campaign',
  fields: [
    { key: 'campaign_id', label: 'Campaign', ref: 'campaigns', required: true },
    { key: 'spend_date', label: 'Date', type: 'date', required: true },
    { key: 'amount', label: 'Amount', type: 'number', money: true, required: true },
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
  ],
});
