/**
 * Bluetooth Printer Test Page
 * 
 * A comprehensive test interface for the Bluetooth thermal printer integration
 */

import React, { useState, useEffect } from 'react';
import { printReceipt, isBluetoothAvailable, EXAMPLE_BILL_DATA } from './bluetoothPrinter';

export default function BluetoothPrinterTest() {
  const [isSupported, setIsSupported] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [billData, setBillData] = useState(EXAMPLE_BILL_DATA);

  useEffect(() => {
    const supported = isBluetoothAvailable();
    setIsSupported(supported);
    
    if (!supported) {
      setStatus({
        message: 'Web Bluetooth API is not available in this browser. Please use Chrome, Edge, or Opera on desktop/Android.',
        type: 'error'
      });
    } else {
      setStatus({
        message: 'Web Bluetooth API is available! Ready to print.',
        type: 'success'
      });
    }

    // Log environment info
    console.log('🔒 Protocol:', window.location.protocol);
    console.log('🌐 Bluetooth Available:', supported);
    console.log('📱 User Agent:', navigator.userAgent);
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatus({ message: 'Testing Bluetooth connection...', type: 'info' });

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      setStatus({
        message: `✅ Successfully connected to: ${device.name || 'Unknown Device'}`,
        type: 'success'
      });

      console.log('Device Info:', {
        name: device.name,
        id: device.id,
        connected: device.gatt?.connected
      });

      // Disconnect immediately
      if (device.gatt?.connected) {
        device.gatt.disconnect();
      }
    } catch (error) {
      if (error.name === 'NotFoundError') {
        setStatus({
          message: 'Connection test cancelled by user',
          type: 'info'
        });
      } else {
        setStatus({
          message: `❌ Connection test failed: ${error.message}`,
          type: 'error'
        });
        console.error('Connection test error:', error);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handlePrintReceipt = async () => {
    setIsPrinting(true);
    setStatus({ message: 'Connecting to printer...', type: 'info' });

    try {
      await printReceipt(billData);
      setStatus({
        message: '✅ Receipt printed successfully!',
        type: 'success'
      });
    } catch (error) {
      if (error.message.includes('cancelled')) {
        setStatus({
          message: 'Printing cancelled by user',
          type: 'info'
        });
      } else {
        setStatus({
          message: `❌ Printing failed: ${error.message}`,
          type: 'error'
        });
      }
      console.error('Print error:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const formatPreview = () => {
    const lines = [];
    lines.push(`     ${billData.storeName}`);
    lines.push(billData.storeAddress);
    lines.push(`Tel: ${billData.storePhone}`);
    lines.push('--------------------------------');
    lines.push(`Invoice: ${billData.invoiceNumber}`);
    lines.push(`Date: ${billData.date}`);
    lines.push('--------------------------------');
    lines.push('Item                       Price');
    lines.push('Product ID              Quantity');
    lines.push('--------------------------------');
    
    billData.items.forEach(item => {
      const name = item.name.padEnd(24);
      const price = `₹${(item.price * item.quantity).toFixed(2)}`.padStart(8);
      lines.push(`${name}${price}`);
      lines.push(`${`ID: ${item.productId || '-'}`.padEnd(24)}${`Qty: ${item.quantity}`.padStart(8)}`);
    });
    
    lines.push('--------------------------------');
    lines.push(`${'Tax:'.padEnd(24)}${'₹' + billData.tax.toFixed(2).padStart(7)}`);
    lines.push(`${'Discount:'.padEnd(24)}${'-₹' + billData.discount.toFixed(2).padStart(6)}`);
    lines.push(`${'TOTAL:'.padEnd(24)}${'₹' + billData.total.toFixed(2).padStart(7)}`);
    lines.push('--------------------------------');
    lines.push(`     ${billData.footer}`);
    lines.push('     Thank You! Visit Again!');
    
    return lines.join('\n');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🖨️ Bluetooth Printer Test</h1>
        <p style={styles.subtitle}>Test your SEZNIK Veer 58mm thermal printer integration</p>

        {/* Status Message */}
        {status.message && (
          <div style={{
            ...styles.status,
            ...(status.type === 'success' ? styles.statusSuccess : {}),
            ...(status.type === 'error' ? styles.statusError : {}),
            ...(status.type === 'info' ? styles.statusInfo : {})
          }}>
            {status.message}
          </div>
        )}

        {/* System Info */}
        <div style={styles.infoBox}>
          <h3 style={styles.infoTitle}>📋 System Information</h3>
          <ul style={styles.infoList}>
            <li><strong>Protocol:</strong> {window.location.protocol}</li>
            <li><strong>Bluetooth API:</strong> {isSupported ? '✅ Available' : '❌ Not Available'}</li>
            <li><strong>Browser:</strong> {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                                          navigator.userAgent.includes('Edge') ? 'Edge' : 
                                          navigator.userAgent.includes('Opera') ? 'Opera' : 'Other'}</li>
            <li><strong>Platform:</strong> {navigator.platform}</li>
          </ul>
        </div>

        {/* Receipt Preview */}
        <div style={styles.preview}>
          <h3 style={styles.previewTitle}>Receipt Preview</h3>
          <pre style={styles.previewContent}>{formatPreview()}</pre>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button
            onClick={handleTestConnection}
            disabled={!isSupported || isTesting}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              ...((!isSupported || isTesting) ? styles.buttonDisabled : {})
            }}
          >
            {isTesting ? '⏳ Testing...' : '🧪 Test Connection'}
          </button>

          <button
            onClick={handlePrintReceipt}
            disabled={!isSupported || isPrinting}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              ...((!isSupported || isPrinting) ? styles.buttonDisabled : {})
            }}
          >
            {isPrinting ? '⏳ Printing...' : '🖨️ Print Receipt'}
          </button>
        </div>

        {/* Instructions */}
        <div style={styles.instructions}>
          <h3 style={styles.instructionsTitle}>📖 Testing Instructions</h3>
          <ol style={styles.instructionsList}>
            <li>Ensure your printer is turned on and in pairing mode</li>
            <li>Click "Test Connection" to verify Bluetooth pairing</li>
            <li>Select your printer from the device list</li>
            <li>Once connected, click "Print Receipt" to print the example bill</li>
            <li>Check the printed output for formatting and alignment</li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <div style={styles.troubleshooting}>
          <h3 style={styles.troubleshootingTitle}>⚠️ Troubleshooting</h3>
          <ul style={styles.troubleshootingList}>
            <li><strong>Printer not appearing:</strong> Ensure it's on, in range, and not connected to another device</li>
            <li><strong>Connection fails:</strong> Try turning the printer off and on again</li>
            <li><strong>Nothing prints:</strong> Check if the printer uses different UUIDs (see console logs)</li>
            <li><strong>Garbled output:</strong> Printer may not support ESC/POS commands</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Inline styles for the test page
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px'
  },
  status: {
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  statusSuccess: {
    background: '#d4edda',
    border: '1px solid #c3e6cb',
    color: '#155724'
  },
  statusError: {
    background: '#f8d7da',
    border: '1px solid #f5c6cb',
    color: '#721c24'
  },
  statusInfo: {
    background: '#d1ecf1',
    border: '1px solid #bee5eb',
    color: '#0c5460'
  },
  infoBox: {
    background: '#e7f3ff',
    border: '1px solid #2196F3',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#0d47a1'
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '14px',
    color: '#0d47a1'
  },
  preview: {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  },
  previewTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333'
  },
  previewContent: {
    fontFamily: '"Courier New", monospace',
    fontSize: '12px',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre',
    overflow: 'auto'
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  button: {
    flex: 1,
    minWidth: '150px',
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  buttonSecondary: {
    background: '#6c757d',
    color: 'white'
  },
  buttonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  instructions: {
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  },
  instructionsTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#856404'
  },
  instructionsList: {
    marginLeft: '20px',
    fontSize: '14px',
    color: '#856404',
    lineHeight: '1.8'
  },
  troubleshooting: {
    background: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    padding: '20px'
  },
  troubleshootingTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#721c24'
  },
  troubleshootingList: {
    marginLeft: '20px',
    fontSize: '13px',
    color: '#721c24',
    lineHeight: '1.8'
  }
};

// Made with Bob
