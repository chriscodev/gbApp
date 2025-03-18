export function timezone() {
  const tzList = [
    { name: '(UTC+02:00) Cairo', id: 'Africa/Cairo', value: 'Egypt Time' },
    {
      name: '(UTC) Casablanca',
      id: 'Africa/Casablanca',
      value: 'Morocco Time',
    },
    {
      name: '(UTC+02:00) Harare',
      id: 'Pretoria, Africa/Johannesburg',
      value: 'South Africa Time',
    },
    {
      name: '(UTC+01:00) West Central Africa',
      id: 'Africa/Lagos',
      value: 'W. Central Africa Time',
    },
    {
      name: '(UTC+03:00) Nairobi',
      id: 'Africa/Nairobi',
      value: 'E. Africa Time',
    },
    {
      name: '(UTC+02:00) Windhoek',
      id: 'Africa/Windhoek',
      value: 'Namibia Time',
    },
    {
      name: '(UTC-09:00) Alaska',
      id: 'America/Anchorage',
      value: 'Alaskan Time',
    },
    {
      name: '(UTC-04:00) Asuncion',
      id: 'America/Asuncion',
      value: 'Paraguay Time',
    },
    {
      name: '(UTC-05:00) Bogota, Lima, Quito',
      id: 'America/Bogota',
      value: 'SA Pacific Time',
    },
    {
      name: '(UTC-03:00) Buenos Aires',
      id: 'America/Buenos_Aires',
      value: 'Argentina Time',
    },
    {
      name: '(UTC-04:30) Caracas',
      id: 'America/Caracas',
      value: 'Venezuela Time',
    },
    {
      name: '(UTC-03:00) Cayenne, Fortaleza',
      id: 'America/Cayenne',
      value: 'SA Eastern Time',
    },
    {
      name: '(UTC-05:00) Cayman Islands',
      id: 'America/Cayman',
      value: 'Eastern Time',
    },
    {
      name: '(UTC-06:00) Central Time (US & Canada)',
      id: 'America/Chicago',
      value: 'Central Time',
    },
    {
      name: '(UTC-07:00) Chihuahua, La Paz, Mazatlan',
      id: 'America/Chihuahua',
      value: 'Mountain Time (Mexico)',
    },
    {
      name: '(UTC-04:00) Cuiaba',
      id: 'America/Cuiaba',
      value: 'Central Brazilian Time',
    },
    {
      name: '(UTC-07:00) Mountain Time (US & Canada)',
      id: 'America/Denver',
      value: 'Mountain Time',
    },
    {
      name: '(UTC-03:00) Greenland',
      id: 'America/Godthab',
      value: 'Greenland Time',
    },
    {
      name: '(UTC-06:00) Central America',
      id: 'America/Guatemala',
      value: 'Central America Time',
    },
    {
      name: '(UTC-04:00) Atlantic Time (Canada)',
      id: 'America/Halifax',
      value: 'Atlantic Time',
    },
    {
      name: '(UTC-05:00) Indiana (East)',
      id: 'America/Indiana/Indianapolis',
      value: 'Eastern Time - Indiana',
    },
    {
      name: '(UTC-04:00) Georgetown, La Paz, Manaus, San Juan',
      id: 'America/La_Paz',
      value: 'SA Western Time',
    },
    {
      name: '(UTC-08:00) Pacific Time (US & Canada)',
      id: 'America/Los_Angeles',
      value: 'Pacific Time',
    },
    {
      name: '(UTC-06:00) Guadalajara, Mexico City, Monterrey',
      id: 'America/Mexico_City',
      value: 'Central Time (Mexico)',
    },
    {
      name: '(UTC-03:00) Montevideo',
      id: 'America/Montevideo',
      value: 'Montevideo Time',
    },
    {
      name: '(UTC-05:00) Eastern Time (US & Canada)',
      id: 'America/New_York',
      value: 'Eastern Time',
    },
    {
      name: '(UTC-07:00) Arizona',
      id: 'America/Phoenix',
      value: 'US Mountain Time',
    },
    {
      name: '(UTC-06:00) Saskatchewan',
      id: 'America/Regina',
      value: 'Canada Central Time',
    },
    {
      name: '(UTC-04:00) Santiago',
      id: 'America/Santiago',
      value: 'Pacific SA Time',
    },
    {
      name: '(UTC-03:00) Brasilia',
      id: 'America/Sao_Paulo',
      value: 'E. South America Time',
    },
    {
      name: '(UTC-03:30) Newfoundland',
      id: 'America/St_Johns',
      value: 'Newfoundland Time',
    },
    {
      name: '(UTC-08:00) Baja California',
      id: 'America/Tijuana',
      value: 'Pacific Time (Mexico)',
    },
    {
      name: '(UTC+06:00) Astana',
      id: 'Asia/Almaty',
      value: 'Central Asia Time',
    },
    { name: '(UTC+02:00) Amman', id: 'Asia/Amman', value: 'Jordan Time' },
    { name: '(UTC+03:00) Baghdad', id: 'Asia/Baghdad', value: 'Arabic Time' },
    {
      name: '(UTC+07:00) Bangkok, Hanoi, Jakarta',
      id: 'Asia/Bangkok',
      value: 'SE Asia Time',
    },
    {
      name: '(UTC+02:00) Beirut',
      id: 'Asia/Beirut',
      value: 'Middle East Time',
    },
    {
      name: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
      id: 'Asia/Calcutta',
      value: 'India Time',
    },
    {
      name: '(UTC+05:30) Sri Jayawardenepura',
      id: 'Asia/Colombo',
      value: 'Sri Lanka Time',
    },
    { name: '(UTC+02:00) Damascus', id: 'Asia/Damascus', value: 'Syria Time' },
    { name: '(UTC+06:00) Dhaka', id: 'Asia/Dhaka', value: 'Bangladesh Time' },
    {
      name: '(UTC+04:00) Abu Dhabi, Muscat',
      id: 'Asia/Dubai',
      value: 'Arabian Time',
    },
    {
      name: '(UTC+08:00) Irkutsk',
      id: 'Asia/Irkutsk',
      value: 'North Asia East Time',
    },
    {
      name: '(UTC+02:00) Jerusalem',
      id: 'Asia/Jerusalem',
      value: 'Israel Time',
    },
    { name: '(UTC+04:30) Kabul', id: 'Asia/Kabul', value: 'Afghanistan Time' },
    {
      name: '(UTC+12:00) Petropavlovsk-Kamchatsky - Old',
      id: 'Asia/Kamchatka',
      value: 'Kamchatka Time',
    },
    {
      name: '(UTC+05:00) Islamabad, Karachi',
      id: 'Asia/Karachi',
      value: 'Pakistan Time',
    },
    { name: '(UTC+05:45) Kathmandu', id: 'Asia/Katmandu', value: 'Nepal Time' },
    {
      name: '(UTC+07:00) Krasnoyarsk',
      id: 'Asia/Krasnoyarsk',
      value: 'North Asia Time',
    },
    { name: '(UTC+11:00) Magadan', id: 'Asia/Magadan', value: 'Magadan Time' },
    {
      name: '(UTC+06:00) Novosibirsk',
      id: 'Asia/Novosibirsk',
      value: 'N. Central Asia Time',
    },
    {
      name: '(UTC+06:30) Yangon (Rangoon)',
      id: 'Asia/Rangoon',
      value: 'Myanmar Time',
    },
    {
      name: '(UTC+03:00) Kuwait, Riyadh',
      id: 'Asia/Riyadh',
      value: 'Arab Time',
    },
    { name: '(UTC+09:00) Seoul', id: 'Asia/Seoul', value: 'Korea Time' },
    {
      name: '(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi',
      id: 'Asia/Shanghai',
      value: 'China Time',
    },
    {
      name: '(UTC+08:00) Kuala Lumpur, Singapore',
      id: 'Asia/Singapore',
      value: 'Singapore Time',
    },
    { name: '(UTC+08:00) Taipei', id: 'Asia/Taipei', value: 'Taipei Time' },
    {
      name: '(UTC+05:00) Tashkent',
      id: 'Asia/Tashkent',
      value: 'West Asia Time',
    },
    { name: '(UTC+04:00) Tbilisi', id: 'Asia/Tbilisi', value: 'Georgian Time' },
    { name: '(UTC+03:30) Tehran', id: 'Asia/Tehran', value: 'Iran Time' },
    {
      name: '(UTC+09:00) Osaka, Sapporo, Tokyo',
      id: 'Asia/Tokyo',
      value: 'Tokyo Time',
    },
    {
      name: '(UTC+08:00) Ulaanbaatar',
      id: 'Asia/Ulaanbaatar',
      value: 'Ulaanbaatar Time',
    },
    {
      name: '(UTC+10:00) Vladivostok',
      id: 'Asia/Vladivostok',
      value: 'Vladivostok Time',
    },
    { name: '(UTC+09:00) Yakutsk', id: 'Asia/Yakutsk', value: 'Yakutsk Time' },
    {
      name: '(UTC+05:00) Ekaterinburg',
      id: 'Asia/Yekaterinburg',
      value: 'Ekaterinburg Time',
    },
    { name: '(UTC+04:00) Yerevan', id: 'Asia/Yerevan', value: 'Caucasus Time' },
    { name: '(UTC-01:00) Azores', id: 'Atlantic/Azores', value: 'Azores Time' },
    {
      name: '(UTC-01:00) Cape Verde Is.',
      id: 'Atlantic/Cape_Verde',
      value: 'Cape Verde Time',
    },
    {
      name: '(UTC+00:00) Monrovia, Reykjavik',
      id: 'Atlantic/Reykjavik',
      value: 'Greenwich Time',
    },
    {
      name: '(UTC+09:30) Adelaide',
      id: 'Australia/Adelaide',
      value: 'Cen. Australia Time',
    },
    { name: '(UTC+04:00) Baku', id: 'Asia/Baku', value: 'Azerbaijan Time' },
    {
      name: '(UTC+10:00) Brisbane',
      id: 'Australia/Brisbane',
      value: 'E. Australia Time',
    },
    {
      name: '(UTC+09:30) Darwin',
      id: 'Australia/Darwin',
      value: 'AUS Central Time',
    },
    {
      name: '(UTC+10:00) Hobart',
      id: 'Australia/Hobart',
      value: 'Tasmania Time',
    },
    {
      name: '(UTC+08:00) Perth',
      id: 'Australia/Perth',
      value: 'W. Australia Time',
    },
    {
      name: '(UTC+10:00) Canberra, Melbourne, Sydney',
      id: 'Australia/Sydney',
      value: 'AUS Eastern Time',
    },
    { name: '(UTC) Coordinated Universal Time', id: 'Etc/GMT', value: 'UTC' },
    {
      name: '(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
      id: 'Europe/Berlin',
      value: 'W. Europe Time',
    },
    {
      name: '(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague',
      id: 'Europe/Budapest',
      value: 'Central Europe Time',
    },
    {
      name: '(UTC+02:00) Athens, Bucharest, Istanbul',
      id: 'Europe/Istanbul',
      value: 'GTB Time',
    },
    {
      name: '(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
      id: 'Europe/Kiev',
      value: 'FLE Time',
    },
    {
      name: '(UTC+00:00) Dublin, Edinburgh, Lisbon, London',
      id: 'Europe/London',
      value: 'UTC Time',
    },
    { name: '(UTC+02:00) Minsk', id: 'Europe/Minsk', value: 'E. Europe Time' },
    {
      name: '(UTC+03:00) Moscow, St. Petersburg, Volgograd',
      id: 'Europe/Moscow',
      value: 'Russian Time',
    },
    {
      name: '(UTC+01:00) Brussels, Copenhagen, Madrid, Paris',
      id: 'Europe/Paris',
      value: 'Romance Time',
    },
    {
      name: '(UTC+01:00) Sarajevo, Skopje, Warsaw',
      id: 'Zagreb Europe/Warsaw',
      value: 'Central European Time',
    },
    {
      name: '(UTC+04:00) Port Louis',
      id: 'Indian/Mauritius',
      value: 'Mauritius Time',
    },
    { name: '(UTC-11:00) Samoa', id: 'Pacific/Apia', value: 'Samoa Time' },
    {
      name: '(UTC+12:00) Auckland, Wellington',
      id: 'Pacific/Auckland',
      value: 'New Zealand Time',
    },
    {
      name: '(UTC+12:00) Fiji, Marshall Is.',
      id: 'Pacific/Fiji',
      value: 'Fiji Time',
    },
    {
      name: '(UTC+11:00) Solomon Is., New Caledonia',
      id: 'Pacific/Guadalcanal',
      value: 'Central Pacific Time',
    },
    {
      name: '(UTC-10:00) Hawaii',
      id: 'Pacific/Honolulu',
      value: 'Hawaiian Time',
    },
    {
      name: '(UTC+10:00) Guam, Port Moresby',
      id: 'Pacific/Port_Moresby',
      value: 'West Pacific Time',
    },
    {
      name: '(UTC+13:00) Nuku\'alofa',
      id: 'Pacific/Tongatapu',
      value: 'Tonga Time',
    },
  ];

  tzList.sort((a, b) => (a.name !== b.name ? (a.name > b.name ? -1 : 1) : 0));
  const timeZoneDefault: any = {};
  timeZoneDefault.id = 'Select Time Zone';
  timeZoneDefault.name = 'Select Time Zone';
  timeZoneDefault.value = 'Select Time Zone';
  tzList.unshift(timeZoneDefault);
  return tzList;
}
