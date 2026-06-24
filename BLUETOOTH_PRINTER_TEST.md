# 🧪 Bluetooth Printer Testing Guide

## Quick Test Instructions

Follow these steps to test the Bluetooth thermal printer integration:

### Step 1: Start the Development Server with HTTPS

The Web Bluetooth API **requires HTTPS**. I've already configured Vite to use HTTPS.

```bash
cd client
npm run dev
```

The server will start at `https://localhost:5173` (note the HTTPS)

### Step 2: Access the Test Page

Open your browser (Chrome, Edge, or Opera) and navigate to:

```
https://localhost:5173/printer-demo.html
```

**OR** use the React test component:

Add this to your `client/src/main.jsx`:

```javascript
import BluetoothPrinterTest from './BluetoothPrinterTest'

// Temporarily replace your App with the test component
root.render(
  <React.StrictMode>
    <BluetoothPrinterTest />
  </React.StrictMode>
)
```

### Step 3: Accept the Self-Signed Certificate

Since we're using HTTPS in development, your browser will show a security warning:

1. Click "Advanced" or "Show Details"
2. Click "Proceed to localhost (unsafe)" or "Accept the Risk"
3. This is safe for localhost development

### Step 4: Test Connection

1. Turn on your SEZNIK Veer 58mm printer
2. Ensure it's in pairing mode (usually indicated by a blinking LED)
3. Click the **"Test Connection"** button
4. A Bluetooth device picker will appear
5. Select your printer from the list
6. If successful, you'll see a success message

### Step 5: Print Test Receipt

1. Click the **"Print Receipt"** button
2. Select your printer again (if prompted)
3. The receipt should start printing immediately
4. Check the output for:
   - Proper alignment (centered store name, left-aligned items)
   - Bold text for headings
   - Double-size text for store name and total
   - Correct spacing and line formatting
   - Paper feed at the end (3-4 blank lines)

## Expected Output

The test receipt should look like this:

```
     Manikanta Kiranam
123 Main Street, Hyderabad, Telangana
Tel: +91 98765 43210
--------------------------------
Invoice: INV-2026-001234
Date: 23/06/2026, 11:06 PM
--------------------------------
Item                       Price
--------------------------------
Rice (5kg) x2            ₹500.00
Cooking Oil (1L)         ₹180.00
Sugar (1kg) x3           ₹135.00
Tea Powder (250g)        ₹120.00
--------------------------------
Subtotal:               ₹1015.00
Tax:                      ₹50.75
Discount:                -₹15.00
TOTAL:                  ₹1050.75
--------------------------------
GST No: 29XXXXX1234X1ZX
     Thank You! Visit Again!
```

## Troubleshooting

### Issue: "Web Bluetooth API is not available"

**Solutions:**
- ✅ Use Chrome, Edge, or Opera (not Firefox or Safari)
- ✅ Ensure you're on HTTPS (https://localhost:5173)
- ✅ Not on iOS device (iOS doesn't support Web Bluetooth)

### Issue: Printer doesn't appear in device list

**Solutions:**
- ✅ Turn printer on and ensure it's in pairing mode
- ✅ Move closer to the printer (within 10 meters)
- ✅ Disconnect printer from other devices
- ✅ Restart the printer
- ✅ Check if printer name starts with "Veer", "MTP", or "Printer"

### Issue: Connection succeeds but nothing prints

**Possible causes:**
1. **Wrong UUIDs**: Your printer may use different Service/Characteristic UUIDs

   **Solution**: Use a BLE scanner app (like "nRF Connect") to find the correct UUIDs:
   - Install "nRF Connect" on your phone
   - Scan for your printer
   - Connect and explore services
   - Find the service with a "Write" characteristic
   - Update the UUIDs in `client/src/bluetoothPrinter.js`:
   
   ```javascript
   const PRINTER_SERVICE_UUID = 'your-service-uuid-here';
   const PRINTER_CHARACTERISTIC_UUID = 'your-characteristic-uuid-here';
   ```

2. **Printer doesn't support ESC/POS**: Some printers use proprietary commands

   **Solution**: Check your printer's documentation for the command set it supports

3. **Buffer overflow**: Data sent too fast

   **Solution**: In `bluetoothPrinter.js`, increase the delay between chunks:
   
   ```javascript
   // Change from 50ms to 100ms
   await new Promise(resolve => setTimeout(resolve, 100));
   ```

### Issue: Partial or garbled printing

**Solutions:**
- Reduce chunk size in `bluetoothPrinter.js`:
  ```javascript
  const CHUNK_SIZE = 20; // Try reducing to 10 or 15
  ```
- Increase delay between chunks (see above)
- Check if printer paper is loaded correctly

### Issue: Browser console shows errors

**Common errors and solutions:**

1. **"NotFoundError: User cancelled the requestDevice() chooser"**
   - This is normal - user clicked Cancel
   - No action needed

2. **"NetworkError: GATT Server is disconnected"**
   - Printer went out of range or turned off
   - Restart printer and try again

3. **"NotSupportedError: GATT operation not permitted"**
   - Wrong characteristic UUID
   - Use BLE scanner to find correct UUID

## Testing Checklist

Use this checklist to verify everything works:

- [ ] HTTPS is enabled (URL shows https://)
- [ ] Browser supports Web Bluetooth (Chrome/Edge/Opera)
- [ ] Printer is on and in pairing mode
- [ ] Test connection succeeds
- [ ] Device picker shows printer name
- [ ] Print button triggers printing
- [ ] Receipt prints completely
- [ ] Store name is centered and double-size
- [ ] Items are left-aligned with right-aligned prices
- [ ] Bold text appears correctly
- [ ] Total is bold and double-size
- [ ] Paper feeds 3-4 lines at end
- [ ] Can print multiple receipts in succession
- [ ] Printer disconnects properly after printing

## Advanced Testing

### Test with Custom Bill Data

Modify the test data in `client/src/BluetoothPrinterTest.jsx`:

```javascript
const customBillData = {
  storeName: 'Your Store Name',
  storeAddress: 'Your Address',
  storePhone: 'Your Phone',
  invoiceNumber: 'TEST-001',
  date: new Date().toLocaleString('en-IN'),
  items: [
    { name: 'Test Item 1', price: 100.00, quantity: 1 },
    { name: 'Test Item 2', price: 50.00, quantity: 2 }
  ],
  subtotal: 200.00,
  tax: 10.00,
  discount: 5.00,
  total: 205.00,
  footer: 'Test Receipt'
};
```

### Test Different Printers

If you have multiple thermal printers, test with each one:

1. Note the printer name from the device picker
2. Add it to the filters in `bluetoothPrinter.js`:
   ```javascript
   filters: [
     { namePrefix: 'Veer' },
     { namePrefix: 'YourPrinterName' }
   ]
   ```

### Performance Testing

Test printing speed and reliability:

1. Print 5 receipts in quick succession
2. Verify all print correctly
3. Check for any connection issues
4. Monitor browser console for errors

## Getting Help

If you encounter issues not covered here:

1. Check the browser console (F12) for detailed error messages
2. Review `BLUETOOTH_PRINTER_GUIDE.md` for comprehensive documentation
3. Use a BLE scanner app to verify your printer's UUIDs
4. Test with the standalone HTML demo at `client/public/printer-demo.html`

## Next Steps

Once testing is successful:

1. Integrate `PrintReceiptButton` component into your billing app
2. Replace example bill data with real transaction data
3. Add success/error notifications to your UI
4. Consider adding a printer settings page for UUID configuration
5. Test in production environment with valid SSL certificate

---

**Ready to test?** Start the dev server and navigate to the test page! 🚀