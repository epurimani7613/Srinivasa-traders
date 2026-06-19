import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Package,
  Plus,
  Search,
  Trash2,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  Edit2,
  Mic,
  MicOff,
  User,
  Moon,
  Sun,
  Archive,
  RotateCcw
} from 'lucide-react';

const translations = {
  en: {
    shopName: "Srinivasa Traders",
    shopTagline: "Your Trusted Trading Partner",
    inventoryManager: "Inventory Manager",
    inventoryManagerSub: "Add or update products in database",
    prodId: "Product ID / Code",
    prodName: "Product Name",
    prodPrice: "Unit Price (₹)",
    saveProduct: "Save Product Details",
    saving: "Saving...",
    inventory: "Inventory Catalog",
    inventorySub: "List of available items. Click to edit.",
    searchProducts: "Search products...",
    noProductsFound: "No products found matching query.",
    customerName: "Customer Name",
    customerNamePlaceholder: "Enter customer name...",
    clearCustomer: "Clear",
    billingTerminal: "Billing Terminal",
    billingTerminalSub: "Type product number or name to search and add",
    scanOrType: "Scan or type ID / Name...",
    addItem: "Add Item",
    activeInvoice: "Active Invoice",
    clearInvoice: "Clear Invoice",
    parkBill: "Park Bill",
    parkedBills: "Parked Bills",
    noBillsParked: "No bills parked",
    restoreBill: "Restore",
    deleteBill: "Delete",
    parkedAt: "Parked at",
    colSl: "Sl.",
    colCode: "Code",
    colName: "Product Name",
    colRate: "Rate",
    colQty: "Quantity",
    colTotal: "Total",
    colAction: "Action",
    noItemsAdded: "No items added yet. Type in billing terminal above.",
    totalItems: "Total Items in Bill",
    grandTotal: "Grand Total",
    printInvoice: "Print Invoice",
    dbConnection: "Database Connection",
    livePg: "Live PostgreSQL",
    dbSub: "Supabase cloud · Port 5432 Direct",
    activeInv: "Active Inventory",
    invSubtext: "Seeded Kiranam & Wholesale catalog",
    sessionInvoice: "Current Session Invoice",
    units: "units",
    cashierConsoleActive: "Cashier console mode: Active",
    receiptDate: "Date/Time:",
    receiptTotalQty: "Total Quantity:",
    receiptGrandTotal: "GRAND TOTAL:",
    receiptFooter: "Thank you for shopping with us! Please visit again.",
    qtyFor: "Quantity for"
  },
  te: {
    shopName: "శ్రీనివాస ట్రేడర్స్",
    shopTagline: "మీ నమ్మకమైన వ్యాపార భాగస్వామి",
    inventoryManager: "సరుకుల నిర్వాహణ",
    inventoryManagerSub: "డేటాబేస్ లో కొత్త సరుకులను చేర్చండి లేదా సవరించండి",
    prodId: "సరుకు సంఖ్య / కోడ్",
    prodName: "సరుకు పేరు",
    prodPrice: "ధర (₹)",
    saveProduct: "సరుకు వివరాలు సేవ్ చేయి",
    saving: "సేవ్ అవుతోంది...",
    inventory: "సరుకుల జాబితా",
    inventorySub: "అందుబాటులో ఉన్న సరుకులు. సవరించడానికి క్లిక్ చేయండి.",
    searchProducts: "సరుకులను వెతకండి...",
    noProductsFound: "జాబితాలో ఏమీ లభించలేదు.",
    customerName: "కస్టమర్ పేరు",
    customerNamePlaceholder: "కస్టమర్ పేరు నమోదు చేయండి...",
    clearCustomer: "తొలగించు",
    billingTerminal: "బిల్లింగ్ టెర్మినల్",
    billingTerminalSub: "సరుకు నంబర్ లేదా పేరు టైప్ చేసి బిల్లులో చేర్చండి",
    scanOrType: "కోడ్ లేదా పేరు టైప్ చేయండి...",
    addItem: "చేర్చు",
    activeInvoice: "ప్రస్తుత బిల్లు",
    clearInvoice: "బిల్లు తొలగించు",
    parkBill: "బిల్లు పార్క్ చేయి",
    parkedBills: "పార్క్ చేసిన బిల్లులు",
    noBillsParked: "పార్క్ చేసిన బిల్లులు లేవు",
    restoreBill: "తిరిగి తీసుకురా",
    deleteBill: "తొలగించు",
    parkedAt: "పార్క్ చేసిన సమయం",
    colSl: "వ.సంఖ్య",
    colCode: "కోడ్",
    colName: "సరుకు పేరు",
    colRate: "ధర",
    colQty: "పరిమాణం",
    colTotal: "మొత్తం",
    colAction: "చర్య",
    noItemsAdded: "బిల్లులో ఇంకా ఏమీ చేర్చలేదు. బిల్లింగ్ ప్రారంభించడానికి పైన టైప్ చేయండి.",
    totalItems: "మొత్తం సరుకులు",
    grandTotal: "మొత్తం బిల్లు ధర",
    printInvoice: "బిల్లు ప్రింట్ చేయి",
    dbConnection: "డేటాబేస్ అనుసంధానం",
    livePg: "లైవ్ పోస్ట్‌గ్రేSQL",
    dbSub: "సుపాబేస్ క్లౌడ్ · పోర్ట్ 5432 డైరెక్ట్",
    activeInv: "యాక్టివ్ ఇన్వెంటరీ",
    invSubtext: "సరుకుల కేటలాగ్ అప్‌డేట్ చేయబడింది",
    sessionInvoice: "ప్రస్తుత బిల్లు మొత్తం",
    units: "యూనిట్లు",
    cashierConsoleActive: "క్యాషియర్ కన్సోల్: యాక్టివ్",
    receiptDate: "తేదీ/సమయం:",
    receiptTotalQty: "మొత్తం పరిమాణం:",
    receiptGrandTotal: "మొత్తం బిల్లు:",
    receiptFooter: "మా వద్ద కొనుగోలు చేసినందుకు ధన్యవాదాలు! దయచేసి మళ్ళీ విచ్చేయండి.",
    qtyFor: "పరిమాణం"
  }
};

export default function App() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [billItems, setBillItems] = useState([]);
  const [language, setLanguage] = useState('mix'); // 'en', 'te', 'mix'
  
  // Product Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [productMsg, setProductMsg] = useState(null);
  
  // Billing Form State
  const [billingEntry, setBillingEntry] = useState('');
  const [billingMsg, setBillingMsg] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Customer Name State
  const [customerName, setCustomerName] = useState('');
  
  // Parked Bills State with localStorage sync
  const [parkedBills, setParkedBills] = useState(() => {
    const saved = localStorage.getItem('parkedBills');
    return saved ? JSON.parse(saved) : [];
  });
  const [showParkedBillsDrawer, setShowParkedBillsDrawer] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Voice Command State
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  // Time & Date State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Refs
  const billingInputRef = useRef(null);
  const formIdRef = useRef(null);
  const suggestionsRef = useRef(null);

  // ── Effects ───────────────────────────────────────────────────────────────
  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Fetch initial product list
  useEffect(() => {
    fetchProducts();
    
    // Live clock ticker
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Check Voice Support
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setVoiceSupported(false);
    }

    return () => clearInterval(timer);
  }, []);

  // Handle outside clicks to close autocomplete
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && event.target !== billingInputRef.current) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-generate suggestions when billing input changes
  useEffect(() => {
    if (!billingEntry.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = billingEntry.toLowerCase();
    const isNumericQuery = /^\d+$/.test(billingEntry.trim());
    
    const filtered = products.filter(p => {
      if (isNumericQuery) {
        // For pure numeric queries, check exact ID match first
        return p.id === billingEntry.trim();
      }
      // For text queries, use fuzzy/partial matching
      return p.id.toLowerCase().includes(query) || p.name.toLowerCase().includes(query);
    });
    
    setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    setShowSuggestions(filtered.length > 0);
    setSelectedSuggestionIndex(0); // auto-highlight the first option
  }, [billingEntry, products]);

  // Sync parkedBills with localStorage
  useEffect(() => {
    localStorage.setItem('parkedBills', JSON.stringify(parkedBills));
  }, [parkedBills]);

  // ── Voice Command Setup ────────────────────────────────────────────────────
  const startVoiceCommand = () => {
    if (!voiceSupported) {
      showTemporaryMsg(setBillingMsg, "⚠ Voice search not supported in this browser.", "error");
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.replace(/\.$/, ''); // remove trailing period
      setBillingEntry(transcript);
      billingInputRef.current?.focus();
      showTemporaryMsg(setBillingMsg, `🗣 Heard: "${transcript}"`, "success", 2000);
    };

    recognition.onerror = (event) => {
      console.error("Speech error", event.error);
      setIsListening(false);
      showTemporaryMsg(setBillingMsg, "⚠ Voice recognition failed. Try again.", "error");
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // ── Translation Helper ─────────────────────────────────────────────────────
  const t = (key) => {
    if (language === 'en') return translations.en[key];
    if (language === 'te') return translations.te[key];
    
    // MIX mode
    if (key === 'shopName') return "Srinivasa Traders (శ్రీనివాస ట్రేడర్స్)";
    if (key === 'shopTagline') return "మీ నమ్మకమైన భాగస్వామి · Your Trusted Trading Partner";
    if (key === 'receiptFooter') return "Thank you for shopping with us! · ధన్యవాదాలు! దయచేసి మళ్ళీ విచ్చేయండి.";
    
    // Generic combination for other elements
    const enVal = translations.en[key];
    const teVal = translations.te[key];
    if (enVal === teVal) return enVal;
    return `${enVal} / ${teVal}`;
  };

  // ── API Actions ────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      showTemporaryMsg(setProductMsg, "⚠ Could not load inventory from database server.", "error", 5000);
    }
  };

  const showTemporaryMsg = (setter, text, type, duration = 3000) => {
    setter({ text, type });
    if (duration > 0) {
      setTimeout(() => setter(null), duration);
    }
  };

  // Add or Update Product in DB
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const id = formId.trim();
    const name = formName.trim();
    const price = parseFloat(formPrice);

    // Validation
    if (!id) {
      showTemporaryMsg(setProductMsg, "Product ID / Code is required.", "error");
      formIdRef.current?.focus();
      return;
    }
    if (!name) {
      showTemporaryMsg(setProductMsg, "Product Name is required.", "error");
      return;
    }
    if (isNaN(price) || price < 0) {
      showTemporaryMsg(setProductMsg, "Enter a valid price (≥ 0).", "error");
      return;
    }

    setSavingProduct(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, price })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Save operation failed.");
      }

      // Check if product was updated or newly added in state
      setProducts(prev => {
        const index = prev.findIndex(p => p.id === id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = data.product;
          return updated;
        } else {
          return [...prev, data.product];
        }
      });

      // If this item is currently in the bill, update its information
      setBillItems(prevBill => 
        prevBill.map(item => 
          item.product.id === id 
            ? { ...item, product: data.product } 
            : item
        )
      );

      // Clear Form
      setFormId('');
      setFormName('');
      setFormPrice('');
      showTemporaryMsg(setProductMsg, `✔ "${data.product.name}" saved successfully.`, "success");
      formIdRef.current?.focus();
    } catch (err) {
      console.error(err);
      showTemporaryMsg(setProductMsg, `⚠ ${err.message || "Failed to communicate with database."}`, "error");
    } finally {
      setSavingProduct(false);
    }
  };

  // Pre-fill form for editing on clicking an item
  const handleEditProductClick = (prod) => {
    setFormId(prod.id);
    setFormName(prod.name);
    setFormPrice(prod.price);
    showTemporaryMsg(setProductMsg, `Editing "${prod.name}" (ID: ${prod.id})`, "success", 2000);
  };

  // Delete product on double-click
  const handleDeleteProduct = async (prod) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${prod.name} from the inventory?`
    );
    
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete operation failed.");
      }

      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== prod.id));
      
      // Remove from bill if present
      setBillItems(prevBill => prevBill.filter(item => item.product.id !== prod.id));
      
      showTemporaryMsg(setProductMsg, `✔ "${prod.name}" deleted successfully.`, "success");
    } catch (err) {
      console.error(err);
      showTemporaryMsg(setProductMsg, `⚠ ${err.message || "Failed to delete product."}`, "error");
    }
  };

  // ── Billing Actions ────────────────────────────────────────────────────────
  // Scroll helper for suggestions
  const scrollToSuggestion = (index) => {
    const suggestionBox = suggestionsRef.current;
    if (suggestionBox) {
      const items = suggestionBox.querySelectorAll('.suggestion-item');
      if (items[index]) {
        items[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  };

  // Add item to bill
  const addToBill = (product) => {
    setBillItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        showTemporaryMsg(setBillingMsg, `✔ Qty for "${product.name}" increased to ${existing.qty + 1}.`, "success");
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, qty: item.qty + 1 } 
            : item
        );
      } else {
        showTemporaryMsg(setBillingMsg, `✔ "${product.name}" added to bill.`, "success");
        return [...prev, { product, qty: 1 }];
      }
    });
    setBillingEntry('');
    setShowSuggestions(false);
    billingInputRef.current?.focus();
  };

  // Keyboard navigation for suggestions
  const handleBillingKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestionIndex(prev => {
          const newIndex = (prev + 1) % suggestions.length;
          scrollToSuggestion(newIndex);
          return newIndex;
        });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestionIndex(prev => {
          const newIndex = (prev - 1 + suggestions.length) % suggestions.length;
          scrollToSuggestion(newIndex);
          return newIndex;
        });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        addToBill(suggestions[selectedSuggestionIndex]);
      } else {
        // Direct exact match lookup
        const query = billingEntry.trim().toLowerCase();
        const product = products.find(p => p.id.toLowerCase() === query);
        if (product) {
          addToBill(product);
        } else if (billingEntry.trim()) {
          showTemporaryMsg(setBillingMsg, `⚠ Product "${billingEntry}" not found in inventory.`, "error");
        }
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Handle manual Qty changes
  const handleQtyChange = (index, val) => {
    let newQty = parseInt(val, 10);
    if (isNaN(newQty) || newQty < 1) {
      newQty = 1;
    }
    setBillItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qty: newQty };
      return updated;
    });
  };

  // Remove row from bill
  const handleRemoveRow = (index) => {
    const name = billItems[index]?.product?.name || 'Item';
    setBillItems(prev => prev.filter((_, i) => i !== index));
    showTemporaryMsg(setBillingMsg, `✔ Removed "${name}" from bill.`, "success");
  };

  // Clear bill
  const handleClearBill = () => {
    if (!billItems.length) return;
    if (window.confirm("Are you sure you want to clear the entire bill?")) {
      setBillItems([]);
      setCustomerName('');
      showTemporaryMsg(setBillingMsg, "✔ Current bill cleared.", "success");
    }
  };

  // Park current bill
  const handleParkBill = () => {
    if (!billItems.length) {
      showTemporaryMsg(setBillingMsg, "⚠ No items to park.", "error");
      return;
    }

    const parkedBill = {
      id: Date.now(),
      customerName: customerName || 'Guest',
      items: JSON.parse(JSON.stringify(billItems)), // Deep copy
      parkedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setParkedBills(prev => [...prev, parkedBill]);
    setBillItems([]);
    setCustomerName('');
    showTemporaryMsg(setBillingMsg, `✔ Bill parked for ${parkedBill.customerName}.`, "success");
  };

  // Restore a parked bill
  const handleRestoreBill = (parkedBill) => {
    if (billItems.length > 0) {
      showTemporaryMsg(setBillingMsg, "⚠ Please park or clear the current bill first.", "error");
      return;
    }

    setBillItems(parkedBill.items);
    setCustomerName(parkedBill.customerName === 'Guest' ? '' : parkedBill.customerName);
    setParkedBills(prev => prev.filter(b => b.id !== parkedBill.id));
    setShowParkedBillsDrawer(false);
    showTemporaryMsg(setBillingMsg, `✔ Bill restored for ${parkedBill.customerName}.`, "success");
  };

  // Delete a parked bill
  const handleDeleteParkedBill = (parkedBill) => {
    if (window.confirm(`Are you sure you want to delete the parked bill for ${parkedBill.customerName}?`)) {
      setParkedBills(prev => prev.filter(b => b.id !== parkedBill.id));
      showTemporaryMsg(setBillingMsg, `✔ Parked bill deleted.`, "success");
    }
  };

  // Print Bill Handler
  const handlePrint = () => {
    if (!billItems.length) {
      showTemporaryMsg(setBillingMsg, "⚠ Add items to the bill before printing.", "error");
      return;
    }
    window.print();
  };

  // ── Calculation Helpers ────────────────────────────────────────────────────
  const totalItemsCount = billItems.reduce((sum, item) => sum + item.qty, 0);
  const grandTotalAmount = billItems.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  const formatINR = (amount) => {
    return '₹ ' + Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDateTime = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }) + '  ·  ' + date.toLocaleTimeString('en-IN', {
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });
  };

  // Filter products for inventory grid
  const isNumericInventorySearch = /^\d+$/.test(inventorySearch.trim());
  const filteredProducts = products
    .filter(p => {
      if (isNumericInventorySearch) {
        // For pure numeric queries, check exact ID match first
        return p.id === inventorySearch.trim();
      }
      // For text queries, use fuzzy/partial matching
      return p.id.toLowerCase().includes(inventorySearch.toLowerCase()) ||
             p.name.toLowerCase().includes(inventorySearch.toLowerCase());
    })
    .sort((a, b) => Number(a.id) - Number(b.id)); // Sort by ID in ascending order

  return (
    <React.Fragment>
      {/* ═══════════════════════════════════════════════════════════════════════
         APPLICATION CONSOLE
         ═══════════════════════════════════════════════════════════════════════ */}
      <header className="site-header">
        <div className="header-inner">
          <div className="header-logo">
            <div className="logo-container">
              <ShoppingBag size={24} className="text-white" />
            </div>
            <div className="logo-text">
              <h1>{t('shopName')}</h1>
              <p>{t('shopTagline')}</p>
            </div>
          </div>
          
          <div className="header-meta" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {/* Parked Bills Button */}
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setShowParkedBillsDrawer(!showParkedBillsDrawer)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              title={t('parkedBills')}
            >
              <Archive size={18} />
              <span>{t('parkedBills')}</span>
              {parkedBills.length > 0 && (
                <span className="badge badge-sm badge-accent" style={{ position: 'absolute', top: '-5px', right: '-5px', minWidth: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {parkedBills.length}
                </span>
              )}
            </button>
            
            {/* Theme Toggle Button */}
            <button
              className="theme-toggle-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {/* Language Selector Segmented Buttons */}
            <div className="language-selector" style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                className={`btn btn-sm ${language === 'en' ? 'btn-accent' : 'btn-ghost'}`}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '5px', boxShadow: 'none', minWidth: '45px' }}
                onClick={() => setLanguage('en')}
              >
                ENG
              </button>
              <button
                className={`btn btn-sm ${language === 'te' ? 'btn-accent' : 'btn-ghost'}`}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '5px', boxShadow: 'none', minWidth: '45px' }}
                onClick={() => setLanguage('te')}
              >
                తెలుగు
              </button>
              <button
                className={`btn btn-sm ${language === 'mix' ? 'btn-accent' : 'btn-ghost'}`}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '5px', boxShadow: 'none', minWidth: '45px' }}
                onClick={() => setLanguage('mix')}
              >
                MIX
              </button>
            </div>

            <span className="meta-date">
              <Clock size={15} />
              <span>{formatDateTime(currentTime)}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Parked Bills Drawer */}
      {showParkedBillsDrawer && (
        <div className="parked-bills-overlay" onClick={() => setShowParkedBillsDrawer(false)}>
          <div className="parked-bills-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>{t('parkedBills')} ({parkedBills.length})</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowParkedBillsDrawer(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="drawer-content">
              {parkedBills.length === 0 ? (
                <div className="empty-state">
                  <Archive size={48} style={{ opacity: 0.3 }} />
                  <p>{t('noBillsParked')}</p>
                </div>
              ) : (
                <div className="parked-bills-list">
                  {parkedBills.map((bill) => (
                    <div key={bill.id} className="parked-bill-item">
                      <div className="bill-info">
                        <div className="bill-customer">
                          <User size={16} />
                          <strong>{bill.customerName}</strong>
                        </div>
                        <div className="bill-meta">
                          <span className="bill-items">{bill.items.length} items</span>
                          <span className="bill-total">
                            {formatINR(bill.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))}
                          </span>
                        </div>
                        <div className="bill-time">
                          <Clock size={12} />
                          <span>{bill.parkedAt}</span>
                        </div>
                      </div>
                      <div className="bill-actions">
                        <button
                          className="btn btn-sm btn-accent"
                          onClick={() => handleRestoreBill(bill)}
                          title={t('restoreBill')}
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleDeleteParkedBill(bill)}
                          title={t('deleteBill')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="app-layout">
        {/* ── Premium KPI Stats Bar (Grid Column Span) ── */}
        <div className="kpi-stats-bar" style={{ gridColumn: '1 / -1' }}>
          <div className="card kpi-card">
            <div className="kpi-content">
              <span className="kpi-label">{t('dbConnection')}</span>
              <div className="kpi-value-row">
                <span className="kpi-indicator green-glow"></span>
                <span className="kpi-value">{t('livePg')}</span>
              </div>
              <span className="kpi-subtext">{t('dbSub')}</span>
            </div>
          </div>
          <div className="card kpi-card">
            <div className="kpi-content">
              <span className="kpi-label">{t('activeInv')}</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{products.length} {language === 'te' ? 'వస్తువులు' : 'Items'}</span>
              </div>
              <span className="kpi-subtext">{t('invSubtext')}</span>
            </div>
          </div>
          <div className="card kpi-card">
            <div className="kpi-content">
              <span className="kpi-label">{t('sessionInvoice')}</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{totalItemsCount} {t('units')} · {formatINR(grandTotalAmount)}</span>
              </div>
              <span className="kpi-subtext">{t('cashierConsoleActive')}</span>
            </div>
          </div>
        </div>

        {/* ── Left Column: Inventory & Product Management ── */}
        <aside className="left-panel">
          
          {/* Card: Product Management */}
          <section className="card">
            <div className="card-header">
              <div className="card-icon-wrap">
                <Package size={18} />
              </div>
              <h2 className="card-title">{t('inventoryManager')}</h2>
            </div>
            <p className="card-subtitle">{t('inventoryManagerSub')}</p>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label htmlFor="prod-id">{t('prodId')}</label>
                <input
                  ref={formIdRef}
                  id="prod-id"
                  type="text"
                  placeholder="e.g. P020"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  disabled={savingProduct}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-name">{t('prodName')}</label>
                <input
                  id="prod-name"
                  type="text"
                  placeholder="e.g. Sugar Premium"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={savingProduct}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-price">{t('prodPrice')}</label>
                <input
                  id="prod-price"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  disabled={savingProduct}
                  autoComplete="off"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={savingProduct}
              >
                {savingProduct ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                <span>{savingProduct ? t('saving') : t('saveProduct')}</span>
              </button>
            </form>

            {productMsg && (
              <div className={`inline-msg ${productMsg.type}`} role="alert">
                {productMsg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                <span>{productMsg.text}</span>
              </div>
            )}
          </section>

          {/* Card: Inventory List */}
          <section className="card">
            <div className="card-header">
              <div className="card-icon-wrap">
                <Search size={18} />
              </div>
              <h2 className="card-title">{t('inventory')}</h2>
            </div>
            <p className="card-subtitle">{t('inventorySub')}</p>
            
            <div className="form-group inventory-search">
              <input
                type="text"
                placeholder={t('searchProducts')}
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                autoComplete="off"
              />
            </div>

            <ul className="inventory-list">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => (
                  <li
                    key={p.id}
                    className="inventory-item"
                    onClick={() => handleEditProductClick(p)}
                    onDoubleClick={() => handleDeleteProduct(p)}
                    title="Click to edit • Double-click to delete"
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="inv-id">{p.id}</span>
                    <span className="inv-name">{p.name}</span>
                    <span className="inv-price">{formatINR(p.price)}</span>
                    <Edit2 size={12} className="text-muted ml-1" style={{ opacity: 0.5 }} />
                  </li>
                ))
              ) : (
                <li className="inventory-empty">{t('noProductsFound')}</li>
              )}
            </ul>
          </section>
        </aside>

        {/* ── Right Column: Billing Operations ── */}
        <section className="right-panel">
          
          {/* Card: Customer Name Input */}
          <div className="card customer-name-card">
            <div className="card-header">
              <div className="card-icon-wrap">
                <User size={18} />
              </div>
              <h2 className="card-title">{t('customerName')}</h2>
            </div>
            
            <div className="customer-name-input-wrap">
              <input
                type="text"
                placeholder={t('customerNamePlaceholder')}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="customer-name-input"
                autoComplete="off"
              />
              {customerName && (
                <button
                  className="btn-clear-customer"
                  onClick={() => setCustomerName('')}
                  aria-label={t('clearCustomer')}
                  title={t('clearCustomer')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Card: Billing Counter */}
          <div className="card billing-counter-card">
            <div className="card-header">
              <div className="card-icon-wrap">
                <ShoppingBag size={18} className="text-indigo-400" />
              </div>
              <h2 className="card-title">{t('billingTerminal')}</h2>
            </div>
            <p className="card-subtitle">{t('billingTerminalSub')}</p>
            
            <div className="counter-input-wrap" style={{ position: 'relative' }}>
              <input
                ref={billingInputRef}
                type="text"
                id="billing-entry-field"
                placeholder={t('scanOrType')}
                value={billingEntry}
                onChange={(e) => setBillingEntry(e.target.value)}
                onKeyDown={handleBillingKeyDown}
                autoComplete="off"
                autoFocus
                style={{ paddingRight: '2.5rem' }}
              />
              <button 
                type="button"
                className={`btn btn-icon ${isListening ? 'pulse-anim text-danger' : 'text-muted'}`} 
                onClick={startVoiceCommand}
                title="Voice Search"
                style={{ 
                  position: 'absolute', 
                  right: '110px', /* space for Add Item button */
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 5,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isListening ? <Mic size={18} color="#ef4444" /> : <Mic size={18} />}
              </button>
              <button 
                className="btn btn-accent" 
                onClick={() => {
                  const query = billingEntry.trim().toLowerCase();
                  const found = products.find(p => p.id.toLowerCase() === query);
                  if (found) addToBill(found);
                  else showTemporaryMsg(setBillingMsg, `⚠ Exact ID match "${billingEntry}" not found.`, "error");
                }}
              >
                {t('addItem')}
              </button>

              {/* Autocomplete Dropdown list */}
              {showSuggestions && (
                <ul className="suggestion-box" ref={suggestionsRef}>
                  {suggestions.map((item, idx) => (
                    <li 
                      key={item.id}
                      className={`suggestion-item ${idx === selectedSuggestionIndex ? 'active' : ''}`}
                      onClick={() => addToBill(item)}
                      onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                    >
                      <span>
                        <span className="item-id">{item.id}</span>
                        <span> - {item.name}</span>
                      </span>
                      <span className="font-semibold">{formatINR(item.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {billingMsg && (
              <div className={`inline-msg ${billingMsg.type}`} role="alert">
                {billingMsg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                <span>{billingMsg.text}</span>
              </div>
            )}
          </div>

          {/* Card: Current Bill List */}
          <div className="card billing-table-card">
            <div className="card-header">
              <div className="table-header-action">
                <div>
                  <h2 className="card-title">{t('activeInvoice')}</h2>
                </div>
                {billItems.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-accent btn-sm" onClick={handleParkBill} title="Save current bill and start new one">
                      <Archive size={14} />
                      {t('parkBill')}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={handleClearBill}>
                      {t('clearInvoice')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="table-scroll-wrapper">
              <table className="bill-table">
                <thead>
                  <tr>
                    <th className="col-sl">{t('colSl')}</th>
                    <th className="col-pid">{t('colCode')}</th>
                    <th className="col-name">{t('colName')}</th>
                    <th className="col-price">{t('colRate')}</th>
                    <th className="col-qty">{t('colQty')}</th>
                    <th className="col-total">{t('colTotal')}</th>
                    <th className="col-action">{t('colAction')}</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map((item, index) => (
                    <tr key={`${item.product.id}-${index}`}>
                      <td className="col-sl">{index + 1}</td>
                      <td className="col-pid">{item.product.id}</td>
                      <td className="col-name">{item.product.name}</td>
                      <td className="col-price">{formatINR(item.product.price)}</td>
                      <td className="col-qty">
                        <input
                          type="number"
                          className="qty-input"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleQtyChange(index, e.target.value)}
                          aria-label={`${t('qtyFor')} ${item.product.name}`}
                        />
                      </td>
                      <td className="col-total">{formatINR(item.product.price * item.qty)}</td>
                      <td className="col-action">
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveRow(index)}
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {billItems.length === 0 && (
              <div className="bill-empty">
                <ShoppingBag className="empty-icon text-muted" size={48} />
                <p>{t('noItemsAdded')}</p>
              </div>
            )}
          </div>

          {/* Card: Summary and Printing */}
          <div className="card bill-summary-card">
            <div className="summary-details">
              <div className="summary-row">
                <span className="summary-label">{t('totalItems')}</span>
                <span className="summary-value">{totalItemsCount}</span>
              </div>
              <div className="summary-row summary-row--total">
                <span className="summary-label">{t('grandTotal')}</span>
                <span className="summary-value grand-total">{formatINR(grandTotalAmount)}</span>
              </div>
            </div>
            
            <button 
              className="btn btn-print"
              onClick={handlePrint}
              disabled={billItems.length === 0}
            >
              <Printer size={18} />
              <span>{t('printInvoice')}</span>
            </button>
          </div>

        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
         PRINT-ONLY INVOICE LAYOUT (Thermal Printer optimized)
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="print-area">
        <div className="receipt-header">
          <h1 className="receipt-shop-name">{t('shopName')}</h1>
          <p className="receipt-tagline">{t('shopTagline')}</p>
          {customerName && (
            <p className="receipt-customer">
              {t('customerName')}: <strong>{customerName}</strong>
            </p>
          )}
          <hr className="receipt-rule" />
          <p className="receipt-date">{t('receiptDate')} {formatDateTime(currentTime)}</p>
        </div>

        <table className="receipt-table">
          <thead>
            <tr>
              <th>{t('colSl')}</th>
              <th>{t('colName')}</th>
              <th>{t('colRate')}</th>
              <th>{t('colQty')[0] || t('colQty')}</th> {/* short abbreviation for table */}
              <th>{t('colTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {billItems.map((item, index) => (
              <tr key={`print-${item.product.id}-${index}`}>
                <td>{index + 1}</td>
                <td>
                  <div style={{ wordBreak: 'break-word' }}>{item.product.name}</div>
                  <div style={{ fontSize: '7.5pt', color: '#555' }}>[ID: {item.product.id}]</div>
                </td>
                <td>{formatINR(item.product.price)}</td>
                <td style={{ textAlign: 'center' }}>{item.qty}</td>
                <td>{formatINR(item.product.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="receipt-rule" />
        
        <div className="receipt-totals">
          <div className="receipt-row">
            <span>{t('receiptTotalQty')}</span>
            <span>{totalItemsCount}</span>
          </div>
          <div className="receipt-row receipt-grand">
            <span>{t('receiptGrandTotal')}</span>
            <span>{formatINR(grandTotalAmount)}</span>
          </div>
        </div>

        <p className="receipt-footer">
          {t('receiptFooter')}
        </p>
      </div>
    </React.Fragment>
  );
}
