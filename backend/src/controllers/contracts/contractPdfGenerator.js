const PDFDocument = require('pdfkit');

// ── brand colours ──────────────────────────────────────────────────────────
const RED = '#C0392B';
const BLACK = '#1A1A1A';
const DGRAY = '#555555';
const LGRAY = '#F5F5F5';
const MGRAY = '#CCCCCC';

// ── page geometry ──────────────────────────────────────────────────────────
const PW = 595.28;
const PH = 841.89;
const ML = 50;
const MR = 50;
const CW = PW - ML - MR;

// ── helpers ────────────────────────────────────────────────────────────────
const fmt = {
    date: (d) => {
        if (!d) return 'N/A';
        const dt = d instanceof Date ? d : new Date(d);
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    num: (n, dec = 3) => Number(n).toLocaleString('en-IN', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
    }),
    money: (n) => Number(n).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }),
};

// ── draw DCS logo ──────────────────────────────────────────────────────────
function drawLogo(doc, x, y, size = 55) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.42;
    doc.circle(cx, cy, r).lineWidth(2).stroke(RED);
    doc.circle(cx, cy, r * 0.78).fillAndStroke('white', 'white');
    doc.fillColor(RED).font('Helvetica-Bold').fontSize(r * 0.55)
        .text('DCS', cx - r * 0.42, cy - r * 0.22, { width: r * 0.85, align: 'center', lineBreak: false });
    doc.strokeColor(RED).lineWidth(1.2);
    for (let i = 0; i < 3; i++) {
        const wy = cy + (i - 1) * 5;
        doc.moveTo(cx - r, wy).lineTo(cx - r * 1.7 - i * 3, wy - 2).stroke();
        doc.moveTo(cx + r, wy).lineTo(cx + r * 1.7 + i * 3, wy - 2).stroke();
    }
}

// ── horizontal rule ────────────────────────────────────────────────────────
function hRule(doc, y, color = MGRAY, thickness = 0.5) {
    doc.moveTo(ML, y).lineTo(PW - MR, y).lineWidth(thickness).stroke(color);
}

// ── table drawing ──────────────────────────────────────────────────────────
function drawTable(doc, startY, rows, colWidths, colAligns, fontSize = 7.5) {
    const rowH = 18;
    const padV = 4;
    const padH = 5;
    let y = startY;

    rows.forEach((row, ri) => {
        const isHeader = ri === 0;
        const isTotal = ri === rows.length - 1;
        const bgColor = isHeader ? RED : isTotal ? '#EEEEEE' : ri % 2 === 0 ? 'white' : LGRAY;

        let maxH = rowH;
        row.forEach((cell, ci) => {
            const lines = Math.ceil(
                doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                    .fontSize(isHeader ? fontSize - 0.5 : fontSize)
                    .widthOfString(String(cell)) / (colWidths[ci] - padH * 2)
            );
            maxH = Math.max(maxH, lines * (fontSize + 2) + padV * 2);
        });

        doc.rect(ML, y, CW, maxH).fill(bgColor);

        let x = ML;
        row.forEach((cell, ci) => {
            doc.font(isHeader || isTotal ? 'Helvetica-Bold' : 'Helvetica')
                .fontSize(isHeader ? fontSize - 0.5 : fontSize)
                .fillColor(isHeader ? 'white' : BLACK)
                .text(String(cell), x + padH, y + padV, {
                    width: colWidths[ci] - padH * 2,
                    align: colAligns[ci] || 'left',
                    lineBreak: true,
                });
            x += colWidths[ci];
        });

        doc.rect(ML, y, CW, maxH).lineWidth(0.3).stroke(MGRAY);
        let gx = ML;
        colWidths.forEach(w => { gx += w; doc.moveTo(gx, y).lineTo(gx, y + maxH).lineWidth(0.3).stroke(MGRAY); });

        y += maxH;
    });

    return y;
}

// ── key-value row ──────────────────────────────────────────────────────────
function kvRow(doc, y, label, value, labelW = 140) {
    const x2 = ML + labelW;
    const w2 = CW - labelW;
    const startY = y;
    doc.font('Helvetica-Bold').fontSize(7.8).fillColor(BLACK)
        .text(label, ML, y, { width: labelW - 4, lineBreak: false });
    doc.font('Helvetica').fontSize(7.8).fillColor(BLACK)
        .text(value || '-', x2, y, { width: w2, lineBreak: true, lineGap: 1 });
    return Math.max(doc.y, startY + 13);
}

// ══════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════
async function contractPdfGenerator(contract) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 0, info: { Title: `Contract ${contract.name}` } });
        const chunks = [];
        doc.on('data', c => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const {
            name: contractNo,
            createdAt,
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
            expectedDeliveryDate,
            customer,
            termsOfPayment,
            items = [],
        } = contract;

        // ── HEADER ────────────────────────────────────────────────────────────
        const headerTop = 28;
        drawLogo(doc, ML, headerTop, 58);

        const midX = PW / 2;
        doc.font('Helvetica-Bold').fontSize(7).fillColor(RED)
            .text('100 PERCENT INDIAN HUMAN HAIR EXPORTER', ML + 70, headerTop + 2, { width: CW - 70, align: 'center' });
        doc.font('Helvetica-Bold').fontSize(13).fillColor(BLACK)
            .text('THREE STAR EXPORT HOUSE ***', ML + 70, headerTop + 14, { width: CW - 70, align: 'center' });
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(BLACK)
            .text('(Recognized By The Government Of India)', ML + 70, headerTop + 31, { width: CW - 70, align: 'center' });
        doc.font('Helvetica').fontSize(7.5).fillColor(DGRAY)
            .text('Registered Office Address: Plot No. 81-B, Basement & Ground Floor, Sector-5, Imt Manesar, Gurugram, Haryana -122052 (INDIA)',
                ML + 70, headerTop + 46, { width: CW - 70, align: 'center' });

        const ctY = headerTop + 62;
        doc.font('Helvetica').fontSize(7.2).fillColor(DGRAY);
        doc.text('Email: dcs@dcshairs.com', ML + 70, ctY);
        doc.text('Phone: +91 11 4155 8352', ML + 70, ctY + 11);
        doc.text('Website: www.dcshairs.com', midX + 20, ctY);
        doc.text('Fax: +91 11 45038442', midX + 20, ctY + 11);

        hRule(doc, headerTop + 85, RED, 1.2);

        const refY = headerTop + 91;
        doc.font('Helvetica').fontSize(8).fillColor(BLACK)
            .text(`CONTRACT NO: ${contractNo}`, ML, refY, { width: CW, align: 'right' })
            .text(`Date: ${fmt.date(createdAt)}`, ML, refY + 12, { width: CW, align: 'right' });

        // ── CONTRACT TITLE ────────────────────────────────────────────────────
        let curY = headerTop + 125;
        doc.font('Helvetica-Bold').fontSize(13).fillColor(BLACK)
            .text('CONTRACT', ML, curY, { width: CW, align: 'center' });
        curY += 22;

        hRule(doc, curY);
        curY += 8;

        // ── PARTIES ───────────────────────────────────────────────────────────
        doc.font('Helvetica').fontSize(7.8).fillColor(BLACK)
            .text(
                'THIS CONTRACT IS MADE BETWEEN THE SELLER: DCS INTERNATIONAL TRADING COMPANY., ' +
                'ADDRESS: PLOT NO.81-B, BASEMENT & GROUND FLOOR, SECTOR-5, IMT MANESAR, ' +
                'GURUGRAM, HARYANA-122052 (INDIA)  AND',
                ML, curY, { width: CW, lineBreak: true, lineGap: 1 }
            );
        curY = doc.y + 4;

        // Buyer — all fields from the Customer record
        const buyerParts = [
            `THE BUYER:  ${customer.name}`,
            customer.address ? `ADDRESS: ${customer.address}` : null,
            (customer.city || customer.state || customer.country)
                ? `${[customer.city, customer.state, customer.country].filter(Boolean).join(', ')}` : null,
            customer.phone ? `TEL: ${customer.phone}` : null,
            customer.altPhone ? `ALT TEL: ${customer.altPhone}` : null,
            customer.email ? `E-Mail: ${customer.email}` : null,
        ].filter(Boolean).join('   ');

        doc.font('Helvetica').fontSize(7.8).fillColor(BLACK)
            .text(buyerParts, ML, curY, { width: CW, lineBreak: true, lineGap: 1 });
        curY = doc.y + 4;

        // Optional contract description
        if (description) {
            doc.font('Helvetica').fontSize(7.8).fillColor(BLACK)
                .text(description, ML, curY, { width: CW, lineBreak: true, lineGap: 1 });
            curY = doc.y + 4;
        }

        // Origin / destination line
        doc.font('Helvetica').fontSize(7.8).fillColor(BLACK)
            .text(`(COUNTRY OF ORIGIN: ${countryOfOrigin}   |   COUNTRY OF DESTINATION: ${countryOfDestination})`, ML, curY);
        curY = doc.y + 8;

        // ── ITEMS TABLE ───────────────────────────────────────────────────────
        const colW = [190, 75, 115, 115];
        const colA = ['left', 'center', 'center', 'center'];

        const tableRows = [
            ['PRODUCT / SIZE', 'QUANTITY\nKGS', 'PRICE/KG (USD)', 'TOTAL AMOUNT\nUS$'],
            ...items.map(it => [
                it.product?.name || '-',
                fmt.num(it.quantity),
                fmt.money(it.pricePerKg),
                fmt.money(it.totalAmount),
            ]),
            [
                'TOTAL',
                fmt.num(items.reduce((s, i) => s + Number(i.quantity), 0)),
                '',
                fmt.money(items.reduce((s, i) => s + Number(i.totalAmount), 0)),
            ],
        ];

        curY = drawTable(doc, curY, tableRows, colW, colA);
        curY += 6;

        hRule(doc, curY);
        curY += 8;

        // ── TERMS — all dynamic ───────────────────────────────────────────────
        const labelW = 170;

        let shipmentLine = ': AS PER MUTUAL AGREEMENT';
        if (expectedDepartureDate) {
            shipmentLine = `: LATEST BY ${fmt.date(expectedDepartureDate).toUpperCase()}`;
            if (expectedDeliveryDate) {
                shipmentLine += ` | EXPECTED DELIVERY BY ${fmt.date(expectedDeliveryDate).toUpperCase()}`;
            }
        }

        const terms = [
            ['COUNTRY OF ORIGIN', `: ${countryOfOrigin}`],
            ['COUNTRY OF DESTINATION', `: ${countryOfDestination}`],
            ['SHIPMENT', shipmentLine],
            ['INSURANCE', `: ${insurance || '-'}`],
            ['PACKING', `: ${packing || '-'}`],
            ['PAYMENT TERMS', `: ${termsOfPayment?.name || '-'}`],
            ['', ''],
            ['PRE CARRIAGE BY', `: ${preCarriageBy || '-'}`],
            ['PORT OF LOADING', `: ${portOfLoading || '-'}`],
            ['PORT OF FINAL DESTINATION', `: ${portOfFinalDestination || '-'}`],
            operatingAirlines ? ['OPERATING AIRLINES', `: ${operatingAirlines}`] : null,
            speacialCondition ? ['SPECIAL CONDITION', `: ${speacialCondition}`] : null,
            ['', ''],
            ['DOCUMENTS PROVIDED', ': INVOICE, PACKING LIST, AIRWAYBILL, FUMIGATION CERTIFICATE AND APTA COO IF REQUIRED.'],
            note ? ['PLEASE NOTE', `: ${note}`] : null,
        ].filter(Boolean);

        terms.forEach(([label, value]) => {
            if (!label && !value) { curY += 5; return; }
            curY = kvRow(doc, curY, label, value, labelW);
        });

        curY += 8;
        hRule(doc, curY);
        curY += 10;

        // ── SIGNATURE BLOCK ───────────────────────────────────────────────────
        const col1X = ML;
        const col2X = ML + CW / 2;

        doc.font('Helvetica').fontSize(8).fillColor(BLACK)
            .text('Signature of the Seller', col1X, curY)
            .text('Signature of the Buyer', col2X, curY);

        curY += 40;

        doc.font('Helvetica-Bold').fontSize(8).fillColor(BLACK)
            .text('For DCS International Trading Co.', col1X, curY);
        curY += 28;

        doc.font('Helvetica').fontSize(7.5).fillColor(DGRAY)
            .text('Auth. Signatory', col1X, curY);
        curY += 20;

        doc.font('Helvetica-Bold').fontSize(8).fillColor(BLACK)
            .text('DCS INTERNATIONAL TRADING CO.', col1X, curY)
            .text(customer.name.toUpperCase(), col2X, curY, { width: CW / 2, align: 'right' });
        curY += 12;

        doc.font('Helvetica').fontSize(7.5).fillColor(DGRAY)
            .text('Gurugram, Haryana — INDIA', col1X, curY);

        if (customer.address || customer.city) {
            doc.font('Helvetica').fontSize(7.5).fillColor(DGRAY)
                .text(
                    [customer.address, customer.city, customer.country].filter(Boolean).join(', '),
                    col2X, curY, { width: CW / 2, align: 'right' }
                );
        }

        doc.end();
    });
}

module.exports = { contractPdfGenerator };