require('dotenv').config();
const productController = require('./src/controllers/products/productController');

async function test() {
  const req = {
    body: {
      name: 'Test Product',
      skuCode: 'TEST-' + Date.now(),
      size: '100ml'
    },
    user: { email: 'test@example.com' }
  };
  const res = {
    status: function(code) {
      console.log('Status:', code);
      return this;
    },
    json: function(data) {
      console.log('JSON:', data);
      return this;
    }
  };

  await productController.createProduct(req, res);
}

test();
