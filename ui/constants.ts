export type ProductCategory = 'phone' | 'laptop' | 'tablet';

export const categories: ProductCategory[] = ['phone', 'laptop', 'tablet'];

export const categoryLabels: Record<ProductCategory, string> = {
  phone: 'Phone',
  laptop: 'Laptop',
  tablet: 'Tablet',
};

// ── Phone options ──────────────────────────────────────────────────────
export const ramOptions = ['4GB', '6GB', '8GB', '12GB', '16GB'];
export const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
export const defaultBrands = ['Samsung', 'Motorola', 'iQOO', 'Nothing', 'Xiaomi', 'OnePlus', 'Vivo', 'Realme', 'OPPO', 'Apple'];

// ── Laptop options ─────────────────────────────────────────────────────
export const laptopRamOptions = ['8GB', '16GB', '32GB', '64GB'];
export const laptopStorageOptions = ['256GB', '512GB', '1TB', '2TB'];
export const defaultLaptopBrands = ['ASUS', 'Lenovo', 'HP', 'Dell', 'Acer', 'MSI', 'Apple', 'Samsung', 'Xiaomi'];

// ── Tablet options ─────────────────────────────────────────────────────
export const tabletRamOptions = ['4GB', '6GB', '8GB', '12GB', '16GB'];
export const tabletStorageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
export const defaultTabletBrands = ['Apple', 'Samsung', 'Xiaomi', 'Lenovo', 'OnePlus', 'Realme'];

// ── Helpers ────────────────────────────────────────────────────────────
export function getRamOptions(category: ProductCategory) {
  if (category === 'laptop') return laptopRamOptions;
  if (category === 'tablet') return tabletRamOptions;
  return ramOptions;
}

export function getStorageOptions(category: ProductCategory) {
  if (category === 'laptop') return laptopStorageOptions;
  if (category === 'tablet') return tabletStorageOptions;
  return storageOptions;
}

export function getDefaultBrands(category: ProductCategory) {
  if (category === 'laptop') return defaultLaptopBrands;
  if (category === 'tablet') return defaultTabletBrands;
  return defaultBrands;
}
