/**
 * Bluetooth Thermal Printer Integration for 58mm Printers
 * 
 * IMPORTANT NOTES:
 * - HTTPS is MANDATORY for Web Bluetooth API to work in production
 * - iOS (Safari/Chrome on iPhone) does NOT support Web Bluetooth API
 * - Always check for feature availability: if (!navigator.bluetooth)
 * - Tested with SEZNIK Veer 58mm portable Bluetooth thermal printer
 * 
 * @author Expert Full-Stack Developer
 * @version 1.0.0
 */

// ============================================================================
// CONFIGURABLE BLE UUIDs - Modify these if your printer uses different values
// ============================================================================

/**
 * Standard ESC/POS Bluetooth Service UUID
 * Change this if your BLE scanner shows a different service UUID
 */
const PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';

/**
 * Standard ESC/POS Bluetooth Characteristic UUID for Write operations
 * Change this if your BLE scanner shows a different characteristic UUID
 */
const PRINTER_CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

// ============================================================================
// ESC/POS COMMAND CONSTANTS
// ============================================================================

/**
 * ESC/POS control byte sequences for thermal printer formatting
 */
const ESC_POS_COMMANDS = {
  // Initialize/Reset Printer
  INIT: new Uint8Array([0x1B, 0x40]),
  
  // Text Alignment
  ALIGN_LEFT: new Uint8Array([0x1B, 0x61, 0x00]),
  ALIGN_CENTER: new Uint8Array([0x1B, 0x61, 0x01]),
  ALIGN_RIGHT: new Uint8Array([0x1B, 0x61, 0x02]),
  
  // Text Styling
  BOLD_ON: new Uint8Array([0x1B, 0x45, 0x01]),
  BOLD_OFF: new Uint8Array([0x1B, 0x45, 0x00]),
  
  // Double Height and Width (for headings)
  DOUBLE_ON: new Uint8Array([0x1D, 0x21, 0x11]),
  DOUBLE_OFF: new Uint8Array([0x1D, 0x21, 0x00]),
  
  // Line Feed
  LINE_FEED: new Uint8Array([0x0A]),
  
  // Paper Feed (3-4 blank lines for easy tear-off)
  PAPER_FEED: new Uint8Array([0x0A, 0x0A, 0x0A, 0x0A]),
  
  // Cut Paper (if supported by printer)
  CUT_PAPER: new Uint8Array([0x1D, 0x56, 0x00])
};

const RECEIPT_WIDTH_DOTS = 384;
const RECEIPT_PADDING = 16;
const RECEIPT_CONTENT_WIDTH = RECEIPT_WIDTH_DOTS - (RECEIPT_PADDING * 2);
const FAST_BLE_CHUNK_SIZE = 120;
const FALLBACK_BLE_CHUNK_SIZE = 20;
const FAST_CHUNK_DELAY_MS = 2;
const FALLBACK_CHUNK_DELAY_MS = 8;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert a string to Uint8Array bytes using UTF-8 encoding
 * @param {string} text - The text to encode
 * @returns {Uint8Array} - Encoded bytes
 */
function encodeText(text) {
  return new TextEncoder().encode(text);
}

/**
 * Concatenate multiple Uint8Array buffers into a single buffer
 * @param {...Uint8Array} arrays - Arrays to concatenate
 * @returns {Uint8Array} - Combined array
 */
function concatBuffers(...arrays) {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  
  return result;
}

/**
 * Format a line with left-aligned name and right-aligned price
 * Fits within 32 characters (standard for 58mm thermal printers)
 * @param {string} name - Item name
 * @param {string} price - Price string
 * @param {number} maxWidth - Maximum line width (default: 32)
 * @returns {string} - Formatted line with proper spacing
 */
function formatLineItem(name, price, maxWidth = 32) {
  // Truncate name if too long to leave room for price
  const priceLength = price.length;
  const maxNameLength = maxWidth - priceLength - 1; // -1 for at least one space
  
  let itemName = name.length > maxNameLength 
    ? name.substring(0, maxNameLength - 3) + '...' 
    : name;
  
  // Calculate spaces needed between name and price
  const spacesNeeded = maxWidth - itemName.length - priceLength;
  const spaces = ' '.repeat(Math.max(1, spacesNeeded));
  
  return itemName + spaces + price;
}

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  return '₹' + amount.toFixed(2);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function drawCenteredText(ctx, text, y, font, lineHeight) {
  ctx.font = font;
  ctx.textAlign = 'center';
  const lines = wrapText(ctx, text, RECEIPT_CONTENT_WIDTH);
  lines.forEach(line => {
    ctx.fillText(line, RECEIPT_WIDTH_DOTS / 2, y);
    y += lineHeight;
  });
  return y;
}

function drawRule(ctx, y) {
  ctx.beginPath();
  ctx.setLineDash([6, 4]);
  ctx.moveTo(RECEIPT_PADDING, y);
  ctx.lineTo(RECEIPT_WIDTH_DOTS - RECEIPT_PADDING, y);
  ctx.stroke();
  ctx.setLineDash([]);
  return y + 12;
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  words.forEach(word => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth) {
      line = testLine;
      return;
    }

    if (line) lines.push(line);

    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
      return;
    }

    let chunk = '';
    Array.from(word).forEach(char => {
      const testChunk = chunk + char;
      if (ctx.measureText(testChunk).width <= maxWidth) {
        chunk = testChunk;
      } else {
        if (chunk) lines.push(chunk);
        chunk = char;
      }
    });
    line = chunk;
  });

  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function drawLeftRight(ctx, left, right, y, font, lineHeight) {
  ctx.font = font;
  ctx.textAlign = 'right';
  const rightWidth = ctx.measureText(right).width;
  const leftWidth = RECEIPT_CONTENT_WIDTH - rightWidth - 10;
  ctx.textAlign = 'left';
  const leftLines = wrapText(ctx, left, leftWidth);

  leftLines.forEach((line, index) => {
    ctx.fillText(line, RECEIPT_PADDING, y + (index * lineHeight));
  });

  ctx.textAlign = 'right';
  ctx.fillText(right, RECEIPT_WIDTH_DOTS - RECEIPT_PADDING, y);
  return y + Math.max(1, leftLines.length) * lineHeight;
}

async function buildRasterReceiptPayload(billData) {
  if (typeof document === 'undefined') {
    return buildReceiptPayload(billData);
  }

  if (document.fonts?.load) {
    await Promise.all([
      document.fonts.load('22px "Tiro Telugu"'),
      document.fonts.load('28px "Tiro Telugu"')
    ]);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontStack = '"Tiro Telugu", "Noto Sans Telugu", "Nirmala UI", "Gautami", Arial, sans-serif';
  const regularFont = `22px ${fontStack}`;
  const smallFont = `18px ${fontStack}`;
  const boldFont = `700 22px ${fontStack}`;
  const titleFont = `700 30px ${fontStack}`;
  const totalFont = `700 26px ${fontStack}`;
  const lineHeight = 30;

  canvas.width = RECEIPT_WIDTH_DOTS;
  canvas.height = 2600;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.textBaseline = 'top';

  let y = 16;
  y = drawCenteredText(ctx, billData.storeName, y, titleFont, 38) + 4;
  if (billData.storeAddress) {
    y = drawCenteredText(ctx, billData.storeAddress, y, regularFont, lineHeight) + 2;
  }
  if (billData.storePhone) {
    y = drawCenteredText(ctx, `Tel: ${billData.storePhone}`, y, regularFont, lineHeight) + 2;
  }

  y = drawRule(ctx, y + 4);
  ctx.font = smallFont;
  ctx.textAlign = 'left';
  ctx.fillText(`Invoice: ${billData.invoiceNumber}`, RECEIPT_PADDING, y);
  y += 24;
  y = drawLeftRight(ctx, 'Date:', billData.date, y, smallFont, 24) + 4;
  y = drawRule(ctx, y + 4);

  ctx.font = boldFont;
  y = drawLeftRight(ctx, 'Item', 'Amount', y, boldFont, lineHeight);
  y = drawRule(ctx, y + 2);

  billData.items.forEach(item => {
    const quantity = item.quantity || 1;
    const itemTotal = item.price * quantity;
    const name = quantity > 1 ? `${item.name} x${quantity}` : item.name;
    y = drawLeftRight(ctx, name, formatCurrency(itemTotal), y, regularFont, lineHeight) + 4;
  });

  y = drawRule(ctx, y + 4);
  if (billData.subtotal !== undefined) {
    y = drawLeftRight(ctx, 'Subtotal:', formatCurrency(billData.subtotal), y, regularFont, lineHeight);
  }
  if (billData.tax !== undefined && billData.tax > 0) {
    y = drawLeftRight(ctx, 'Tax:', formatCurrency(billData.tax), y, regularFont, lineHeight);
  }
  if (billData.discount !== undefined && billData.discount > 0) {
    y = drawLeftRight(ctx, 'Discount:', '-' + formatCurrency(billData.discount), y, regularFont, lineHeight);
  }

  y = drawRule(ctx, y + 4);
  y = drawLeftRight(ctx, 'TOTAL:', formatCurrency(billData.total), y, totalFont, 36) + 6;
  y = drawRule(ctx, y + 4);

  if (billData.footer) {
    y = drawCenteredText(ctx, billData.footer, y, regularFont, lineHeight) + 6;
  }

  const imageHeight = Math.ceil((y + 8) / 8) * 8;
  const imageData = ctx.getImageData(0, 0, RECEIPT_WIDTH_DOTS, imageHeight);
  const bytesPerRow = RECEIPT_WIDTH_DOTS / 8;
  const raster = new Uint8Array(bytesPerRow * imageHeight);

  for (let row = 0; row < imageHeight; row += 1) {
    for (let colByte = 0; colByte < bytesPerRow; colByte += 1) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit += 1) {
        const x = (colByte * 8) + bit;
        const pixelIndex = ((row * RECEIPT_WIDTH_DOTS) + x) * 4;
        const r = imageData.data[pixelIndex];
        const g = imageData.data[pixelIndex + 1];
        const b = imageData.data[pixelIndex + 2];
        const alpha = imageData.data[pixelIndex + 3];
        const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b);
        if (alpha > 0 && luminance < 180) {
          byte |= 0x80 >> bit;
        }
      }
      raster[(row * bytesPerRow) + colByte] = byte;
    }
  }

  const xL = bytesPerRow & 0xff;
  const xH = (bytesPerRow >> 8) & 0xff;
  const yL = imageHeight & 0xff;
  const yH = (imageHeight >> 8) & 0xff;
  const rasterHeader = new Uint8Array([0x1D, 0x76, 0x30, 0x00, xL, xH, yL, yH]);

  return concatBuffers(
    ESC_POS_COMMANDS.INIT,
    rasterHeader,
    raster,
    ESC_POS_COMMANDS.PAPER_FEED
  );
}

async function writePrinterPayload(characteristic, payload, chunkSize, delayMs, useWithoutResponse) {
  const totalChunks = Math.ceil(payload.length / chunkSize);
  const writer = useWithoutResponse && typeof characteristic.writeValueWithoutResponse === 'function'
    ? characteristic.writeValueWithoutResponse.bind(characteristic)
    : characteristic.writeValue.bind(characteristic);

  console.log(
    `Sending ${payload.length} bytes in ${totalChunks} chunks of ${chunkSize} bytes` +
    (useWithoutResponse ? ' without response...' : '...')
  );

  for (let i = 0; i < payload.length; i += chunkSize) {
    const chunk = payload.slice(i, i + chunkSize);
    await writer(chunk);

    if (delayMs > 0) {
      await sleep(delayMs);
    }

    const chunkNumber = Math.floor(i / chunkSize) + 1;
    if (chunkNumber % 25 === 0 || chunkNumber === totalChunks) {
      console.log(`Sent chunk ${chunkNumber}/${totalChunks}`);
    }
  }
}

async function sendPrinterPayload(characteristic, payload) {
  const supportsWriteWithoutResponse =
    characteristic.properties?.writeWithoutResponse &&
    typeof characteristic.writeValueWithoutResponse === 'function';

  try {
    await writePrinterPayload(
      characteristic,
      payload,
      FAST_BLE_CHUNK_SIZE,
      FAST_CHUNK_DELAY_MS,
      supportsWriteWithoutResponse
    );
  } catch (error) {
    console.warn('Fast Bluetooth transfer failed, retrying with compatibility mode:', error);
    await writePrinterPayload(
      characteristic,
      payload,
      FALLBACK_BLE_CHUNK_SIZE,
      FALLBACK_CHUNK_DELAY_MS,
      false
    );
  }
}

// ============================================================================
// BILL FORMATTING FUNCTION
// ============================================================================

/**
 * Build ESC/POS formatted receipt payload from billing data
 * 
 * @param {Object} billData - Billing information object
 * @param {string} billData.storeName - Name of the store
 * @param {string} billData.storeAddress - Store address (optional)
 * @param {string} billData.storePhone - Store phone number (optional)
 * @param {string} billData.invoiceNumber - Invoice/Bill number
 * @param {string} billData.date - Date string
 * @param {Array} billData.items - Array of line items
 * @param {string} billData.items[].name - Item name
 * @param {number} billData.items[].price - Item price
 * @param {number} billData.items[].quantity - Item quantity (optional, default: 1)
 * @param {number} billData.subtotal - Subtotal amount (optional)
 * @param {number} billData.tax - Tax amount (optional)
 * @param {number} billData.discount - Discount amount (optional)
 * @param {number} billData.total - Total amount
 * @param {string} billData.footer - Footer message (optional)
 * 
 * @returns {Uint8Array} - Complete ESC/POS byte payload ready to send to printer
 */
function buildReceiptPayload(billData) {
  const payload = [];
  
  // Initialize printer
  payload.push(ESC_POS_COMMANDS.INIT);
  
  // Store Name (Centered, Bold, Double Height for heading)
  payload.push(ESC_POS_COMMANDS.ALIGN_CENTER);
  payload.push(ESC_POS_COMMANDS.BOLD_ON);
  payload.push(ESC_POS_COMMANDS.DOUBLE_ON);
  payload.push(encodeText(billData.storeName));
  payload.push(ESC_POS_COMMANDS.DOUBLE_OFF);
  payload.push(ESC_POS_COMMANDS.BOLD_OFF);
  payload.push(ESC_POS_COMMANDS.LINE_FEED);
  
  // Store Address (if provided)
  if (billData.storeAddress) {
    payload.push(encodeText(billData.storeAddress));
    payload.push(ESC_POS_COMMANDS.LINE_FEED);
  }
  
  // Store Phone (if provided)
  if (billData.storePhone) {
    payload.push(encodeText('Tel: ' + billData.storePhone));
    payload.push(ESC_POS_COMMANDS.LINE_FEED);
  }
  
  // Separator line
  payload.push(ESC_POS_COMMANDS.ALIGN_LEFT);
  payload.push(encodeText('--------------------------------'));
  payload.push(ESC_POS_COMMANDS.LINE_FEED);
  
  // Invoice Number and Date
  payload.push(encodeText('Invoice: ' + billData.invoiceNumber));
  payload.push(ESC_POS_COMMANDS.LINE_FEED);
  payload.push(encodeText('Date: ' + billData.date));
  payload.push(ESC_POS_COMMANDS.LINE_FEED);
  
  // Separator line
  payload.push(encodeText('--------------------------------'));
  payload.push(ESC_POS_COMMANDS.LINE_FEED);
  
  // Column Headers (Bold for clarity, normal size)
  payload.push(ESC_POS_COMMANDS.BOLD_ON);
  payload.push(encodeText(formatLineItem('Item', 'Price', 32)));
  payload.push(ESC_POS_COMMANDS.BOLD_OFF);
  payload.push(ESC_POS_COMMANDS.LINE_FEED);
  payload.push(encodeText('--------------------------------'));
  payload.push(ESC_POS_COMMANDS.LINE_FEED);
  
  // Line Items
  billData.items.forEach(item => {
    const quantity = item.quantity || 1;
    const itemTotal = item.price * quantity;
    
    // Item name and price
    const itemLine = formatLineItem(
      quantity > 1 ? `${item.name} x${quantity}` : item.name,
      formatCurrency(itemTotal),
      32
    );
    payload.push(encodeText(itemLine));
    payload.push(ESC_POS_COMMANDS.LINE_FEED);
  });
  
  // Separator line
  payload.push(encodeText('--------------------------------'));
  payload.push(ESC_POS_COMMANDS.LINE_FEED);
  
  // Subtotal (if provided)
  if (billData.subtotal !== undefined) {
    const subtotalLine = formatLineItem('Subtotal:', formatCurrency(billData.subtotal), 32);
    payload.push(encodeText(subtotalLine));
    payload.push(ESC_POS_COMMANDS.LINE_FEED);
  }
  
  // Tax (if provided)
  if (billData.tax !== undefined && billData.tax > 0) {
    const taxLine = formatLineItem('Tax:', formatCurrency(billData.tax), 32);
    payload.push(encodeText(taxLine));
    payload.push(ESC_POS_COMMANDS.LINE_FEED);
  }
  
  // Discount (if provided)
  if (billData.discount !== undefined && billData.discount > 0) {
    const discountLine = formatLineItem('Discount:', '-' + formatCurrency(billData.discount), 32);
    payload.push(encodeText(discountLine));
    payload.push(ESC_POS_COMMANDS.LINE_FEED);
  }
  
  // Total (Bold for emphasis)
  payload.push(ESC_POS_COMMANDS.BOLD_ON);
  const totalLine = formatLineItem('TOTAL:', formatCurrency(billData.total), 32);
  payload.push(encodeText(totalLine));
  payload.push(ESC_POS_COMMANDS.BOLD_OFF);
  payload.push(ESC_POS_COMMANDS.LINE_FEED);
  
  // Separator line
  payload.push(encodeText('--------------------------------'));
  payload.push(ESC_POS_COMMANDS.LINE_FEED);
  
  // Footer message (if provided)
  if (billData.footer) {
    payload.push(ESC_POS_COMMANDS.ALIGN_CENTER);
    payload.push(encodeText(billData.footer));
    payload.push(ESC_POS_COMMANDS.LINE_FEED);
  }
  
  // Paper feed for easy tear-off
  payload.push(ESC_POS_COMMANDS.PAPER_FEED);
  
  // Combine all buffers into single payload
  return concatBuffers(...payload);
}

// ============================================================================
// BLUETOOTH PRINTER CONNECTION & PRINTING
// ============================================================================

/**
 * Check if Web Bluetooth API is available in the current browser
 * @returns {boolean} - True if available, false otherwise
 */
export function isBluetoothAvailable() {
  return typeof navigator !== 'undefined' && 
         navigator.bluetooth !== undefined;
}

/**
 * Print receipt to Bluetooth thermal printer
 * 
 * @param {Object} billData - Billing data object (see buildReceiptPayload for structure)
 * @returns {Promise<void>} - Resolves when printing is complete
 * @throws {Error} - Throws error if connection or printing fails
 */
export async function printReceipt(billData) {
  // Feature detection
  if (!isBluetoothAvailable()) {
    throw new Error(
      'Web Bluetooth API is not available in this browser. ' +
      'Note: iOS devices (iPhone/iPad) do not support Web Bluetooth.'
    );
  }
  
  let device = null;
  
  try {
    // Check for previously paired devices
    if (navigator.bluetooth.getDevices) {
      console.log('Checking for previously paired devices...');
      try {
        const devices = await navigator.bluetooth.getDevices();
        // Look for a device matching typical printer keywords or name
        device = devices.find(d => 
          d.name && (
            d.name.toLowerCase().includes('seznik') || 
            d.name.toLowerCase().includes('veer') || 
            d.name.toLowerCase().includes('printer') ||
            d.name.toLowerCase().includes('mtp')
          )
        );
        if (device) {
          console.log('Using remembered device:', device.name);
        }
      } catch (err) {
        console.warn('Error checking getDevices:', err);
      }
    }

    // If no remembered device was found, request new device
    if (!device) {
      console.log('Requesting new Bluetooth device selection...');
      device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [PRINTER_SERVICE_UUID]
      });
    }
    
    console.log('Device selected:', device.name);
    
    // Connect to GATT server
    console.log('Connecting to GATT server...');
    const server = await device.gatt.connect();
    console.log('Connected to GATT server');
    
    // Get the printer service
    console.log('Getting printer service...');
    const service = await server.getPrimaryService(PRINTER_SERVICE_UUID);
    console.log('Printer service obtained');
    
    // Get the write characteristic
    console.log('Getting write characteristic...');
    const characteristic = await service.getCharacteristic(PRINTER_CHARACTERISTIC_UUID);
    console.log('Write characteristic obtained');
    
    // Build the receipt payload
    console.log('Building receipt payload...');
    const payload = await buildRasterReceiptPayload(billData);
    console.log('Payload size:', payload.length, 'bytes');
    
    await sendPrinterPayload(characteristic, payload);
    
    console.log('Receipt sent successfully!');
    
    // Wait a moment for printer to finish processing
    await sleep(250);
    
  } catch (error) {
    // Handle user cancellation gracefully
    if (error.name === 'NotFoundError') {
      console.log('User cancelled device selection');
      throw new Error('Printer selection was cancelled');
    }
    
    // Handle other errors
    console.error('Bluetooth printing error:', error);
    throw new Error(`Failed to print receipt: ${error.message}`);
    
  } finally {
    // Always disconnect to free up the printer for next use
    if (device && device.gatt.connected) {
      console.log('Disconnecting from printer...');
      device.gatt.disconnect();
      console.log('Disconnected');
    }
  }
}

// ============================================================================
// EXAMPLE USAGE (for testing)
// ============================================================================

/**
 * Example bill data structure
 */
export const EXAMPLE_BILL_DATA = {
  storeName: 'Manikanta Kiranam',
  storeAddress: '123 Main Street, City',
  storePhone: '+91 98765 43210',
  invoiceNumber: 'INV-2026-001',
  date: new Date().toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }),
  items: [
    { name: 'Rice (5kg)', price: 250.00, quantity: 2 },
    { name: 'Cooking Oil (1L)', price: 180.00, quantity: 1 },
    { name: 'Sugar (1kg)', price: 45.00, quantity: 3 },
    { name: 'Tea Powder (250g)', price: 120.00, quantity: 1 }
  ],
  subtotal: 1015.00,
  tax: 50.75,
  discount: 15.00,
  total: 1050.75,
  footer: 'GST No: 29XXXXX1234X1ZX'
};

/**
 * Test function to print example receipt
 * Call this from your UI button click handler
 */
export async function printExampleReceipt() {
  try {
    await printReceipt(EXAMPLE_BILL_DATA);
    alert('Receipt printed successfully!');
  } catch (error) {
    alert('Printing failed: ' + error.message);
  }
}

// Made with Bob
