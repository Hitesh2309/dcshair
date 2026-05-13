const prisma = require('../../db');

exports.createCustomer = async (req, res) => {
  try {
    const { consignees, buyers, notifyParties, contactPersons, ...customerData } = req.body;
    console.log(req.body);
    const customerEmailExists = await prisma.customer.findFirst({
      where: {
        email: customerData.email
      }
    });
    if (customerEmailExists) {
      return res.status(400).json({ error: 'Customer already exists' });
    }
    const createData = {
      ...customerData,
      createdBy: req.user.email
    };

    if (consignees && consignees.length > 0) {
      createData.consignees = { create: consignees };
    }
    if (buyers && buyers.length > 0) {
      createData.buyers = { create: buyers };
    }
    if (notifyParties && notifyParties.length > 0) {
      createData.notifyParties = { create: notifyParties };
    }
    if (contactPersons && contactPersons.length > 0) {
      createData.contactPersons = { create: contactPersons };
    }

    const customer = await prisma.customer.create({
      data: createData,
      include: {
        consignees: true,
        buyers: true,
        notifyParties: true,
        contactPersons: true
      }
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    // const customers = await prisma.customer.findMany({
    //    include: {
    //     contracts: {
    //       include: {
    //         termsOfPayment: true,
    //         products: true,
    //       }
    //     },
    //     consignees: true,
    //     buyers: true,
    //     notifyParties: true,
    //     contactPersons: true,
    //   },
    // });
        const customers = await prisma.customer.findMany();

    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
