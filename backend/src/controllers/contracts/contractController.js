const prisma = require('../../db');
const { contractPdfGenerator } = require('./contractPdfGenerator');

exports.createContract = async (req, res) => {
  try {
    const {
      name,
      customerId,
      termsOfPaymentId,
      items, // Array of { productId, quantity, pricePerKg }
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
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        createdBy: req.user.email,
        customer: {
          connect: { id: parseInt(customerId) }
        },
        termsOfPayment: {
          connect: { id: parseInt(termsOfPaymentId) }
        },
        contractItems: {
          create: items.map(item => ({
            product: { connect: { id: parseInt(item.productId) } },
            quantity: parseFloat(item.quantity),
            pricePerKg: parseFloat(item.pricePerKg),
            totalAmount: parseFloat(item.quantity) * parseFloat(item.pricePerKg)
          }))
        }
      },
      include: {
        customer: true,
        termsOfPayment: true,
        contractItems: {
          include: {
            product: true
          }
        }
      }
    });
    res.status(201).json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getContracts = async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        customer: true,
        termsOfPayment: true,
        contractItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

exports.createTermsOfPayment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const term = await prisma.termsOfPayment.create({
      data: { name: name.trim(), createdBy: req.user.email }
    });
    res.status(201).json(term);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'This term already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getContractPdf = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        customer: true,
        termsOfPayment: true,
        contractItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Normalise for PDF generator which expects contract.items
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

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        customer: true,
        termsOfPayment: true,
        contractItems: { include: { product: true } }
      }
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

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