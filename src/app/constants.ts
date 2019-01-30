import { Injectable } from '@angular/core';

@Injectable()
export class CONSTANTS {
  // BASE_URL: string = 'http://www.simpleinvoiceweb.com/invoice_backend/rest/v1/';
  BASE_URL: string = 'http://206.189.130.217/invoice_backend/rest/v1/';
  // BASE_URL: string = 'http://192.168.0.19/invoice_backend/rest/v1/';

  COUNTRIES: Array<{
    id: number,
    currencyCode: string,
    currencyName: string,
    countryName: string
  }> = [
    {
      id: 1,
      currencyCode: '$',
      currencyName: 'USD',
      countryName: 'United States'
    },
    {
      id: 2,
      currencyCode: '£',
      currencyName: 'GBP',
      countryName: 'United Kingdom'
    },
    {
      id: 3,
      currencyCode: '¥',
      currencyName: 'CNY',
      countryName: 'China'
    },
    {
      id: 4,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Euro Member'
    },
    {
      id: 5,
      currencyCode: '₹',
      currencyName: 'INR',
      countryName: 'India'
    },
    {
      id: 6,
      currencyCode: '¢',
      currencyName: 'GHC',
      countryName: 'Ghana'
    },
    {
      id: 7,
      currencyCode: '\u0e3f',
      currencyName: 'THB',
      countryName: 'Thailand'
    },
    {
      id: 8,
      currencyCode: '\u20a9',
      currencyName: 'KPW',
      countryName: 'Korea'
    },
    {
      id: 9,
      currencyCode: '\u20AD',
      currencyName: 'LAK',
      countryName: 'Laos'
    },
    {
      id: 10,
      currencyCode: 'L',
      currencyName: 'ALL',
      countryName: 'Albania'
    },
    {
      id: 11,
      currencyCode: '؋',
      currencyName: 'AFN',
      countryName: 'Afghanistan'
    },
    {
      id: 12,
      currencyCode: '$',
      currencyName: 'ARS',
      countryName: 'Argentina'
    },
    {
      id: 13,
      currencyCode: 'ƒ',
      currencyName: 'AWG',
      countryName: 'Aruba'
    },
    {
      id: 14,
      currencyCode: '$',
      currencyName: 'AUD',
      countryName: 'Australia'
    },
    {
      id: 15,
      currencyCode: '$',
      currencyName: 'BSD',
      countryName: 'Bahamas'
    },
    {
      id: 16,
      currencyCode: '$',
      currencyName: 'BBD',
      countryName: 'Barbados'
    },
    {
      id: 17,
      currencyCode: 'p',
      currencyName: 'BYR',
      countryName: 'Belarus'
    },
    {
      id: 18,
      currencyCode: 'p',
      currencyName: 'BZD',
      countryName: 'Belize'
    },
    {
      id: 19,
      currencyCode: '$',
      currencyName: 'BMD',
      countryName: 'Bermuda'
    },
    {
      id: 20,
      currencyCode: '$',
      currencyName: 'BOB',
      countryName: 'Bolivia'
    },
    {
      id: 21,
      currencyCode: 'K',
      currencyName: 'BAM',
      countryName: 'Bosnia and Herzegovina'
    },
    {
      id: 22,
      currencyCode: 'лв',
      currencyName: 'BGN',
      countryName: 'Bulgaria'
    },
    {
      id: 23,
      currencyCode: 'R$',
      currencyName: 'BRL',
      countryName: 'Brazil'
    },
    {
      id: 24,
      currencyCode: '$',
      currencyName: 'BND',
      countryName: 'Brunei'
    },
    {
      id: 25,
      currencyCode: '\u17db',
      currencyName: 'KHR',
      countryName: 'Cambodia'
    },
    {
      id: 26,
      currencyCode: '$',
      currencyName: 'CAD',
      countryName: 'Canada'
    },
    {
      id: 27,
      currencyCode: '$',
      currencyName: 'KYD',
      countryName: 'Cayman'
    },
    {
      id: 28,
      currencyCode: '$',
      currencyName: 'CLP',
      countryName: 'Chile'
    },
    {
      id: 29,
      currencyCode: '$',
      currencyName: 'COP',
      countryName: 'Colombia'
    },
    {
      id: 30,
      currencyCode: '\u20a1',
      currencyName: 'CRC',
      countryName: 'Costa Rica'
    },
    {
      id: 31,
      currencyCode: '\u20b1',
      currencyName: 'CUP',
      countryName: 'Cuba'
    },
    {
      id: 32,
      currencyCode: '\u006b',
      currencyName: 'DKK',
      countryName: 'Denmark'
    },
    {
      id: 33,
      currencyCode: 'R',
      currencyName: 'DOP',
      countryName: 'Dominican Republic'
    },
    {
      id: 34,
      currencyCode: '£',
      currencyName: 'EGP',
      countryName: 'Egypt'
    },
    {
      id: 35,
      currencyCode: '$',
      currencyName: 'SVC',
      countryName: 'El Salvador'
    },
    {
      id: 36,
      currencyCode: '£',
      currencyName: 'FKP',
      countryName: 'Falkland Islands'
    },
    {
      id: 37,
      currencyCode: '$',
      currencyName: 'FJD',
      countryName: 'Fiji'
    },
    {
      id: 38,
      currencyCode: '\u20be',
      currencyName: 'GEL',
      countryName: 'Georgia'
    },
    {
      id: 39,
      currencyCode: '£',
      currencyName: 'GIP',
      countryName: 'Gibraltar'
    },
    {
      id: 40,
      currencyCode: 'Q',
      currencyName: 'GTQ',
      countryName: 'Guatemala'
    },
    {
      id: 41,
      currencyCode: '£',
      currencyName: 'GGP',
      countryName: 'Guernsey'
    },
    {
      id: 42,
      currencyCode: '$',
      currencyName: 'GYD',
      countryName: 'Guyana'
    },
    {
      id: 43,
      currencyCode: 'L',
      currencyName: 'HNL',
      countryName: 'Honduras'
    },
    {
      id: 44,
      currencyCode: '$',
      currencyName: 'HKD',
      countryName: 'Hong Kong'
    },
    {
      id: 45,
      currencyCode: 'F',
      currencyName: 'HUF',
      countryName: 'Hungary'
    },
    {
      id: 46,
      currencyCode: 'kr',
      currencyName: 'ISK',
      countryName: 'Iceland'
    },
    {
      id: 47,
      currencyCode: 'Rp',
      currencyName: 'IDR',
      countryName: 'Indonesia'
    },
    {
      id: 48,
      currencyCode: '\ufdfc',
      currencyName: 'IRR',
      countryName: 'Iran'
    },
    {
      id: 49,
      currencyCode: '£',
      currencyName: 'IMP',
      countryName: 'Isle of Man'
    },
    {
      id: 50,
      currencyCode: '\u20aa',
      currencyName: 'ILS',
      countryName: 'Israel'
    },
    {
      id: 51,
      currencyCode: 'J',
      currencyName: 'JMD',
      countryName: 'Jamaica'
    },
    {
      id: 52,
      currencyCode: '¥',
      currencyName: 'JPY',
      countryName: 'Japan'
    },
    {
      id: 53,
      currencyCode: '£',
      currencyName: 'JEP',
      countryName: 'Jersey'
    },
    {
      id: 54,
      currencyCode: '\u043b',
      currencyName: 'KZT',
      countryName: 'Kazakhstan'
    },
    {
      id: 55,
      currencyCode: '\u0432',
      currencyName: 'KGS',
      countryName: 'Kyrgyzstan'
    },
    {
      id: 56,
      currencyCode: 'L',
      currencyName: 'LVL',
      countryName: 'Latvia'
    },
    {
      id: 57,
      currencyCode: '£',
      currencyName: 'LBP',
      countryName: 'Lebanon'
    },
    {
      id: 58,
      currencyCode: '$',
      currencyName: 'LRD',
      countryName: 'Liberia'
    },
    {
      id: 59,
      currencyCode: 'L',
      currencyName: 'LTL',
      countryName: 'Lithuania'
    },
    {
      id: 60,
      currencyCode: '\u0434',
      currencyName: 'MKD',
      countryName: 'Macedonia'
    },
    {
      id: 61,
      currencyCode: 'RM',
      currencyName: 'MYR',
      countryName: 'Malaysia'
    },
    {
      id: 62,
      currencyCode: '\u20a8',
      currencyName: 'MUR',
      countryName: 'Mauritius'
    },
    {
      id: 63,
      currencyCode: '$',
      currencyName: 'MXN',
      countryName: 'Mexico'
    },
    {
      id: 64,
      currencyCode: '\u20ae',
      currencyName: 'MNT',
      countryName: 'Mongolia'
    },
    {
      id: 65,
      currencyCode: 'M',
      currencyName: 'MZN',
      countryName: 'Mozambique'
    },
    {
      id: 66,
      currencyCode: '$',
      currencyName: 'NAD',
      countryName: 'Namibia'
    },
    {
      id: 67,
      currencyCode: '\u20a8',
      currencyName: 'NPR',
      countryName: 'Nepal'
    },
    {
      id: 68,
      currencyCode: 'ƒ',
      currencyName: 'ANG',
      countryName: 'Netherlands'
    },
    {
      id: 69,
      currencyCode: '$',
      currencyName: 'NZD',
      countryName: 'New Zealand'
    },
    {
      id: 70,
      currencyCode: 'C',
      currencyName: 'NIO',
      countryName: 'Nicaragua'
    },
    {
      id: 71,
      currencyCode: '\u20a6',
      currencyName: 'NGN',
      countryName: 'Nigeria'
    },
    {
      id: 72,
      currencyCode: 'k',
      currencyName: 'NOK',
      countryName: 'Norway'
    },
    {
      id: 73,
      currencyCode: '\ufdfc',
      currencyName: 'Oman',
      countryName: 'Oman'
    },
    {
      id: 74,
      currencyCode: '\u20a8',
      currencyName: 'PKR',
      countryName: 'Pakistan'
    },
    {
      id: 75,
      currencyCode: 'B',
      currencyName: 'PAB',
      countryName: 'Panama'
    },
    {
      id: 76,
      currencyCode: 'G',
      currencyName: 'PYG',
      countryName: 'Paraguay'
    },
    {
      id: 77,
      currencyCode: 'S',
      currencyName: 'PEN',
      countryName: 'Peru'
    },
    {
      id: 78,
      currencyCode: '\u20b1',
      currencyName: 'PHP',
      countryName: 'Philippines'
    },
    {
      id: 79,
      currencyCode: 'z',
      currencyName: 'PLN',
      countryName: 'Poland'
    },
    {
      id: 80,
      currencyCode: '\ufdfc',
      currencyName: 'QAR',
      countryName: 'Qatar'
    },
    {
      id: 81,
      currencyCode: 'l',
      currencyName: 'RON',
      countryName: 'Romania'
    },
    {
      id: 82,
      currencyCode: '\u20bd',
      currencyName: 'RUB',
      countryName: 'Russia'
    },
    {
      id: 83,
      currencyCode: '\ufdfc',
      currencyName: 'SAR',
      countryName: 'Saudi Arabia'
    },
    {
      id: 84,
      currencyCode: '\u0414',
      currencyName: 'RSD',
      countryName: 'Serbia'
    },
    {
      id: 85,
      currencyCode: '\u20a8',
      currencyName: 'SCR',
      countryName: 'Seychelles'
    },
    {
      id: 86,
      currencyCode: '$',
      currencyName: 'SGD',
      countryName: 'Singapore'
    },
    {
      id: 87,
      currencyCode: '$',
      currencyName: 'SBD',
      countryName: 'Solomon Islands'
    },
    {
      id: 88,
      currencyCode: '$',
      currencyName: 'SOS',
      countryName: 'Somalia'
    },
    {
      id: 89,
      currencyCode: 'R',
      currencyName: 'ZAR',
      countryName: 'South Africa'
    },
    {
      id: 90,
      currencyCode: '\u20a8',
      currencyName: 'LKR',
      countryName: 'Sri Lanka'
    },
    {
      id: 91,
      currencyCode: 'k',
      currencyName: 'SEK',
      countryName: 'Sweden'
    },
    {
      id: 92,
      currencyCode: 'Fr',
      currencyName: 'CHF',
      countryName: 'Switzerland'
    },
    {
      id: 93,
      currencyCode: '$',
      currencyName: 'SRD',
      countryName: 'Suriname'
    },
    {
      id: 94,
      currencyCode: '£',
      currencyName: 'SYP',
      countryName: 'Syria'
    },
    {
      id: 95,
      currencyCode: 'N',
      currencyName: 'TWD',
      countryName: 'Taiwan'
    },
    {
      id: 96,
      currencyCode: 'T',
      currencyName: 'TTD',
      countryName: 'Trinidad and Tobago'
    },
    {
      id: 97,
      currencyCode: '\u20ba',
      currencyName: 'TRL',
      countryName: 'Turkey'
    },
    {
      id: 98,
      currencyCode: '$',
      currencyName: 'TVD',
      countryName: 'Tuvalu'
    },
    {
      id: 99,
      currencyCode: '\u20b4',
      currencyName: 'UAH',
      countryName: 'Ukraine'
    },
    {
      id: 100,
      currencyCode: '$',
      currencyName: 'UYU',
      countryName: 'Uruguay'
    },
    {
      id: 101,
      currencyCode: '\u043b',
      currencyName: 'UZS',
      countryName: 'Uzbekistan'
    },
    {
      id: 102,
      currencyCode: 'B',
      currencyName: 'VEF',
      countryName: 'Venezuela'
    },
    {
      id: 103,
      currencyCode: '\u20ab',
      currencyName: 'VND',
      countryName: 'Viet Nam'
    },
    {
      id: 104,
      currencyCode: '\ufdfc',
      currencyName: 'YER',
      countryName: 'Yemen'
    },
    {
      id: 105,
      currencyCode: '$',
      currencyName: 'ZWD',
      countryName: 'Zimbabwe'
    },
    {
      id: 106,
      currencyCode: '\u0012',
      currencyName: 'DZD',
      countryName: 'Algeria'
    },
    {
      id: 107,
      currencyCode: 'H',
      currencyName: 'BHD',
      countryName: 'Bahrain'
    },
    {
      id: 108,
      currencyCode: '\u0368',
      currencyName: 'IQD',
      countryName: 'Iraq'
    },
    {
      id: 109,
      currencyCode: '\u0400',
      currencyName: 'JOD',
      countryName: 'Jordan'
    },
    {
      id: 110,
      currencyCode: '\u0414',
      currencyName: 'KWD',
      countryName: 'Kuwait'
    },
    {
      id: 111,
      currencyCode: '\u0422',
      currencyName: 'LBP',
      countryName: 'Lebanon'
    },
    {
      id: 112,
      currencyCode: '\u0478',
      currencyName: 'MOR',
      countryName: 'Mauritania'
    },
    {
      id: 113,
      currencyCode: '\u0504',
      currencyName: 'MAD',
      countryName: 'Morocco'
    },
    {
      id: 114,
      currencyCode: '\u0938',
      currencyName: 'SDG',
      countryName: 'Sudan'
    },
    {
      id: 115,
      currencyCode: 'T',
      currencyName: 'TND',
      countryName: 'Tunisia'
    },
    {
      id: 116,
      currencyCode: '\u0625',
      currencyName: 'AED',
      countryName: 'United Arab Emirates'
    },
    {
      id: 117,
      currencyCode: 'KSh',
      currencyName: 'KES',
      countryName: 'Kenya'
    },
    {
      id: 118,
      currencyCode: 'kz',
      currencyName: 'AOA',
      countryName: 'Angola'
    },
    {
      id: 119,
      currencyCode: '\u20BC',
      currencyName: 'AZN',
      countryName: 'Azerbaijan'
    },
    {
      id: 120,
      currencyCode: 'Fr',
      currencyName: 'XAF',
      countryName: 'Central Africa'
    },
    {
      id: 121,
      currencyCode: 'USh',
      currencyName: 'UGX',
      countryName: 'Uganda'
    },
    {
      id: 122,
      currencyCode: 'Zk',
      currencyName: 'ZMK',
      countryName: 'Zambia'
    },
    {
      id: 123,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Portugal'
    },
    {
      id: 124,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Germany'
    },
    {
      id: 125,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'France'
    },
    {
      id: 126,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Italy'
    },
    {
      id: 127,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Luxembourg'
    },
    {
      id: 128,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Austria'
    },
    {
      id: 129,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Belgium'
    },
    {
      id: 130,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Cyprus'
    },
    {
      id: 131,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Spain'
    },
    {
      id: 132,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Slovakia'
    },
    {
      id: 133,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Slovenia'
    },
    {
      id: 134,
      currencyCode: '$',
      currencyName: 'XCD',
      countryName: 'Anguilla'
    },
    {
      id: 135,
      currencyCode: '$',
      currencyName: 'USD',
      countryName: 'Bonaire'
    },
    {
      id: 136,
      currencyCode: '$',
      currencyName: 'AUD',
      countryName: 'Cocos (Keeling) Islands'
    },
    {
      id: 137,
      currencyCode: '$',
      currencyName: 'XCD',
      countryName: 'Dominica'
    },
    {
      id: 138,
      currencyCode: '$',
      currencyName: 'USD',
      countryName: 'East Timor'
    },
    {
      id: 139,
      currencyCode: '$',
      currencyName: 'XCD',
      countryName: 'Grenada'
    },
    {
      id: 140,
      currencyCode: '$',
      currencyName: 'AUD',
      countryName: 'Kiribati'
    },
    {
      id: 141,
      currencyCode: '$',
      currencyName: 'USD',
      countryName: 'Marshall Islands'
    },
    {
      id: 142,
      currencyCode: '$',
      currencyName: '',
      countryName: 'Micronesia'
    },
    {
      id: 143,
      currencyCode: '$',
      currencyName: 'XCD',
      countryName: 'Montserrat'
    },
    {
      id: 144,
      currencyCode: '$',
      currencyName: 'USD',
      countryName: 'Saba'
    },
    {
      id: 145,
      currencyCode: '$',
      currencyName: 'XCD',
      countryName: 'Saint Kitts and Nevis'
    },
    {
      id: 146,
      currencyCode: '$',
      currencyName: 'XCD',
      countryName: 'Saint Lucia'
    },
    {
      id: 147,
      currencyCode: '$',
      currencyName: 'XCD',
      countryName: 'Saint Lucia'
    },
    {
      id: 148,
      currencyCode: '$',
      currencyName: 'XCD',
      countryName: 'Saint Vincent and the Grenadines'
    },
    {
      id: 149,
      currencyCode: '$',
      currencyName: 'USD',
      countryName: 'Sint Eustatius'
    },
    {
      id: 150,
      currencyCode: '$',
      currencyName: 'USD',
      countryName: 'Turks and Caicos Islands'
    },
    {
      id: 151,
      currencyCode: '£',
      currencyName: 'SHP',
      countryName: 'Saint Helena'
    },
    {
      id: 152,
      currencyCode: '£',
      currencyName: 'GBP',
      countryName: 'South Georgia and the South Sandwich Islands'
    },
    {
      id: 153,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Vatican City'
    },
    {
      id: 154,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Akrotiri and Dhekelia'
    },
    {
      id: 155,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Andorra'
    },
    {
      id: 156,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Estonia'
    },
    {
      id: 157,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Finland'
    },
    {
      id: 158,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Greece'
    },
    {
      id: 159,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Ireland'
    },
    {
      id: 160,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Kosovo'
    },
    {
      id: 161,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Malta'
    },
    {
      id: 162,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Monaco'
    },
    {
      id: 163,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'Montenegro'
    },
    {
      id: 164,
      currencyCode: '€',
      currencyName: 'EUR',
      countryName: 'San Marino'
    },
    {
      id: 165,
      currencyCode: 'Fr',
      currencyName: 'XOF',
      countryName: 'Benin'
    },
    {
      id: 166,
      currencyCode: 'Fr',
      currencyName: 'XOF',
      countryName: 'Burkina Faso'
    },
    {
      id: 167,
      currencyCode: 'Fr',
      currencyName: 'BIF',
      countryName: 'Burundi'
    },
    {
      id: 168,
      currencyCode: 'Fr',
      currencyName: 'XAF',
      countryName: 'Cameroon'
    },
    {
      id: 169,
      currencyCode: 'Fr',
      currencyName: 'XAF',
      countryName: 'Central African Republic'
    },
    {
      id: 170,
      currencyCode: 'Fr',
      currencyName: 'XAF',
      countryName: 'Central African Republic'
    },
    {
      id: 171,
      currencyCode: 'Fr',
      currencyName: 'XAF',
      countryName: 'Chad'
    },
    {
      id: 172,
      currencyCode: 'Fr',
      currencyName: 'KMF',
      countryName: 'Comoros'
    },
    {
      id: 173,
      currencyCode: 'Fr',
      currencyName: 'XOF',
      countryName: 'Côte d\'Ivoire'
    },
    {
      id: 174,
      currencyCode: 'Fr',
      currencyName: 'DJF',
      countryName: 'Djibouti'
    },
    {
      id: 175,
      currencyCode: 'Fr',
      currencyName: 'XAF',
      countryName: 'Equatorial Guinea'
    },
    {
      id: 176,
      currencyCode: 'Fr',
      currencyName: 'XPF',
      countryName: 'French Polynesia'
    },
    {
      id: 177,
      currencyCode: 'Fr',
      currencyName: 'XAF',
      countryName: 'Gabon'
    },
    {
      id: 178,
      currencyCode: 'Fr',
      currencyName: 'GNF',
      countryName: 'Guinea'
    },
    {
      id: 179,
      currencyCode: 'Fr',
      currencyName: 'XOF',
      countryName: 'Guinea-Bissau'
    },
    {
      id: 180,
      currencyCode: 'Fr',
      currencyName: 'CHF',
      countryName: 'Liechtenstein'
    },
    {
      id: 181,
      currencyCode: 'Fr',
      currencyName: 'XOF',
      countryName: 'Mali'
    },
    {
      id: 182,
      currencyCode: 'Fr',
      currencyName: 'XPF',
      countryName: 'New Caledonia'
    },
    {
      id: 183,
      currencyCode: 'Fr',
      currencyName: 'XOF',
      countryName: 'Niger'
    },
    {
      id: 184,
      currencyCode: 'Fr',
      currencyName: 'RWF',
      countryName: 'Rwanda'
    },
    {
      id: 185,
      currencyCode: 'Fr',
      currencyName: 'XOF',
      countryName: 'Senegal'
    },
    {
      id: 186,
      currencyCode: 'Fr',
      currencyName: 'XOF',
      countryName: 'Togo'
    },
    {
      id: 187,
      currencyCode: 'Fr',
      currencyName: 'XPF',
      countryName: 'Wallis and Futuna'
    },
    {
      id: 188,
      currencyCode: 'kn',
      currencyName: 'HRK',
      countryName: 'Croatia'
    },
    {
      id: 189,
      currencyCode: 'Nfk',
      currencyName: 'ERN',
      countryName: 'Eritrea'
    },
    {
      id: 190,
      currencyCode: 'Br',
      currencyName: 'ETB',
      countryName: 'Ethiopia'
    },
    {
      id: 191,
      currencyCode: 'G',
      currencyName: 'HTG',
      countryName: 'Haiti'
    },
    {
      id: 192,
      currencyCode: 'L',
      currencyName: 'LSL',
      countryName: 'Lesotho'
    },
    {
      id: 193,
      currencyCode: 'P',
      currencyName: 'MOP',
      countryName: 'Macau'
    },
    {
      id: 194,
      currencyCode: 'Ar',
      currencyName: 'MGA',
      countryName: 'Madagascar'
    },
    {
      id: 195,
      currencyCode: 'MK',
      currencyName: 'MWK',
      countryName: 'Malawi'
    },
    {
      id: 196,
      currencyCode: 'L',
      currencyName: 'MDL',
      countryName: 'Moldova'
    },
    {
      id: 197,
      currencyCode: 'Ks',
      currencyName: 'MMK',
      countryName: 'Myanmar'
    },
    {
      id: 198,
      currencyCode: 'K',
      currencyName: 'PGK',
      countryName: 'Papua New Guinea'
    },
    {
      id: 199,
      currencyCode: 'T',
      currencyName: 'WST',
      countryName: 'Samoa'
    },
    {
      id: 200,
      currencyCode: 'Db',
      currencyName: 'STD',
      countryName: 'São Tomé and Príncipe'
    },
    {
      id: 201,
      currencyCode: 'Le',
      currencyName: 'SLL',
      countryName: 'Sierra Leone'
    },
    {
      id: 202,
      currencyCode: 'SI',
      currencyName: '',
      countryName: 'Somaliland'
    },
    {
      id: 203,
      currencyCode: 'L',
      currencyName: 'SZL',
      countryName: 'Swaziland'
    },
    {
      id: 204,
      currencyCode: 'ЅМ',
      currencyName: 'TJS',
      countryName: 'Tajikistan'
    },
    {
      id: 205,
      currencyCode: 'Sh',
      currencyName: 'TZS',
      countryName: 'Tanzania'
    },
    {
      id: 206,
      currencyCode: 'm',
      currencyName: 'TMT',
      countryName: 'Turkmenistan'
    },
    {
      id: 207,
      currencyCode: 'Vt',
      currencyName: 'VUV',
      countryName: 'Vanuatu'
    }
  ]
}