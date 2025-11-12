// Input validation constants
export const INPUT_LIMITS = {
  MAX_LENGTH: 5000, // Increased to handle longer descriptions
  MIN_LENGTH: 3, // Reduced to allow very short descriptions (e.g., "user data", "API response")
  NEAR_LIMIT_THRESHOLD: 0.9, // 90% of max length
} as const;

export const DEFAULT_INPUT_TEXT =
  'A customer order system containing order ID 2847392, customer ID 89234, timestamp 2025-01-15T14:32:18Z, status pending, shipping address with street 123 Commerce Blvd, city San Francisco, state CA, zip 94105, country US, billing address matching shipping, payment method credit card ending 4532, items array with product SKU PROD-7821-A, name Wireless Headphones Pro, quantity 2, unit price 89.99, discount 10%, tax rate 8.5%, SKU PROD-3456-B, name USB-C Cable Pack, quantity 1, unit price 24.99, discount 0%, tax rate 8.5%, subtotal 204.97, total discount 8.50, tax 16.70, shipping cost 9.99, order total 223.16, currency USD, loyalty points earned 223, estimated delivery 2025-01-22, tracking number null, notes gift wrap requested, special instructions leave at front door';
