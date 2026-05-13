





const PDFDocument = require("pdfkit");

exports.proformainvoice = async (req, res) => {
  try {
    const data = req.body;

    console.log("wvget",data);

    const {consignee,notifyParty,buyer}=data

    const consigneedetails=`${consignee.name} ,
${consignee.address} ,
USCI NUMBER: ${""},
CTC:${" "} ,TEL: ${consignee.phone}
${consignee.country} `


const NotifyPartydetails=`${notifyParty.name} ,
${notifyParty.address} ,
USCI NUMBER: ${""},
CTC:${" "} ,TEL: ${notifyParty.phone}
${notifyParty.country} `

const Buyerdetails =`${buyer.name} ,
${buyer.address} ,
USCI NUMBER: ${""},
CTC:${" "} ,TEL: ${buyer.phone}
${buyer.country} `

    

    const doc = new PDFDocument({
      size: "A4",
      margin: 20,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="proforma-invoice-${data.invoiceNo || "draft"}.pdf"`
    );

    doc.pipe(res);

    const pageWidth = 595;
    const startX = 25;
    const startY = 25;
    const width = 545;

    // outer border
    doc.rect(startX, startY, width, 780).stroke();

    // title
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("PROFORMA INVOICE", 175, 35);

    // ================= HEADER GRID =================
    doc.moveTo(25, 70).lineTo(570, 70).stroke();

    // verticals
    doc.moveTo(300, 70).lineTo(300, 340).stroke();
    doc.moveTo(430, 70).lineTo(430, 170).stroke();

    // horizontals
    [
      160,  
    ].forEach((y) => {
      doc.moveTo(25, y).lineTo(570, y).stroke();
    });

    // ---------------- EXPORTER ----------------
    doc.fontSize(8).font("Helvetica-Bold");
    doc.text("Exporter", 30, 75);

    doc.font("Helvetica");
    doc.text(data.customer?.name || "", 30, 88, { width: 250 });
    doc.text(data.customer?.address || "", 30, 103, { width: 250 });
    doc.text(
      `${data.customer?.city || ""} ${data.customer?.state || ""}`,
      30,
      118
    );
    doc.text(data.customer?.country || "", 30, 133);
    doc.text(data.customer?.phone || "", 30, 148);

    // ---------------- INVOICE META ----------------
    doc.font("Helvetica-Bold");
    doc.text("Proforma Invoice No. & Date", 305, 75);
    doc.font("Helvetica");
    doc.text(
      `${data.invoiceNo || ""} - ${data.invoiceDate || ""}`,
      305,
      88
    );

    doc.font("Helvetica-Bold");
    doc.text("Exporter's Ref.", 435, 75);

   doc.moveTo(300, 100).lineTo(570, 100).stroke();


    doc.text("Buyer's Order No. & Date", 305, 105);
    doc.text("L/C No. & Date", 435, 105);

    doc.font("Helvetica");
    doc.text(
      `${data.buyerOrderNo || ""} ${data.buyerOrderDate || ""}`,
      305,
      118
    );
    doc.text(`${data.lcNo || ""} ${data.lcDate || ""}`, 435, 118);

       doc.moveTo(300, 130).lineTo(570, 130).stroke();


    doc.font("Helvetica-Bold");
    doc.text("Other Reference(s)", 305, 135);
    doc.font("Helvetica");
    doc.text(data.otherRef || "", 305, 148);

    // ---------------- CONSIGNEE ----------------
    doc.font("Helvetica-Bold");
    doc.text("Consignee", 30, 165);

    doc.font("Helvetica");
    doc.text(consigneedetails || "", 30, 178, { width: 250 });

      doc.moveTo(25, 240).lineTo(300, 240).stroke();

    // doc.text(data.consignee?.address || "", 30, 193, { width: 250 });
    // doc.text(data.consignee?.country || "", 30, 208);
    // doc.text(data.consignee.phone,30,209)

    // ---------------- BUYER ----------------
    doc.font("Helvetica-Bold");
    doc.text("Buyer", 305, 165);

    doc.font("Helvetica");
    doc.text(Buyerdetails || "", 305, 178, { width: 250 });

          doc.moveTo(300, 250).lineTo(570, 250).stroke();

    

    // ---------------- NOTIFY PARTY ----------------
    doc.font("Helvetica-Bold");
    doc.text("Notify Party", 30, 250);

    doc.font("Helvetica");
    doc.text(NotifyPartydetails|| "", 30, 260, { width: 250 });

        // doc.moveTo(25, 290).lineTo(300, 290).stroke();
   

    // country rows
    doc.font("Helvetica-Bold");
    doc.text("Country of Origin of Goods", 305, 255);
    doc.text("Country of Final Destination", 430, 255);

    doc.font("Helvetica");
    doc.text(data.countryOfOrigin || "", 305, 270);
    doc.text(data.countryOfDestination || "", 430, 270);

    

      doc.moveTo(425, 250).lineTo(425, 290).stroke();
      doc.moveTo(300, 290).lineTo(570, 290).stroke();


    doc.font("Helvetica-Bold");
    doc.text("Terms of Delivery and Payment", 305, 300);
    // doc.text(`data`)

    doc.font("Helvetica");
    doc.text(
      data.termsOfPayment || "",
      305,
      300,
      { width: 250 }
    );

    // ================= SHIPPING TABLE =================
    doc.rect(25, 340, 545, 100).stroke();

    [365, 390, 415].forEach((y) => {
      doc.moveTo(25, y).lineTo(570, y).stroke();
    });

    doc.moveTo(160, 340).lineTo(160, 440).stroke();
    doc.moveTo(300, 340).lineTo(300, 440).stroke();
    doc.moveTo(430, 340).lineTo(430, 440).stroke();

    const shipping = [
      ["Pre-Carriage By", data.preCarriageBy],
      ["Vessel / Flight No.", data.operatingAirlines],
      ["Port of Discharge", data.portOfFinalDestination],
      // ["Place of Receipt", data.portOfLoading],
    ];

    let sy = 347;

    shipping.forEach(([label, value]) => {
      doc.font("Helvetica-Bold").fontSize(7).text(label, 30, sy);
      doc.font("Helvetica").text(value || "", 30, sy+5);
      sy += 25;
    });

    // ================= PRODUCT TABLE =================
    const tableTop = 440;

    doc.rect(25, tableTop, 545, 290).stroke();

    [
      520, 560, 600, 640, 680,
    ].forEach((y) => {
      doc.moveTo(25, y).lineTo(570, y).stroke();
    });

    [360, 420, 470, 520].forEach((x) => {
      doc.moveTo(x, tableTop).lineTo(x, 730).stroke();
    });

    doc.fontSize(7).font("Helvetica-Bold");

    doc.text("Description of Goods", 170, 447);
    doc.text("SIZE", 365, 447);
    doc.text("Qty KGS", 425, 447);
    doc.text("Rate US$/KGS", 472, 447);
    doc.text("Amount US$", 525, 447);

    doc.font("Helvetica").fontSize(8);

    let rowY = 530;

    doc.text(data.description || "", 30, 535, {
      width: 320,
    });

    (data.items || []).forEach((item) => {
      doc.text(item.name || "", 30, rowY);
      doc.text(item.size || "-", 370, rowY);
      doc.text(String(item.quantity || 0), 425, rowY);
      doc.text(String(item.pricePerKg || 0), 475, rowY);
      doc.text(
        Number(item.totalAmount || 0).toFixed(2),
        525,
        rowY
      );
      rowY += 14;
    });

    // total
    const total = (data.items || []).reduce(
      (sum, item) => sum + Number(item.totalAmount || 0),
      0
    );

    doc.font("Helvetica-Bold").fontSize(9);
    doc.text(`TOTAL USD ${total.toFixed(2)}`, 450, 740);

    doc.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// exports.proformainvoice = async (req, res) => {
//   try {
//     const data = req.body;

//     const doc = new PDFDocument({
//       size: "A4",
//       margin: 20,
//     });


//     console.log("gvtrbgrt",doc);
    

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="proforma-invoice-${data.invoiceNo || "draft"}.pdf"`
//     );

//     doc.pipe(res);

//     const left = 30;
//     const right = 565;
//     let y = 30;

//     const drawLine = (yPos) => {
//       doc.moveTo(left, yPos).lineTo(right, yPos).stroke();
//     };

//     // const drawlineX = (xPos)

//     const box = (x, y, w, h) => {
//       doc.rect(x, y, w, h).stroke();
//     };

//     // ================= TITLE =================
//     doc.font("Helvetica-Bold").fontSize(16);
//     doc.text("PROFORMA INVOICE", left, y, { align: "center", width: 535 });
//     y += 25;

//     drawLine(y);
//     y += 10;

//     // ================= HEADER BLOCK =================
//     const headerStart = y;

//     doc.fontSize(9);

//     // LEFT: Exporter / Customer
//     doc.font("Helvetica-Bold").text("Exporter", left, y);
//     doc.font("Helvetica").text(data.customer?.name || "", left, y + 15);
//     doc.text(data.customer?.address || "", left, y + 30, { width: 250 });
//     doc.text(
//       `${data.customer?.city || ""} ${data.customer?.state || ""}`,
//       left,
//       y + 60
//     );
//     doc.text(data.customer?.country || "", left, y + 75);

//     // RIGHT: Invoice Info
//     doc.font("Helvetica-Bold").text(
//       "Proforma Invoice No. & Date",
//       320,
//       y
//     );

//     doc.font("Helvetica")  .text(`${data.invoiceNo || ""} - ${data.invoiceDate || ""}`, 320, y + 15)
//     // drawLine()
//       // .text(`${data.invoiceDate || ""}`, 32, y + 30)
//       // .text(`Buyer Order: ${data.buyerOrderNo || ""}`, 320, y + 45)
//       // .text(`LC No: ${data.lcNo || ""}`, 320, y + 60);

//     y += 110;

//     drawLine(y);
//     y += 10;

//     // ================= PARTIES =================
//     const section = (title, x, content) => {
//       doc.font("Helvetica-Bold").text(title, x, y);
//       doc.font("Helvetica").text(content, x, y + 15, { width: 250 });
//     };

//     section(
//       "Consignee",
//       left,
//       `${data.consignee?.name || ""}\n${data.consignee?.address || ""}\n${data.consignee?.country || ""}`
//     );

//     section(
//       "Buyer",
//       320,
//       `${data.buyer?.name || ""}\n${data.buyer?.address || ""}\n${data.buyer?.country || ""}`
//     );

//     y += 80;

//     drawLine(y);
//     y += 10;

//     // ================= SHIPPING INFO =================
//     doc.font("Helvetica-Bold").text("Shipping Details", left, y);

//     y += 15;

//     const shipping = [
//       ["Pre-Carriage", data.preCarriageBy],
//       ["Port Loading", data.portOfLoading],
//       ["Vessel", data.operatingAirlines],
//       ["Port Discharge", data.portOfFinalDestination],
//     ];

//     shipping.forEach(([k, v]) => {
//       doc.font("Helvetica-Bold").text(k + ":", left, y);
//       doc.font("Helvetica").text(v || "-", 150, y);
//       y += 14;
//     });

//     y += 10;

//     drawLine(y);
//     y += 10;

//     // ================= PRODUCT TABLE =================
//     doc.font("Helvetica-Bold").fontSize(9);
//     doc.text("Description", left, y);
//     doc.text("Size", 300, y);
//     doc.text("Qty", 370, y);
//     doc.text("Rate", 430, y);
//     doc.text("Amount", 490, y);

//     y += 15;
//     drawLine(y);
//     y += 10;

//     let total = 0;

//     (data.items || []).forEach((item) => {
//       doc.font("Helvetica").fontSize(8);

//       doc.text(item.name || "", left, y, { width: 260 });
//       doc.text(item.size || "-", 300, y);
//       doc.text(String(item.quantity || 0), 370, y);
//       doc.text(String(item.pricePerKg || 0), 430, y);

//       const amt = Number(item.totalAmount || 0);
//       total += amt;

//       doc.text(amt.toFixed(2), 490, y);

//       y += 18;
//     });

//     y += 10;
//     drawLine(y);
//     y += 10;

//     // ================= TOTAL =================
//     doc.font("Helvetica-Bold").fontSize(10);
//     doc.text(`TOTAL USD: ${total.toFixed(2)}`, 400, y);

//     doc.end();
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };