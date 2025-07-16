const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF certificate for a school and saves it to the uploads folder.
 * @param {string} schoolName - The name of the school.
 * @param {string} approvedDate - The approval date (string).
 * @returns {string} The file path of the generated certificate.
 */
function generateCertificate(schoolName, approvedDate) {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  const fileName = `certificate-${schoolName.replace(/\s+/g, '_')}-${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(28).text('Certificate of Accreditation', { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(20).text(`This is to certify that`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(24).text(schoolName, { align: 'center', underline: true });
  doc.moveDown();
  doc.fontSize(18).text(`has been approved for accreditation.`, { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(16).text(`Date Approved: ${approvedDate}`, { align: 'center' });
  doc.moveDown(4);
  doc.fontSize(14).text('Congratulations!', { align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { generateCertificate }; 