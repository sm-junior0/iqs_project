const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary (if not already configured elsewhere)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generates a PDF certificate for a school, saves it locally, and uploads to Cloudinary.
 * @param {string} schoolName - The name of the school.
 * @param {string} approvedDate - The approval date (string).
 * @returns {Promise<string>} The Cloudinary URL of the generated certificate.
 */
async function generateCertificate(schoolName, approvedDate) {
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

  // Wait for the file to finish writing, then upload to Cloudinary
  return new Promise((resolve, reject) => {
    stream.on('finish', async () => {
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          resource_type: 'raw',
          folder: 'iqs_certificates',
          public_id: path.parse(fileName).name,
          format: 'pdf',
        });
        resolve(result.secure_url);
      } catch (err) {
        reject(err);
      }
    });
    stream.on('error', reject);
  });
}

module.exports = { generateCertificate }; 