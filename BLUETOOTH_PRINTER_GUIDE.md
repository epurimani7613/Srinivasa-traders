# Bluetooth Thermal Printer Integration Guide

## 🎯 Overview

This implementation provides a **production-ready, direct browser-to-printer** solution for printing billing receipts to 58mm Bluetooth thermal printers (like SEZNIK Veer 58mm) using the **Web Bluetooth API**.

### Key Features

✅ **No PDF Generation** - Direct ESC/POS command printing  
✅ **No Print Dialog** - Bypasses OS print preview completely  
✅ **No Bridge Apps** - Pure browser-based, no third-party software  
✅ **Native Web Bluetooth** - Uses browser's built-in Bluetooth API  
✅ **Configurable UUIDs** - Easy customization for different printers  
✅ **Robust Error Handling** - Graceful failure and connection management  
✅ **Production Ready** - Comprehensive error handling and logging  

---

## 📋 Requirements

### Browser Support

| Browser | Desktop | Android | iOS |
|---------|---------|---------|-----|
| Chrome | ✅ Yes | ✅ Yes | ❌ No |
| Edge | ✅ Yes | ✅ Yes | ❌ No |
| Opera | ✅ Yes | ✅ Yes | ❌ No |
| Safari | ❌ No | N/A | ❌ No |
| Firefox | ❌ No | ❌ No | ❌ No |

**Important:** iOS devices (iPhone/iPad) do **NOT** support Web Bluetooth API due to Apple's platform restrictions.

### Technical Requirements

1. **HTTPS Connection** - Web Bluetooth API requires secure context (HTTPS)
2. **Bluetooth Hardware** - Device must have Bluetooth capability
3. **Compatible Printer** - ESC/POS compatible thermal printer (58mm recommended)
4. **Modern Browser** - Chrome 56+, Edge 79+, or Opera 43+

---

## 🚀 Quick Start

### 1. Import the Module

```javascript
import { 
  printReceipt, 
  isBluetoothAvailable,
  EXAMPLE_BILL_DATA 
} from './bluetoothPrinter.js';
```

### 2. Check Browser Support

```javascript
if (!isBluetoothAvailable()) {
  alert('Your browser does not support Web Bluetooth API');
  return;
}
```

### 3. Prepare Bill Data

```javascript
const billData = {
  storeName: 'Your Store Name',
  storeAddress: '123 Main Street, City',
  storePhone: '+91 98765 43210',
  invoiceNumber: 'INV-2026-001',
  date: new Date().toLocaleString('en-IN'),
  items: [
    { name: 'Product 1', price: 100.00, quantity: 2 },
    { name: 'Product 2', price: 50.00, quantity: 1 }
  ],
  subtotal: 250.00,
  tax: 12.50,
  discount: 10.00,
  total: 252.50,
  footer: 'Thank you for your business!'
};
```

### 4. Print Receipt

```javascript
async function handlePrint() {
  try {
    await printReceipt(billData);
    alert('Receipt printed successfully!');
  } catch (error) {
    alert('Printing failed: ' + error.message);
  }
}
```

---

## 🔧 Configuration

### Customizing Bluetooth UUIDs

If your printer uses different UUIDs, modify these constants at the top of `bluetoothPrinter.js`:

```javascript
// Default ESC/POS UUIDs (works with most thermal printers)
const PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
const PRINTER_CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb';
```

**How to find your printer's UUIDs:**

1. Use a BLE scanner app (e.g., "nRF Connect" on Android/iOS)
2. Connect to your printer
3. Look for the service with "Write" or "Write Without Response" characteristic
4. Copy the Service UUID and Characteristic UUID
5. Update the constants in the code

### Adjusting Printer Filters

Modify the device request filters to match your printer's name:

```javascript
device = await navigator.bluetooth.requestDevice({
  filters: [
    { namePrefix: 'Veer' },      // SEZNIK Veer printers
    { namePrefix: 'MTP' },       // Your printer prefix
    { namePrefix: 'YourBrand' }  // Add your printer brand
  ],
  acceptAllDevices: false,
  optionalServices: [PRINTER_SERVICE_UUID]
});
```

### Customizing Receipt Layout

The receipt width is set to **32 characters** (standard for 58mm printers). To adjust:

```javascript
// In formatLineItem function
function formatLineItem(name, price, maxWidth = 32) {
  // Change maxWidth to 42 for 80mm printers
  // Change maxWidth to 48 for larger printers
}
```

---

## 📊 Bill Data Structure

### Complete Schema

```typescript
interface BillData {
  // Required fields
  storeName: string;           // Store/business name
  invoiceNumber: string;       // Invoice/bill number
  date: string;                // Date string (any format)
  items: Array<{
    name: string;              // Item name
    price: number;             // Unit price
    quantity?: number;         // Quantity (default: 1)
  }>;
  total: number;               // Total amount
  
  // Optional fields
  storeAddress?: string;       // Store address
  storePhone?: string;         // Store phone number
  subtotal?: number;           // Subtotal before tax/discount
  tax?: number;                // Tax amount
  discount?: number;           // Discount amount
  footer?: string;             // Custom footer message
}
```

### Example with All Fields

```javascript
const completeBillData = {
  // Store Information
  storeName: 'Manikanta Kiranam',
  storeAddress: '123 Main Street, Hyderabad, Telangana',
  storePhone: '+91 98765 43210',
  
  // Invoice Details
  invoiceNumber: 'INV-2026-001234',
  date: '23/06/2026, 11:06 PM',
  
  // Line Items
  items: [
    { name: 'Rice (5kg)', price: 250.00, quantity: 2 },
    { name: 'Cooking Oil (1L)', price: 180.00, quantity: 1 },
    { name: 'Sugar (1kg)', price: 45.00, quantity: 3 },
    { name: 'Tea Powder (250g)', price: 120.00, quantity: 1 }
  ],
  
  // Pricing
  subtotal: 1015.00,
  tax: 50.75,
  discount: 15.00,
  total: 1050.75,
  
  // Footer
  footer: 'GST No: 29XXXXX1234X1ZX'
};
```

---

## 🎨 ESC/POS Commands Reference

### Available Commands

```javascript
ESC_POS_COMMANDS = {
  INIT: [0x1B, 0x40],              // Initialize printer
  ALIGN_LEFT: [0x1B, 0x61, 0x00],  // Left align text
  ALIGN_CENTER: [0x1B, 0x61, 0x01],// Center align text
  ALIGN_RIGHT: [0x1B, 0x61, 0x02], // Right align text
  BOLD_ON: [0x1B, 0x45, 0x01],     // Enable bold
  BOLD_OFF: [0x1B, 0x45, 0x00],    // Disable bold
  DOUBLE_ON: [0x1D, 0x21, 0x11],   // Double height/width
  DOUBLE_OFF: [0x1D, 0x21, 0x00],  // Normal size
  LINE_FEED: [0x0A],               // New line
  PAPER_FEED: [0x0A, 0x0A, 0x0A, 0x0A], // Feed paper
  CUT_PAPER: [0x1D, 0x56, 0x00]    // Cut paper (if supported)
};
```

### Custom Formatting Example

```javascript
import { concatBuffers, encodeText, ESC_POS_COMMANDS } from './bluetoothPrinter.js';

// Create custom formatted text
const customPayload = concatBuffers(
  ESC_POS_COMMANDS.INIT,
  ESC_POS_COMMANDS.ALIGN_CENTER,
  ESC_POS_COMMANDS.BOLD_ON,
  encodeText('SPECIAL OFFER'),
  ESC_POS_COMMANDS.LINE_FEED,
  ESC_POS_COMMANDS.BOLD_OFF,
  encodeText('50% OFF Today!'),
  ESC_POS_COMMANDS.PAPER_FEED
);
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "Web Bluetooth API is not available"

**Cause:** Browser doesn't support Web Bluetooth or not using HTTPS

**Solutions:**
- Use Chrome, Edge, or Opera browser
- Ensure you're on HTTPS (not HTTP)
- Check if you're on iOS (not supported)

#### 2. "User cancelled device selection"

**Cause:** User clicked "Cancel" in Bluetooth pairing dialog

**Solution:** This is normal behavior - handle gracefully in UI

#### 3. Printer not appearing in device list

**Causes:**
- Printer is off or out of range
- Printer is already connected to another device
- Name filter doesn't match printer name

**Solutions:**
- Turn printer on and ensure it's in pairing mode
- Disconnect printer from other devices
- Use `acceptAllDevices: true` temporarily to see all devices
- Check printer name with BLE scanner app

#### 4. Connection succeeds but nothing prints

**Causes:**
- Wrong Service/Characteristic UUIDs
- Printer doesn't support ESC/POS commands
- Printer buffer overflow

**Solutions:**
- Verify UUIDs with BLE scanner app
- Check printer documentation for command set
- Reduce CHUNK_SIZE in code (try 20 bytes)

#### 5. Partial or garbled printing

**Causes:**
- Data sent too fast
- MTU (Maximum Transmission Unit) too large
- Character encoding issues

**Solutions:**
- Increase delay between chunks (change 50ms to 100ms)
- Reduce CHUNK_SIZE to 20 bytes
- Ensure text is ASCII or UTF-8 compatible

---

## 🧪 Testing

### Demo Page

A complete demo page is included at `client/public/printer-demo.html`

**To test:**

1. Start your development server with HTTPS:
   ```bash
   npm run dev -- --https
   ```

2. Open in Chrome/Edge:
   ```
   https://localhost:5173/printer-demo.html
   ```

3. Click "Test Connection" to verify Bluetooth pairing

4. Click "Print Receipt" to print example bill

### Manual Testing Checklist

- [ ] Browser support detection works
- [ ] Bluetooth pairing dialog appears
- [ ] Can select printer from list
- [ ] Connection establishes successfully
- [ ] Receipt prints completely
- [ ] Formatting is correct (alignment, bold, etc.)
- [ ] Paper feeds properly at end
- [ ] Printer disconnects after printing
- [ ] Can print multiple receipts in succession
- [ ] Error messages are user-friendly

---

## 🔒 Security & Privacy

### HTTPS Requirement

Web Bluetooth API **requires HTTPS** for security reasons:

- Prevents man-in-the-middle attacks
- Ensures user consent for device access
- Protects sensitive billing data

**Development:** Use `localhost` (automatically secure) or self-signed certificates

**Production:** Use valid SSL/TLS certificate (Let's Encrypt, etc.)

### User Permissions

- Browser will **always** prompt user to select device
- User must explicitly grant permission
- No background Bluetooth access without user action
- Connection is temporary and must be re-established each time

---

## 📱 Integration Examples

### React Component

```jsx
import React, { useState } from 'react';
import { printReceipt, isBluetoothAvailable } from './bluetoothPrinter';

function PrintButton({ billData }) {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);

  const handlePrint = async () => {
    if (!isBluetoothAvailable()) {
      setError('Bluetooth not supported in this browser');
      return;
    }

    setPrinting(true);
    setError(null);

    try {
      await printReceipt(billData);
      alert('Receipt printed successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div>
      <button onClick={handlePrint} disabled={printing}>
        {printing ? 'Printing...' : 'Print Receipt'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### Vue Component

```vue
<template>
  <div>
    <button @click="handlePrint" :disabled="printing">
      {{ printing ? 'Printing...' : 'Print Receipt' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { printReceipt, isBluetoothAvailable } from './bluetoothPrinter';

export default {
  props: ['billData'],
  data() {
    return {
      printing: false,
      error: null
    };
  },
  methods: {
    async handlePrint() {
      if (!isBluetoothAvailable()) {
        this.error = 'Bluetooth not supported';
        return;
      }

      this.printing = true;
      this.error = null;

      try {
        await printReceipt(this.billData);
        alert('Receipt printed successfully!');
      } catch (err) {
        this.error = err.message;
      } finally {
        this.printing = false;
      }
    }
  }
};
</script>
```

---

## 📚 Additional Resources

### Web Bluetooth API Documentation
- [MDN Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Web Bluetooth Specification](https://webbluetoothcg.github.io/web-bluetooth/)
- [Chrome Platform Status](https://chromestatus.com/feature/5264933985976320)

### ESC/POS Command Reference
- [ESC/POS Command Reference (PDF)](https://reference.epson-biz.com/modules/ref_escpos/index.php)
- [Thermal Printer Commands Guide](https://www.sparkfun.com/datasheets/Components/General/Driver%20board.pdf)

### BLE Scanner Apps
- **Android:** nRF Connect, BLE Scanner
- **iOS:** nRF Connect, LightBlue

---

## 🤝 Support

### Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your printer's UUIDs with a BLE scanner
3. Test with the included demo page
4. Check browser console for detailed error messages
5. Ensure HTTPS is enabled

### Known Limitations

- **iOS not supported** - Apple doesn't allow Web Bluetooth
- **Firefox not supported** - Mozilla hasn't implemented Web Bluetooth
- **Range limited** - Bluetooth typically works within 10 meters
- **One connection at a time** - Printer can only connect to one device
- **No background printing** - User must interact with page

---

## 📄 License

This implementation is provided as-is for educational and commercial use.

---

**Version:** 1.0.0  
**Last Updated:** June 23, 2026  
**Author:** Expert Full-Stack Developer