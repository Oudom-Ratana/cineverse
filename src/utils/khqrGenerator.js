/**
 * KHQR (Bakong National QR Code) & ABA PayWay Standard Generator
 * Generates official EMVCo-compliant KHQR payload strings for Cambodian digital banking
 * (ABA Mobile, Acleda toanChet, Wing, Canadia, Sathapana, etc.)
 */

// Exchange rate default: 1 USD = 4,100 KHR
export const USD_TO_KHR_RATE = 4100;

/**
 * Calculates CRC-16 (CCITT-False / 0x1021) checksum required by EMVCo / Bakong standard
 */
function calculateCRC16(data) {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Formats a Tag-Length-Value (TLV) EMV chunk
 */
function tlv(tag, value) {
  if (value === undefined || value === null || value === "") return "";
  const strVal = String(value);
  const len = String(strVal.length).padStart(2, "0");
  return `${tag}${len}${strVal}`;
}

/**
 * Generates an EMVCo-compliant KHQR dynamic string
 * @param {Object} options
 * @param {number} options.amount - Payment amount (in USD or KHR)
 * @param {'USD'|'KHR'} options.currency - Currency code
 * @param {string} options.bakongAccount - Bakong account identifier (e.g., ciniverse@abaa or phone)
 * @param {string} options.merchantName - Store / Merchant display name
 * @param {string} options.merchantCity - Merchant City
 * @param {string} options.bookingRef - Unique booking reference / invoice number
 * @param {string} options.branchName - Cinema branch
 * @returns {string} Fully validated KHQR string with CRC16
 */
export function generateKHQRString({
  amount = 0,
  currency = "USD",
  bakongAccount = "ciniverse@abaa",
  merchantName = "CINIVERSE CINEMA",
  merchantCity = "Phnom Penh",
  bookingRef = "FZ-1001",
  branchName = "SenSok Branch",
}) {
  const isUSD = currency.toUpperCase() === "USD";
  const currencyCode = isUSD ? "840" : "116";
  const formattedAmount = isUSD ? Number(amount).toFixed(2) : Math.round(Number(amount)).toString();

  // Tag 29: Merchant Account Information (Bakong Sub-TLVs)
  // Sub-tag 00: Bakong Account ID / Merchant ID
  // Sub-tag 01: Acquiring Bank / Identifier
  // Sub-tag 02: Branch / Terminal Identifier
  const subTag00 = tlv("00", bakongAccount);
  const subTag01 = tlv("01", "CINIVERSE_KH");
  const subTag02 = tlv("02", branchName);
  const tag29Value = `${subTag00}${subTag01}${subTag02}`;

  // Tag 62: Additional Data Template (Sub-TLVs)
  // Sub-tag 01: Bill / Booking Number
  // Sub-tag 07: Terminal ID
  const subTag62_01 = tlv("01", bookingRef);
  const subTag62_07 = tlv("07", "POS-01");
  const tag62Value = `${subTag62_01}${subTag62_07}`;

  // Build Payload (Tags 00 to 62)
  let payload = "";
  payload += tlv("00", "01"); // Payload Format Indicator
  payload += tlv("01", "12"); // Point of Initiation Method: 12 (Dynamic QR)
  payload += tlv("29", tag29Value); // Bakong Merchant Account Information
  payload += tlv("52", "5812"); // Merchant Category Code (Cinemas/Theaters)
  payload += tlv("53", currencyCode); // Transaction Currency (840=USD, 116=KHR)
  payload += tlv("54", formattedAmount); // Transaction Amount
  payload += tlv("58", "KH"); // Country Code
  payload += tlv("59", merchantName.slice(0, 25)); // Merchant Name
  payload += tlv("60", merchantCity.slice(0, 15)); // Merchant City
  payload += tlv("62", tag62Value); // Additional Data Field Template

  // Tag 63: CRC16 Checksum
  const crcPrefix = payload + "6304";
  const checksum = calculateCRC16(crcPrefix);

  return `${crcPrefix}${checksum}`;
}

/**
 * Helper to convert USD amount to KHR
 */
export function usdToKhr(usdAmount) {
  return Math.round(usdAmount * USD_TO_KHR_RATE);
}

/**
 * Format currency display
 */
export function formatCurrency(amount, currency = "USD") {
  if (currency === "USD") {
    return `$${Number(amount).toFixed(2)}`;
  }
  return `${Number(amount).toLocaleString()} ៛`;
}
