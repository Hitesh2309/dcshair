const prisma = require('../../db');
const { contractPdfGenerator } = require('./contractPdfGenerator');

// ─── helpers ───────────────────────────────────────────────────────────────
const PARTY_INCLUDE = {
  customer:      true,
  consignee:     true,
  buyer:         true,
  notifyParty:   true,
  contactPerson: true,
  termsOfPayment: true,
  contractItems: { include: { product: true } }
};

const optConnect = (id) => id ? { connect: { id: parseInt(id) } } : undefined;

// ─── createContract ────────────────────────────────────────────────────────
exports.createContract = async (req, res) => {
  try {
    const {
      name,
      customerId,
      consigneeId,
      buyerId,
      notifyPartyId,
      contactPersonId,
      termsOfPaymentId,
      items,
      countryOfOrigin,
      countryOfDestination,
      description,
      packing,
      insurance,
      preCarriageBy,
      portOfLoading,
      portOfFinalDestination,
      operatingAirlines,
      speacialCondition,
      note,
      expectedDepartureDate,
      expectedDeliveryDate
    } = req.body;

    const contract = await prisma.contract.create({
      data: {
        name,
        countryOfOrigin,
        countryOfDestination,
        description,
        packing,
        insurance,
        preCarriageBy,
        portOfLoading,
        portOfFinalDestination,
        operatingAirlines,
        speacialCondition,
        note,
        expectedDepartureDate: expectedDepartureDate ? new Date(expectedDepartureDate) : null,
        expectedDeliveryDate:  expectedDeliveryDate  ? new Date(expectedDeliveryDate)  : null,
        createdBy: req.user.email,
        customer:      { connect: { id: parseInt(customerId) } },
        termsOfPayment:{ connect: { id: parseInt(termsOfPaymentId) } },
        ...(consigneeId     && { consignee:     { connect: { id: parseInt(consigneeId) } } }),
        ...(buyerId         && { buyer:         { connect: { id: parseInt(buyerId) } } }),
        ...(notifyPartyId   && { notifyParty:   { connect: { id: parseInt(notifyPartyId) } } }),
        ...(contactPersonId && { contactPerson: { connect: { id: parseInt(contactPersonId) } } }),
        contractItems: {
          create: (items || []).map(item => ({
            product:     { connect: { id: parseInt(item.productId) } },
            quantity:    parseFloat(item.quantity),
            pricePerKg:  parseFloat(item.pricePerKg),
            totalAmount: parseFloat(item.quantity) * parseFloat(item.pricePerKg)
          }))
        }
      },
      include: PARTY_INCLUDE
    });
    res.status(201).json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(400).json({ error: error.message });
  }
};

// ─── getContracts ──────────────────────────────────────────────────────────
exports.getContracts = async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: PARTY_INCLUDE,
      orderBy: { createdAt: 'desc' }
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── getContractOptions ────────────────────────────────────────────────────
// Returns base lists. Customer-specific parties are fetched via getCustomerParties.
exports.getContractOptions = async (req, res) => {
  try {
    const [customers, products, termsOfPayment] = await Promise.all([
      prisma.customer.findMany({ select: { id: true, name: true } }),
      prisma.product.findMany({ select: { id: true, name: true, skuCode: true } }),
      prisma.termsOfPayment.findMany({ select: { id: true, name: true } })
    ]);
    res.json({ customers, products, termsOfPayment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── getCustomerParties ────────────────────────────────────────────────────
// Returns all consignees, buyers, notifyParties, contactPersons for a customer
exports.getCustomerParties = async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const [consignees, buyers, notifyParties, contactPersons] = await Promise.all([
      prisma.consignee.findMany({     where: { customerId }, select: { id: true, name: true, email: true, phone: true, address: true, city: true, country: true } }),
      prisma.buyer.findMany({         where: { customerId }, select: { id: true, name: true, email: true, phone: true, address: true, city: true, country: true } }),
      prisma.notifyParty.findMany({   where: { customerId }, select: { id: true, name: true, email: true, phone: true, address: true, city: true, country: true } }),
      prisma.contactPerson.findMany({ where: { customerId }, select: { id: true, name: true, email: true, phone: true } })
    ]);
    res.json({ consignees, buyers, notifyParties, contactPersons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── createParty ───────────────────────────────────────────────────────────
// Generic create for any sub-entity type belonging to a customer
exports.createParty = async (req, res) => {
  try {
    const { type, customerId, ...data } = req.body;
    const models = { consignee: 'consignee', buyer: 'buyer', notifyParty: 'notifyParty', contactPerson: 'contactPerson' };
    if (!models[type]) return res.status(400).json({ error: 'Invalid party type' });

    const record = await prisma[models[type]].create({
      data: { ...data, customerId: parseInt(customerId), createdBy: req.user.email }
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── createTermsOfPayment ──────────────────────────────────────────────────
exports.createTermsOfPayment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const term = await prisma.termsOfPayment.create({
      data: { name: name.trim(), createdBy: req.user.email }
    });
    res.status(201).json(term);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'This term already exists' });
    res.status(500).json({ error: error.message });
  }
};

// ─── PDF generation ────────────────────────────────────────────────────────
exports.getContractPdf = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const contract = await prisma.contract.findUnique({ where: { id }, include: PARTY_INCLUDE });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const pdfContract = { ...contract, items: contract.contractItems };
    const pdfBuffer = await contractPdfGenerator(pdfContract);
    const filename = `contract-${contract.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating contract PDF:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.previewContractPdf = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const contract = await prisma.contract.findUnique({ where: { id }, include: PARTY_INCLUDE });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const pdfContract = { ...contract, items: contract.contractItems };
    const pdfBuffer = await contractPdfGenerator(pdfContract);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error previewing contract PDF:', error);
    res.status(500).json({ error: error.message });
  }
};