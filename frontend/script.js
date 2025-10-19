
// GLOBAL STATE MANAGEMENT (Using localStorage)

// Helper function to safely get state from localStorage
const getState = (key, defaultValue) => {
    const data = localStorage.getItem(key);
    try {
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error("Error parsing state from localStorage:", e);
        return defaultValue;
    }
};

// Helper function to set state to localStorage
const setState = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Default initial hardcoded state (N$ currency)
const defaultProducts = [
    { id: 101, farmerId: 1, name: 'Maize', type: 'Crop', price: 4.50, unit: 'kg', Sell: 14950.50, harvested: 15000.50, defected: 50.00, image: 'maize.jpg', farm: 'Green Harvest' },
    { id: 201, farmerId: 1, name: 'Cattle', type: 'Livestock', price: 12000.00, unit: 'head', sell: 50, harvested: 50, defected: 0, image: 'cattle.jpg', farm: 'Green Harvest' }
];

// Load state or use defaults
let currentUser = getState('currentUser', { role: null, username: null, id: null });
let db_products = getState('db_products', defaultProducts);
let db_quotations = getState('db_quotations', []);
let db_transactions = getState('db_transactions', []);
let buyerCart = getState('buyerCart', []);

// Function to sync all state variables to localStorage
const syncState = () => {
    setState('currentUser', currentUser);
    setState('db_products', db_products);
    setState('db_quotations', db_quotations);
    setState('db_transactions', db_transactions);
    setState('buyerCart', buyerCart);
};

// INITIALIZATION AND NAVIGATION 

const initializePage = () => {
    const path = window.locaton.pathname;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Set Buyer Name
    if (document.getElementById('buyerTitle')) {
        document.getElementById('buyerTitle').textContent = ` Buyer Dashboard: ${currentUser.username || 'Marketplace'}`;
    }

    if (path.includes('farmer_dashboard.html')) {
        if (currentUser.role !== 'Farmer') {
            window.location.href = 'login.html';
            return;
        }
        document.getElementById('productForm').addEventListener('submit', handleAddProduct);
        showFarmerTab('farmer-add');
        
    } else if (path.includes('buyer_dashboard.html')) {
        if (currentUser.role !== 'Buyer') {
            window.location.href = 'login.html';
            return;
        }
        showBuyerTab('buyer-browse');
        renderMarketplace();
    } else if (path.includes('login.html')) {
        // Cleari state on login page
        currentUser = { role: null, username: null, id: null };
        syncState(); 
    }
};

window.showFarmerTab = (tabId) => {
    document.querySelectorAll('.farmer-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#farmer-dashboard .tab-button').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    document.querySelector(`#farmer-dashboard .tab-button[onclick*='${tabId}']`).classList.add('active');
    
    if (tabId === 'farmer-inventory') renderFarmerInventory();
    if (tabId === 'farmer-quotes') renderQuotes();
    if (tabId === 'farmer-reports') renderReports();
};

window.showBuyerTab = (tabId) => {
    document.querySelectorAll('.buyer-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#buyer-dashboard .tab-button').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    document.querySelector(`#buyer-dashboard .tab-button[onclick*='${tabId}']`).classList.add('active');
    
    if (tabId === 'buyer-cart') renderCart();
    if (tabId === 'buyer-quotes') renderBuyerQuotes();
};

// AUTHENTICATION
// (Login and Logout remain the same as previous step, ensuring correct redirects)
window.login = (role) => {
    const username = document.getElementById(`${role.toLowerCase()}Username`).value;
    const password = document.getElementById(`${role.toLowerCase()}Password`).value;
    
    if (role === 'Farmer' && username === 'farmer_john' && password === 'pass123') {
        currentUser.role = 'Farmer';
        currentUser.username = username;
        currentUser.id = 1;
        syncState();
        alert('Farmer Logged in successfully!');
        window.location.href = 'farmer_dashboard.html';
    } else if (role === 'Buyer' && username && password) {
        currentUser.role = 'Buyer';
        currentUser.username = username;
        currentUser.id = 2; 
        syncState();
        alert(`Buyer ${username} Logged in successfully!`);
        window.location.href = 'buyer_dashboard.html';
    } else {
        alert('Invalid credentials.');
    }
};

window.logout = () => {
    currentUser = { role: null, username: null, id: null };
    buyerCart = [];
    syncState();
    alert('Logged out.');
    window.location.href = 'login.html';
};


//  FARMER: INVENTORY MANAGEMENT 

const handleAddProduct = (e) => {
    e.preventDefault();
    
    const id = Date.now();
    const name = document.getElementById('productName').value;
    const type = document.getElementById('productType').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const harvested = parseFloat(document.getElementById('harvestedQty').value);
    const defected = parseFloat(document.getElementById('defectedQty').value);
    const sellable = harvested - defected;
    const imageInput = document.getElementById('productImage');
    const image = imageInput.files.length > 0 ? imageInput.files[0].name : 'placeholder-product.jpg';

    if (sellable < 0) {
        alert("Defected quantity cannot exceed harvested quantity.");
        return;
    }

    const unit = type === 'Crop' ? 'kg' : 'head';

    const newProduct = {
        id: id,
        farmerId: currentUser.id,
        name: name,
        type: type,
        price: price,
        unit: unit,
        sellable: sellable,
        harvested: harvested,
        defected: defected,
        image: image,
        farm: 'Green Acres Farm'
    };

    db_products.push(newProduct);
    syncState();
    alert(`${name} added! Sellable stock: ${sellable} ${unit}.`);
    e.target.reset();
    
    renderFarmerInventory();
    renderMarketplace();
};

const renderFarmerInventory = () => {
    const list = document.getElementById('inventoryList');
    if (!list) return;

    list.innerHTML = '';
    
    db_products.filter(p => p.farmerId === currentUser.id).forEach(product => {
        const item = document.createElement('div');
        item.className = 'product-card';
        item.innerHTML = `
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <strong>${product.name} (${product.type})</strong><br>
                <span class="price">N$${product.price.toFixed(2)}/${product.unit}</span><br>
                <small>Sellable Stock: ${product.sellable.toFixed(2)} ${product.unit}</small>
                <p><small>Harvested: ${product.harvested.toFixed(2)} | Defected: ${product.defected.toFixed(2)}</small></p>
            </div>
        `;
        list.appendChild(item);
    });
};

//  BUYER: MARKETPLACE & CART

const renderMarketplace = () => {
    const list = document.getElementById('marketplaceList');
    if (!list) return;

    list.innerHTML = '';
    
    db_products.filter(p => p.sellable > 0).forEach(product => {
        const item = document.createElement('div');
        item.className = 'product-card';
        item.innerHTML = `
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <strong>${product.name} (${product.type})</strong> - ${product.farm}<br>
                <span class="price">N$${product.price.toFixed(2)}/${product.unit}</span><br>
                <span>Available: ${product.sellable.toFixed(2)} ${product.unit}</span>
                <div style="margin-top: 10px;">
                    <input type="number" id="buyQty${product.id}" placeholder="Quantity" min="1" max="${product.sellable}" style="width: 100%; margin-bottom: 0;">
                    <button onclick="addToCart(${product.id})" style="width: 100%;">Add to Cart</button>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
};

window.addToCart = (productId) => {
    const product = db_products.find(p => p.id === productId);
    const quantityInput = document.getElementById(`buyQty${productId}`);
    const quantity = parseFloat(quantityInput.value);

    if (!quantity || quantity <= 0 || quantity > product.sellable) {
        alert(`Please enter a valid quantity up to ${product.sellable.toFixed(2)} ${product.unit}.`);
        return;
    }

    const existingCartItem = buyerCart.find(item => item.id === productId);
    if (existingCartItem) {
        existingCartItem.quantity += quantity;
    } else {
        buyerCart.push({
            ...product,
            quantity: quantity,
            cartId: Date.now()
        });
    }

    syncState();
    alert(`${quantity} ${product.unit} of ${product.name} added to cart.`);
    quantityInput.value = '';
    document.getElementById('cartCount').textContent = buyerCart.length;
};

const renderCart = () => {
    const list = document.getElementById('cartSummaryList');
    if (!list) return;

    list.innerHTML = '';
    let total = 0;
    
    if (buyerCart.length === 0) {
        list.innerHTML = '<p>Your cart is empty.</p>';
        document.getElementById('cartTotal').textContent = '0.00';
        document.querySelector('#buyer-cart button').disabled = true;
        return;
    }

    document.querySelector('#buyer-cart button').disabled = false;

    buyerCart.forEach(item => {
        const itemTotal = item.quantity * item.price;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <strong>${item.name}</strong> (${item.farm})<br>
                ${item.quantity.toFixed(2)} ${item.unit} @ N$${item.price.toFixed(2)}/${item.unit} 
            </div>
            <div>
                <strong>N$${itemTotal.toFixed(2)}</strong>
                <button class="danger" onclick="removeFromCart(${item.cartId})">Remove</button>
            </div>
        `;
        list.appendChild(cartItem);
    });

    document.getElementById('cartTotal').textContent = total.toFixed(2);
};

window.removeFromCart = (cartId) => {
    buyerCart = buyerCart.filter(item => item.cartId !== cartId);
    syncState();
    document.getElementById('cartCount').textContent = buyerCart.length;
    renderCart();
};

window.submitQuotation = () => {
    if (buyerCart.length === 0) {
        alert("Your cart is empty. Add products to submit a quotation.");
        return;
    }

    const newQuote = {
        id: db_quotations.length + 1,
        buyerUsername: currentUser.username,
        buyerId: currentUser.id,
        items: buyerCart.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
            farmerId: item.farmerId,
            unit: item.unit
        })),
        totalAmount: buyerCart.reduce((sum, item) => sum + item.quantity * item.price, 0),
        status: 'Pending',
        sentDate: new Date().toISOString(),
        acceptanceDate: null
    };
    
    db_quotations.push(newQuote);
    buyerCart = [];
    syncState();

    alert("Quotation submitted successfully! View status in 'My Quotes' tab.");
    document.getElementById('cartCount').textContent = 0;
    showBuyerTab('buyer-quotes');
};

//  BUYER: QUOTE HISTORY 

const renderBuyerQuotes = () => {
    const list = document.getElementById('submittedQuotesList');
    if (!list) return;

    const buyerQuotes = db_quotations.filter(q => q.buyerId === currentUser.id).reverse();
    list.innerHTML = '';
    document.getElementById('myQuotesCount').textContent = buyerQuotes.length;

    if (buyerQuotes.length === 0) {
        list.innerHTML = '<p>You have not submitted any quotes.</p>';
        return;
    }

    buyerQuotes.forEach(quote => {
        const quoteDiv = document.createElement('div');
        quoteDiv.className = `quote-item ${quote.status}`;
        
        const detailsHtml = quote.items.map(item => 
            `<li>${item.name} (${item.quantity.toFixed(2)} ${item.unit}) @ N$${item.price.toFixed(2)}</li>`
        ).join('');

        const acceptDate = quote.acceptanceDate ? new Date(quote.acceptanceDate).toLocaleString() : 'N/A';
        const sentDate = new Date(quote.sentDate).toLocaleString();

        quoteDiv.innerHTML = `
            <div>
                <strong>Quote #${quote.id}</strong> | Sent: ${sentDate}<br>
                Status: <span class="status">${quote.status}</span> | Response Date: ${acceptDate}<br>
                <ul>${detailsHtml}</ul>
                <p><strong>Total Value: N$${quote.totalAmount.toFixed(2)}</strong></p>
            </div>
            <div>
                <button onclick="printQuote(${quote.id})">🖨️ Print</button>
                ${quote.status === 'Pending' ? `<button onclick="editQuote(${quote.id})">Edit</button>` : ''}
                ${quote.status === 'Pending' ? `<button class="danger" onclick="deleteQuote(${quote.id})">Delete</button>` : ''}
            </div>
        `;
        list.appendChild(quoteDiv);
    });
};

window.editQuote = (quoteId) => {
    if (!confirm("Editing a quote moves its items back to your cart. Continue?")) return;
    
    const quoteIndex = db_quotations.findIndex(q => q.id === quoteId);
    if (quoteIndex === -1) return;

    // Move items back to cart
    quote.items.forEach(item => {
        const existingCartItem = buyerCart.find(c => c.id === item.productId);
        if (existingCartItem) {
            existingCartItem.quantity += item.quantity;
        } else {
            buyerCart.push({ ...item, cartId: Date.now() });
        }
    });

    // Remove the pending quote
    db_quotations.splice(quoteIndex, 1);
    syncState();
    alert(`Quote #${quoteId} moved to cart for editing.`);
    
    document.getElementById('cartCount').textContent = buyerCart.length;
    showBuyerTab('buyer-cart');
};

window.deleteQuote = (quoteId) => {
    if (!confirm("Are you sure you want to delete this quote?")) return;
    
    db_quotations = db_quotations.filter(q => q.id !== quoteId);
    syncState();
    renderBuyerQuotes();
};

// FARMER: QUOTES & TRANSACTIONS 

const renderQuotes = () => {
    const pendingList = document.getElementById('pendingQuotesList');
    const completedList = document.getElementById('completedQuotesList');
    if (!pendingList || !completedList) return;

    const allFarmerQuotes = db_quotations.filter(q => q.items.some(item => item.farmerId === currentUser.id));
    const pending = allFarmerQuotes.filter(q => q.status === 'Pending');
    const completed = allFarmerQuotes.filter(q => q.status !== 'Pending').reverse();
    
    pendingList.innerHTML = '';
    completedList.innerHTML = '';
    document.getElementById('quoteCount').textContent = pending.length;

    if (pending.length === 0) pendingList.innerHTML = '<p>No pending quotations.</p>';
    if (completed.length === 0) completedList.innerHTML = '<p>No completed quotations.</p>';

    // Render Pending Quotes
    pending.forEach(quote => {
        // ... (Rendering logic remains similar to previous step) ...
        const quoteDiv = document.createElement('div');
        quoteDiv.className = 'quote-item Pending';
        const farmerItems = quote.items.filter(item => item.farmerId === currentUser.id);
        const detailsHtml = farmerItems.map(item => 
            `<li>${item.name} (${item.quantity.toFixed(2)} ${item.unit}) @ N$${item.price.toFixed(2)}</li>`
        ).join('');
        const farmerTotal = farmerItems.reduce((sum, item) => sum + item.total, 0);

        quoteDiv.innerHTML = `
            <div>
                <strong>Quote #${quote.id}</strong> from Buyer: ${quote.buyerUsername}<br>
                <small>Received: ${new Date(quote.sentDate).toLocaleString()}</small>
                <ul>${detailsHtml}</ul>
                <p><strong>Quote Value (Your Items): N$${farmerTotal.toFixed(2)}</strong></p>
            </div>
            <div>
                <button onclick="processQuote(${quote.id}, 'Accept')">Accept</button>
                <button class="danger" onclick="processQuote(${quote.id}, 'Reject')">Reject</button>
            </div>
        `;
        pendingList.appendChild(quoteDiv);
    });

    // Render Completed Quotes
    completed.forEach(quote => {
        const quoteDiv = document.createElement('div');
        quoteDiv.className = `quote-item ${quote.status}`;
        
        const detailsHtml = quote.items.map(item => 
            `<li>${item.name} (${item.quantity.toFixed(2)} ${item.unit}) @ N$${item.price.toFixed(2)}</li>`
        ).join('');
        const farmerTotal = quote.items.filter(item => item.farmerId === currentUser.id).reduce((sum, item) => sum + item.total, 0);

        quoteDiv.innerHTML = `
            <div class="printable-content" id="printQuote${quote.id}">
                <h2>Quote #${quote.id} (${quote.status})</h2>
                <p>Buyer: ${quote.buyerUsername}</p>
                <p>Received: ${new Date(quote.sentDate).toLocaleString()}</p>
                <p>Response Date: ${new Date(quote.acceptanceDate).toLocaleString()}</p>
                <ul>${detailsHtml}</ul>
                <p><strong>Total Sale: N$${farmerTotal.toFixed(2)}</strong></p>
            </div>
            <div>
                <span class="status">${quote.status}</span>
                <button onclick="printQuote(${quote.id})">🖨️ Print</button>
            </div>
        `;
        completedList.appendChild(quoteDiv);
    });
};

window.processQuote = (quoteId, action) => {
    const quote = db_quotations.find(q => q.id === quoteId);
    if (!quote) return;
    
    quote.acceptanceDate = new Date().toISOString(); // Record response date

    if (action === 'Reject') {
        quote.status = 'Rejected';
        alert(`Quote #${quoteId} rejected.`);
    } else if (action === 'Accept') {
        let success = true;
        const itemsToProcess = quote.items.filter(item => item.farmerId === currentUser.id);

        for (const item of itemsToProcess) {
            const product = db_products.find(p => p.id === item.productId);
            if (!product || product.sellable < item.quantity) {
                alert(`Stock Error: Cannot fulfill ${item.name}. Available: ${product.sellable} ${product.unit}. Quote rejected.`);
                quote.status = 'Rejected'; 
                success = false;
                break;
            }
        }

        if (success) {
            itemsToProcess.forEach(item => {
                const product = db_products.find(p => p.id === item.productId);
                product.sellable -= item.quantity;
                
                db_transactions.push({
                    id: db_transactions.length + 1,
                    quoteId: quote.id,
                    productId: item.productId,
                    productName: item.name,
                    quantity: item.quantity,
                    revenue: item.total,
                    buyerUsername: quote.buyerUsername,
                    date: new Date()
                });
            });

            quote.status = 'Accepted'; 
            alert(`Quote #${quoteId} accepted! Stock deducted and transactions logged.`);
        }
    }
    
    syncState();
    renderQuotes();
    renderReports();
    renderFarmerInventory();
    renderMarketplace();
    renderBuyerQuotes();
};


// FARMER: REPORTS & PRINTING 
const renderReports = () => {
    const farmerTransactions = db_transactions.filter(t => 
        db_products.find(p => p.id === t.productId && p.farmerId === currentUser.id)
    );

    let totalRevenue = 0;
    let totalTransactions = 0;
    let buyerSales = {};
    let totalHarvested = 0;
    let totalDefected = 0;
    let totalSold = 0;
    
    const currentMonth = new Date().getMonth();

    farmerTransactions.forEach(t => {
        if (new Date(t.date).getMonth() === currentMonth) {
             totalTransactions += 1;
             totalRevenue += t.revenue;
        }
        totalSold += t.quantity;
        buyerSales[t.buyerUsername] = (buyerSales[t.buyerUsername] || 0) + t.revenue;
    });
    
    db_products.filter(p => p.farmerId === currentUser.id).forEach(p => {
        totalHarvested += p.harvested;
        totalDefected += p.defected;
    });

    let biggestClient = 'N/A';
    let maxSales = 0;
    for (const buyer in buyerSales) {
        if (buyerSales[buyer] > maxSales) {
            maxSales = buyerSales[buyer];
            biggestClient = buyer;
        }
    }

    if (document.getElementById('reportTotalTransactions')) {
        document.getElementById('reportTotalTransactions').textContent = totalTransactions;
        document.getElementById('reportTotalRevenue').textContent = 'N$' + totalRevenue.toFixed(2);
        document.getElementById('reportBiggestClient').textContent = biggestClient;
        
        document.getElementById('reportTotalHarvested').textContent = totalHarvested.toFixed(2);
        document.getElementById('reportTotalDefected').textContent = totalDefected.toFixed(2);
        document.getElementById('reportTotalSold').textContent = totalSold.toFixed(2);
    }
};

window.printReport = (reportContainerId) => {
    const content = document.getElementById(reportContainerId).outerHTML;
    
    // Create print window logic
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Farm Report</title>');
    printWindow.document.write('<link rel="stylesheet" href="styles.css" media="print">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="printable-content">');
    printWindow.document.write(`<h2>Farm Performance Report - ${new Date().toLocaleDateString()}</h2>`);
    printWindow.document.write(content);
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 1000);
};

window.printQuote = (quoteId) => {
    const quoteElement = document.getElementById(`printQuote${quoteId}`);
    if (!quoteElement) {
        alert("Quote not found for printing.");
        return;
    }
    const content = quoteElement.outerHTML;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Quote Printout</title>');
    printWindow.document.write('<link rel="stylesheet" href="styles.css" media="print">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 1000);
};

document.addEventListener('DOMContentLoaded', initializePage);