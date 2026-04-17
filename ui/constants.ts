export type ProductCategory =
  | 'phone'
  | 'laptop'
  | 'tablet'
  | 'smartwatch'
  | 'earbuds'
  | 'tv'
  | 'camera'
  | 'monitor'
  | 'speaker'
  | 'console'
  | 'desktop'
  | 'headphones'
  | 'gpu'
  | 'router';

export const categories: ProductCategory[] = [
  'phone',
  'laptop',
  'tablet',
  'smartwatch',
  'earbuds',
  'headphones',
  'tv',
  'camera',
  'monitor',
  'desktop',
  'gpu',
  'router',
  'speaker',
  'console',
];

export const categoryLabels: Record<ProductCategory, string> = {
  phone: 'Phone',
  laptop: 'Laptop',
  tablet: 'Tablet',
  smartwatch: 'Smartwatch',
  earbuds: 'Earbuds',
  tv: 'TV',
  camera: 'Camera',
  monitor: 'Monitor',
  speaker: 'Speaker',
  console: 'Console',
  desktop: 'Desktop PC',
  headphones: 'Headphones',
  gpu: 'Graphics Card',
  router: 'Wi-Fi Router',
};

const MOBILE_RAM_OPTIONS = ['4GB', '6GB', '8GB', '12GB', '16GB'];
const MOBILE_STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];

const LAPTOP_RAM_OPTIONS = ['8GB', '16GB', '32GB', '64GB'];
const LAPTOP_STORAGE_OPTIONS = ['256GB', '512GB', '1TB', '2TB'];

const TV_RAM_OPTIONS = ['2GB', '3GB', '4GB', '8GB'];
const TV_STORAGE_OPTIONS = ['8GB', '16GB', '32GB', '64GB'];

const CAMERA_RAM_OPTIONS = ['N/A'];
const CAMERA_STORAGE_OPTIONS = ['32GB', '64GB', '128GB', '256GB', 'N/A'];

const AUDIO_RAM_OPTIONS = ['N/A'];
const AUDIO_STORAGE_OPTIONS = ['N/A'];

const MONITOR_RAM_OPTIONS = ['N/A'];
const MONITOR_STORAGE_OPTIONS = ['N/A'];

const CONSOLE_RAM_OPTIONS = ['8GB', '10GB', '16GB'];
const CONSOLE_STORAGE_OPTIONS = ['512GB', '1TB', '2TB'];

const DEFAULT_BRANDS: Record<ProductCategory, string[]> = {
  phone: ['Samsung', 'Motorola', 'iQOO', 'Nothing', 'Xiaomi', 'OnePlus', 'Vivo', 'Realme', 'OPPO', 'Apple'],
  laptop: ['ASUS', 'Lenovo', 'HP', 'Dell', 'Acer', 'MSI', 'Apple', 'Samsung', 'Xiaomi'],
  tablet: ['Apple', 'Samsung', 'Xiaomi', 'Lenovo', 'OnePlus', 'Realme'],
  smartwatch: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Noise', 'boAt', 'Realme'],
  earbuds: ['Apple', 'Samsung', 'OnePlus', 'Sony', 'JBL', 'boAt', 'Nothing'],
  tv: ['Samsung', 'LG', 'Sony', 'Xiaomi', 'OnePlus', 'Realme'],
  camera: ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Panasonic'],
  monitor: ['Samsung', 'LG', 'ASUS', 'Dell', 'Acer', 'MSI', 'Lenovo'],
  speaker: ['JBL', 'Sony', 'boAt', 'Bose', 'Marshall', 'LG'],
  console: ['Sony', 'Microsoft', 'Nintendo'],
  desktop: ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS', 'MSI'],
  headphones: ['Sony', 'Sennheiser', 'Bose', 'Apple', 'Audio-Technica'],
  gpu: ['NVIDIA', 'AMD', 'ASUS', 'MSI', 'Gigabyte', 'Zotac'],
  router: ['ASUS', 'TP-Link', 'Netgear', 'Linksys'],
};

export function getRamOptions(category: ProductCategory) {
  if (category === 'laptop' || category === 'desktop') return LAPTOP_RAM_OPTIONS;
  if (category === 'tv') return TV_RAM_OPTIONS;
  if (category === 'camera') return CAMERA_RAM_OPTIONS;
  if (category === 'monitor' || category === 'gpu' || category === 'router') return MONITOR_RAM_OPTIONS;
  if (category === 'console') return CONSOLE_RAM_OPTIONS;
  if (category === 'earbuds' || category === 'speaker' || category === 'headphones') return AUDIO_RAM_OPTIONS;
  return MOBILE_RAM_OPTIONS;
}

export function getStorageOptions(category: ProductCategory) {
  if (category === 'laptop' || category === 'desktop') return LAPTOP_STORAGE_OPTIONS;
  if (category === 'tv') return TV_STORAGE_OPTIONS;
  if (category === 'camera') return CAMERA_STORAGE_OPTIONS;
  if (category === 'monitor' || category === 'gpu' || category === 'router') return MONITOR_STORAGE_OPTIONS;
  if (category === 'console') return CONSOLE_STORAGE_OPTIONS;
  if (category === 'earbuds' || category === 'speaker' || category === 'headphones') return AUDIO_STORAGE_OPTIONS;
  return MOBILE_STORAGE_OPTIONS;
}

export function getDefaultBrands(category: ProductCategory) {
  return DEFAULT_BRANDS[category];
}

export function isMobileCategory(category: ProductCategory) {
  return category === 'phone' || category === 'tablet' || category === 'smartwatch';
}
