/**
 * Print Receipt Button Component
 * 
 * A ready-to-use React component for printing receipts to Bluetooth thermal printers
 * Integrates seamlessly with your existing billing application
 */

import React, { useState, useEffect } from 'react';
import { printReceipt, isBluetoothAvailable } from './bluetoothPrinter';

/**
 * PrintReceiptButton Component
 * 
 * @param {Object} props
 * @param {Object} props.billData - Bill data object (see bluetoothPrinter.js for structure)
 * @param {string} props.className - Optional CSS class name
 * @param {string} props.label - Button label (default: "Print Receipt")
 * @param {Function} props.onSuccess - Callback when print succeeds
 * @param {Function} props.onError - Callback when print fails
 */
export default function PrintReceiptButton({ 
  billData, 
  className = '',
  label = 'Print Receipt',
  onSuccess,
  onError 
}) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);

  // Check browser support on mount
  useEffect(() => {
    setIsSupported(isBluetoothAvailable());
  }, []);

  const handlePrint = async () => {
    if (!isSupported) {
      const errorMsg = 'Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera on desktop/Android.';
      setError(errorMsg);
      if (onError) onError(new Error(errorMsg));
      return;
    }

    if (!billData) {
      const errorMsg = 'No bill data provided';
      setError(errorMsg);
      if (onError) onError(new Error(errorMsg));
      return;
    }

    setIsPrinting(true);
    setError(null);

    try {
      await printReceipt(billData);
      
      // Success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Optional: Show success message
      console.log('✅ Receipt printed successfully');
      
    } catch (err) {
      console.error('❌ Print error:', err);
      setError(err.message);
      
      // Error callback
      if (onError) {
        onError(err);
      }
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="print-receipt-container">
      <button
        onClick={handlePrint}
        disabled={isPrinting || !isSupported}
        className={`print-receipt-btn ${className} ${isPrinting ? 'printing' : ''} ${!isSupported ? 'disabled' : ''}`}
        title={!isSupported ? 'Bluetooth printing not supported in this browser' : 'Print receipt to Bluetooth thermal printer'}
      >
        {isPrinting ? (
          <>
            <span className="spinner">⏳</span>
            <span>Printing...</span>
          </>
        ) : (
          <>
            <span className="icon">🖨️</span>
            <span>{label}</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="print-error" role="alert">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      )}
      
      {!isSupported && (
        <div className="print-warning" role="alert">
          <span className="warning-icon">ℹ️</span>
          <span className="warning-message">
            Bluetooth printing requires Chrome, Edge, or Opera browser
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Example CSS (add to your stylesheet or use CSS-in-JS)
 */
export const printReceiptStyles = `
.print-receipt-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.print-receipt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.print-receipt-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.print-receipt-btn:active:not(:disabled) {
  transform: translateY(0);
}

.print-receipt-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.print-receipt-btn.printing {
  background: #6c757d;
}

.print-receipt-btn .spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.print-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
  font-size: 14px;
}

.print-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  font-size: 13px;
}

.error-icon,
.warning-icon {
  font-size: 18px;
}

.error-message,
.warning-message {
  flex: 1;
}
`;

/**
 * Usage Example in your billing app:
 * 
 * import PrintReceiptButton from './PrintReceiptButton';
 * 
 * function BillingPage() {
 *   const [currentBill, setCurrentBill] = useState(null);
 * 
 *   const handlePrintSuccess = () => {
 *     alert('Receipt printed successfully!');
 *     // Optional: Clear cart, reset form, etc.
 *   };
 * 
 *   const handlePrintError = (error) => {
 *     alert('Failed to print: ' + error.message);
 *   };
 * 
 *   return (
 *     <div>
 *       <h1>Billing</h1>
 *       {currentBill && (
 *         <PrintReceiptButton
 *           billData={currentBill}
 *           onSuccess={handlePrintSuccess}
 *           onError={handlePrintError}
 *         />
 *       )}
 *     </div>
 *   );
 * }
 */

/**
 * Advanced Usage: Custom styling and behavior
 * 
 * <PrintReceiptButton
 *   billData={billData}
 *   className="my-custom-class"
 *   label="Print to Thermal Printer"
 *   onSuccess={() => {
 *     console.log('Print successful');
 *     // Clear cart
 *     // Navigate to next page
 *     // Show success toast
 *   }}
 *   onError={(error) => {
 *     console.error('Print failed:', error);
 *     // Show error toast
 *     // Log to analytics
 *   }}
 * />
 */

// Made with Bob
