const prisma = require('../../db');

exports.createCustomer = async (req, res) => {
  try {
    const customer = await prisma.customer.create({
      data: {
        ...req.body,
        createdBy: req.user.email
      }
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
