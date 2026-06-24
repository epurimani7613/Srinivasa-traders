# 🧪 MANUAL TESTING INSTRUCTIONS

## ⚠️ IMPORTANT: I Cannot Test Hardware

As an AI, I **cannot physically test** the Bluetooth printer because:
- I don't have access to physical hardware
- I cannot open browsers or interact with Bluetooth devices
- I cannot click buttons or see printer output

**YOU need to perform the testing** and report back the results.

---

## ✅ Server is Running

The development server is **LIVE** at:
### **https://localhost:5173/**

---

## 📝 Step-by-Step Testing Instructions

### Step 1: Prepare Your Printer
- [ ] Turn on your SEZNIK Veer 58mm printer
- [ ] Ensure it has paper loaded
- [ ] Put it in pairing mode (usually automatic, indicated by blinking LED)
- [ ] Keep it within 10 meters of your computer

### Step 2: Open the Test Page
1. Open **Chrome, Edge, or Opera** browser (NOT Firefox or Safari)
2. Navigate to: **https://localhost:5173/printer-demo.html**
3. You'll see a security warning about the certificate
4. Click **"Advanced"** or **"Show Details"**
5. Click **"Proceed to localhost (unsafe)"** or **"Accept the Risk"**
   - This is safe for localhost development

### Step 3: Verify Browser Support
Look at the page and check:
- [ ] Does it show "Web Bluetooth API is available! Ready to print."?
- [ ] Are the buttons enabled (not grayed out)?
- [ ] Do you see the receipt preview?

**If you see "Web Bluetooth API is not available":**
- You're using an unsupported browser (use Chrome/Edge/Opera)
- You're on iOS (not supported)
- You're not on HTTPS (check URL starts with https://)

### Step 4: Test Bluetooth Connection
1. Click the **"🧪 Test Connection"** button
2. A popup should appear asking you to select a Bluetooth device
3. Look for your printer in the list (name might be "Veer", "MTP-II", "Printer", etc.)
4. Select your printer and click **"Pair"**

**What should happen:**
- ✅ Success message: "Successfully connected to: [Printer Name]"
- ✅ Console shows connection details (press F12 to see)

**If printer doesn't appear:**
- Turn printer off and on again
- Ensure it's in pairing mode
- Move closer to the printer
- Disconnect from other devices
- Try clicking "Cancel" and then "Test Connection" again

### Step 5: Print Test Receipt
1. Click the **"🖨️ Print Receipt"** button
2. Select your printer again (if prompted)
3. Wait for the printer to start printing

**What should happen:**
- ✅ Status shows "Connecting to printer..."
- ✅ Then "Receipt printed successfully!"
- ✅ Printer starts printing immediately
- ✅ Receipt prints completely
- ✅ Paper feeds 3-4 lines at end

### Step 6: Verify Receipt Output

Check the printed receipt for:

**Layout:**
- [ ] Store name "Manikanta Kiranam" is centered and large (double size)
- [ ] Address and phone are centered
- [ ] Dashed lines (32 dashes) separate sections
- [ ] Invoice number and date are left-aligned

**Items:**
- [ ] Item names are on the left
- [ ] Prices are on the right
- [ ] "Rice (5kg) x2" shows quantity
- [ ] All 4 items printed correctly

**Totals:**
- [ ] Subtotal: ₹1015.00
- [ ] Tax: ₹50.75
- [ ] Discount: -₹15.00
- [ ] TOTAL: ₹1050.75 (bold and large)

**Footer:**
- [ ] GST number printed
- [ ] "Thank You! Visit Again!" centered
- [ ] 3-4 blank lines at end for easy tear-off

### Step 7: Test Multiple Prints
1. Click "Print Receipt" again
2. Print 2-3 more receipts in succession
3. Verify each prints correctly without errors

---

## 📊 Report Your Results

After testing, please tell me:

### ✅ What Worked:
```
Example:
- Browser detected Web Bluetooth ✅
- Printer appeared in device list ✅
- Connection succeeded ✅
- Receipt printed ✅
- Formatting looks good ✅
- Multiple prints work ✅
```

### ❌ What Didn't Work:
```
Example:
- Printer name is "XYZ" not "Veer"
- Nothing prints (connection succeeds but no output)
- Text is garbled
- Alignment is off
- Error message: [paste error here]
```

### 🖨️ Printer Information:
```
- Printer Model: SEZNIK Veer 58mm (or your actual model)
- Printer Name in Bluetooth: [what you see in device picker]
- Any error messages from browser console (F12)
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Printer Not in Device List

**Try these:**
1. Turn printer off, wait 5 seconds, turn on again
2. Check printer is in pairing mode (blinking LED)
3. Move computer closer to printer
4. Disconnect printer from phone/tablet if connected
5. Restart your computer's Bluetooth

### Issue 2: Connection Succeeds But Nothing Prints

**Most likely cause:** Wrong UUIDs

**To fix:**
1. Download "nRF Connect" app on your phone (free)
2. Open app and scan for devices
3. Find your printer and tap "Connect"
4. Look for services - find one with "Write" or "Write Without Response"
5. Note the Service UUID and Characteristic UUID
6. Tell me these UUIDs and I'll update the code

**Example UUIDs to look for:**
- Service: `000018f0-0000-1000-8000-00805f9b34fb`
- Characteristic: `00002af1-0000-1000-8000-00805f9b34fb`

### Issue 3: Garbled or Partial Printing

**Solutions:**
1. Tell me and I'll reduce the chunk size
2. Tell me and I'll increase the delay between chunks
3. Your printer might not support ESC/POS commands

### Issue 4: Certificate Warning Won't Go Away

**Solution:**
1. Type "thisisunsafe" while on the warning page (no input box needed)
2. Or click "Advanced" → "Proceed to localhost"

---

## 🎯 Testing Checklist

Complete this checklist and report back:

**Pre-Test:**
- [ ] Printer is on and has paper
- [ ] Using Chrome, Edge, or Opera browser
- [ ] Not on iOS device
- [ ] Server is running at https://localhost:5173

**Browser Test:**
- [ ] Page loads without errors
- [ ] Shows "Bluetooth API available" message
- [ ] Buttons are enabled
- [ ] Receipt preview is visible

**Connection Test:**
- [ ] "Test Connection" button works
- [ ] Bluetooth device picker appears
- [ ] Printer appears in list
- [ ] Can select and pair with printer
- [ ] Success message appears

**Print Test:**
- [ ] "Print Receipt" button works
- [ ] Printer starts printing
- [ ] Receipt prints completely
- [ ] No errors in console (F12)

**Output Quality:**
- [ ] Store name is centered and large
- [ ] Items are left-aligned
- [ ] Prices are right-aligned
- [ ] Bold text appears bold
- [ ] Dashed lines are straight
- [ ] Paper feeds at end

**Multiple Prints:**
- [ ] Can print 3+ receipts in a row
- [ ] No connection errors
- [ ] Each receipt is identical

---

## 📞 Next Steps

After you complete the testing:

1. **If everything works:** Tell me "It works!" and I'll help you integrate it into your billing app

2. **If something doesn't work:** Tell me:
   - What error messages you see
   - What the printer name is in the device picker
   - Whether connection succeeds but nothing prints
   - Any console errors (press F12)

3. **If you need the UUIDs changed:** Use nRF Connect app and tell me the UUIDs

---

## 🚀 Ready to Test?

**Open your browser NOW and go to:**

# https://localhost:5173/printer-demo.html

Then follow the steps above and report back! 📝