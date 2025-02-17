document.addEventListener('DOMContentLoaded', () => {
    const productCodeInput = document.getElementById('productCode');
    const productQuantityInput = document.getElementById('productQuantity');
    const addButton = document.getElementById('addButton');
    const currentSalesList = document.getElementById('currentSalesList');
    const previousSalesList = document.getElementById('previousSalesList');
    const totalElement = document.getElementById('total');
    const exportButton = document.getElementById('exportButton');
    const registerProductButton = document.getElementById('registerProductButton');
  
    const registerProductModal = document.getElementById('registerProductModal');
    const closeBtn = document.querySelector('.close');
    const productNameInput = document.getElementById('productName');
    const productPriceInput = document.getElementById('productPrice');
    const registerProductForm = document.getElementById('registerProductForm');
  
    const paymentModal = document.getElementById('paymentModal');
    const paymentAmountInput = document.getElementById('paymentAmount');
    const confirmPaymentButton = document.getElementById('confirmPayment');
    const cancelPaymentButton = document.getElementById('cancelPayment');
    const paymentDetailsDiv = document.getElementById('paymentDetails');
    const paymentTypeSelect = document.getElementById('paymentType');
    const changeDetailsDiv = document.getElementById('changeDetails');
    const amountPaidInput = document.getElementById('amountPaid');
    const changeAmountDisplay = document.getElementById('changeAmount');
  
    let currentSales = JSON.parse(localStorage.getItem('currentSales')) || [];
    let previousSales = JSON.parse(localStorage.getItem('previousSales')) || [];
    let total = parseFloat(localStorage.getItem('total')) || 0;
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let currentSale = null;
  
    function saveState() {
      localStorage.setItem('currentSales', JSON.stringify(currentSales));
      localStorage.setItem('previousSales', JSON.stringify(previousSales));
      localStorage.setItem('total', total.toFixed(2));
      localStorage.setItem('products', JSON.stringify(products));
    }
  
    function showAlert(message, type = 'error') {
      const alertBox = document.createElement('div');
      alertBox.classList.add('alert-box', type);
      alertBox.textContent = message;
      document.body.appendChild(alertBox);
  
      setTimeout(() => {
        document.body.removeChild(alertBox);
      }, 3000);
    }
  
    function updateCurrentSalesList() {
      currentSalesList.innerHTML = '';
  
      const header = document.createElement('li');
      header.classList.add('sales-header');
      header.innerHTML = `
        <div class="item">Item</div>
        <div class="code">Código</div>
        <div class="quantity">Qtd.</div>
        <div class="price">Valor Unit.</div>
        <div class="subtotal">Subtotal</div>
      `;
      currentSalesList.appendChild(header);
  
      currentSales.forEach((sale, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <div class="item">${index + 1}</div>
          <div class="code">${sale.code}</div>
          <div class="quantity">${sale.quantity}</div>
          <div class="price">R$${sale.price.toFixed(2)}</div>
          <div class="subtotal">R$${sale.subtotal.toFixed(2)}</div>
          <button class="removeButton" data-index="${index}">Remover</button>
        `;
        currentSalesList.appendChild(listItem);
      });
  
      const removeButtons = document.querySelectorAll('.removeButton');
      removeButtons.forEach(button => {
        button.addEventListener('click', removeSale);
      });
  
      updateTotal();
      saveState();
    }
  
    function updatePreviousSalesList() {
      previousSalesList.innerHTML = '';
  
      const header = document.createElement('li');
      header.classList.add('sales-header');
      header.innerHTML = `
        <div class="item">Item</div>
        <div class="code">Código</div>
        <div class="quantity">Qtd.</div>
        <div class="price">Valor Unit.</div>
        <div class="subtotal">Subtotal</div>
      `;
      previousSalesList.appendChild(header);
  
      previousSales.forEach((sale, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <div class="item">${index + 1}</div>
          <div class="code">${sale.code}</div>
          <div class="quantity">${sale.quantity}</div>
          <div class="price">R$${sale.price.toFixed(2)}</div>
          <div class="subtotal">R$${sale.subtotal.toFixed(2)}</div>
        `;
        previousSalesList.appendChild(listItem);
      });
  
      saveState();
    }
  
    function updateTotal() {
      total = previousSales.reduce((acc, sale) => acc + sale.subtotal, 0);
      totalElement.textContent = `Total: R$ ${total.toFixed(2)}`;
      saveState();
    }
  
    async function addSale() {
      const code = productCodeInput.value.trim();
      const quantity = parseInt(productQuantityInput.value);
  
      if (code === '') {
        showAlert('Por favor, digite o código do produto.');
        return;
      }
  
      if (isNaN(quantity) || quantity <= 0) {
        showAlert('Por favor, digite uma quantidade válida.');
        return;
      }
  
      const product = products.find(p => p.code === code);
  
      if (!product) {
        showAlert('Produto não cadastrado.');
        return;
      }
  
      const subtotal = product.price * quantity;
  
      currentSales.push({
        code: code,
        quantity: quantity,
        price: product.price,
        subtotal: subtotal,
        name: product.name
      });
  
      updateCurrentSalesList();
      productCodeInput.value = '';
      productQuantityInput.value = '1';
      productCodeInput.focus();
  
      openPaymentModal();
      saveState();
    }
  
    function removeSale(event) {
      const index = event.target.dataset.index;
      currentSales.splice(index, 1);
      updateCurrentSalesList();
      saveState();
    }
  
    function exportSalesToTxt() {
      if (previousSales.length === 0) {
        showAlert('Não há vendas para exportar.');
        return;
      }
  
      let txtContent = "Relatório de Vendas do Dia\r\n\r\n";
      previousSales.forEach(sale => {
        txtContent += `Produto: ${sale.name}\r\n`;
        txtContent += `Código: ${sale.code}\r\n`;
        txtContent += `Quantidade: ${sale.quantity}\r\n`;
        txtContent += `Preço Unitário: R$${sale.price.toFixed(2)}\r\n`;
        txtContent += `Subtotal: R$${sale.subtotal.toFixed(2)}\r\n`;
        txtContent += "------------------------\r\n";
      });
      txtContent += `Total: R$ ${getTotalSales().toFixed(2)}\r\n`;
  
      const blob = new Blob([txtContent], {
        type: 'text/plain'
      });
  
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const second = String(now.getSeconds()).padStart(2, '0');
  
      const filename = `venda_${year}-${month}-${day}_${hour}-${minute}-${second}.txt`;
  
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      saveState();
    }
  
    function getTotalSales() {
      return previousSales.reduce((acc, sale) => acc + sale.subtotal, 0);
    }
  
    function registerProduct(event) {
      event.preventDefault();
  
      const code = document.getElementById('productCodeRegister').value.trim();
      const name = productNameInput.value.trim();
      const price = parseFloat(productPriceInput.value);
  
      if (code === '') {
        showAlert('Por favor, digite o código do produto.');
        return;
      }
  
      if (name === '') {
        showAlert('Por favor, digite o nome do produto.');
        return;
      }
  
      if (isNaN(price) || price <= 0) {
        showAlert('Por favor, digite um preço válido.');
        return;
      }
  
      if (products.find(p => p.code === code)) {
        showAlert('Este código de produto já está cadastrado.');
        return;
      }
  
      products.push({
        code: code,
        name: name,
        price: price
      });
  
      showAlert('Produto cadastrado com sucesso!', 'success');
  
      document.getElementById('productCodeRegister').value = '';
      productNameInput.value = '';
      productPriceInput.value = '';
  
      registerProductModal.style.display = 'none';
  
      saveState();
    }
  
    function openPaymentModal() {
      paymentModal.style.display = 'flex';
      paymentAmountInput.value = '';
      paymentAmountInput.focus();
      paymentDetailsDiv.innerHTML = '';
      changeDetailsDiv.style.display = 'none';
      amountPaidInput.value = '';
      changeAmountDisplay.textContent = '';
    }
  
    function closePaymentModal() {
      paymentModal.style.display = 'none';
  
      previousSales = previousSales.concat(currentSales);
      currentSales = [];
  
      updateCurrentSalesList();
      updatePreviousSalesList();
      updateTotal();
      saveState();
    }
  
    function confirmPayment() {
      const amountPaid = parseFloat(paymentAmountInput.value);
      const paymentType = paymentTypeSelect.value;
      let detailsHtml = '';
  
      if (isNaN(amountPaid) || amountPaid <= 0) {
        showAlert('Por favor, digite um valor de pagamento válido.');
        return;
      }
  
      if (paymentType === 'dinheiro') {
        const cashPaid = parseFloat(amountPaidInput.value);
  
        if (isNaN(cashPaid)) {
          showAlert('Por favor, digite um valor de dinheiro válido.');
          return;
        }
  
        if (cashPaid < getTotalCurrentSales()) {
          showAlert('Valor de dinheiro insuficiente.');
          return;
        }
  
        const change = cashPaid - getTotalCurrentSales();
  
        detailsHtml = `
          <p>Tipo de Pagamento: Dinheiro</p>
          <p>Valor Pago: R$ ${cashPaid.toFixed(2)}</p>
          <p>Troco: R$ ${change.toFixed(2)}</p>
        `;
  
  
      } else if (paymentType === 'cartao') {
        detailsHtml = `
          <p>Tipo de Pagamento: Cartão</p>
          <p>Valor Pago: R$ ${amountPaid.toFixed(2)}</p>
          <p>Sem troco.</p>
        `;
      } else if (paymentType === 'pix') {
        detailsHtml = `
          <p>Tipo de Pagamento: PIX</p>
          <p>Valor Pago: R$ ${amountPaid.toFixed(2)}</p>
          <p>Sem troco.</p>
        `;
      }
  
      paymentDetailsDiv.innerHTML = detailsHtml;
      closePaymentModal();
      saveState();
    }
  
    function getTotalCurrentSales() {
      return currentSales.reduce((acc, sale) => acc + sale.subtotal, 0);
    }
  
    addButton.addEventListener('click', addSale);
    exportButton.addEventListener('click', exportSalesToTxt);
    registerProductButton.addEventListener('click', () => {
      registerProductModal.style.display = 'flex';
    });
    closeBtn.addEventListener('click', () => {
      registerProductModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
      if (event.target == registerProductModal) {
        registerProductModal.style.display = 'none';
      }
      if (event.target == paymentModal) {
        paymentModal.style.display = 'none';
      }
    });
    registerProductForm.addEventListener('submit', registerProduct);
  
    confirmPaymentButton.addEventListener('click', confirmPayment);
    cancelPaymentButton.addEventListener('click', closePaymentModal);
  
    paymentTypeSelect.addEventListener('change', function() {
      if (this.value === 'dinheiro') {
        changeDetailsDiv.style.display = 'block';
        amountPaidInput.focus();
      } else {
        changeDetailsDiv.style.display = 'none';
        changeAmountDisplay.textContent = '';
      }
    });
  
    amountPaidInput.addEventListener('input', function() {
      const cashPaid = parseFloat(this.value);
  
      if (!isNaN(cashPaid)) {
        const change = cashPaid - getTotalCurrentSales();
        changeAmountDisplay.textContent = `Troco: R$ ${change.toFixed(2)}`;
      } else {
        changeAmountDisplay.textContent = '';
      }
    });
    updateCurrentSalesList();
    updatePreviousSalesList();
    updateTotal();
  });