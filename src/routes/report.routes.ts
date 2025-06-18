import { Router, Request, Response } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";

import { SaleModel } from "../models/sale.model";

interface Sales {
  id?: number;
  car_id: number;
  sale_date: Date;
  customer_name: string;
  sale_price: number;
  created_at?: Date;
  updated_at?: Date;
  make?: string; // Added
  model?: string; // Added
}

const PDFDocument = require("pdfkit");
const router = Router();

// S3 client setup - no credentials needed when using instance profile
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

router.get("/", async (req: Request, res: Response) => {
  try {
    // Fetch all sales
    const sales: Array<Sales> = await SaleModel.findAll();
    // Create a new PDF document
    const doc = new PDFDocument();
    let buffers: any[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      let pdfData = Buffer.concat(buffers);

      // Upload to S3
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_S3NAME || "gabo-tesis",
          Key: `reports/sales-report-${Date.now()}.pdf`,
          Body: Readable.from(pdfData),
          ContentType: "application/pdf",
        },
      });

      try {
        const result = await upload.done();
        res.json({
          message: "Report generated and uploaded successfully",
          location: result.Location,
          key: `reports/sales-report-${Date.now()}.pdf`,
        });
      } catch (err) {
        console.error("Error uploading to S3", err);
        res.status(500).json({ message: "Error uploading report to S3" });
      }
    });

    // Function to create table headers
    const createTableHeaders = (doc: typeof PDFDocument, tableTop: number) => {
      // Draw table headers with background
      doc
        .fillColor("#f0f0f0")
        .rect(40, tableTop - 10, 520, 30)
        .fill();

      doc.fillColor("#000000"); // Reset to black text
      doc.text("ID", 50, tableTop);
      doc.text("Car", 100, tableTop);
      doc.text("Customer", 200, tableTop);
      doc.text("Price", 300, tableTop);
      doc.text("Date", 400, tableTop);
    };

    // Function to add page number
    const addPageNumber = (
      doc: typeof PDFDocument,
      pageNumber: number,
      totalPages: number
    ) => {
      doc.fontSize(10);
      doc.text(`Page ${pageNumber} of ${totalPages}`, 0, 800, {
        align: "center",
      });
    };

    // Calculate total pages needed
    const ROWS_PER_PAGE = 15;
    const totalPages = Math.ceil(sales.length / ROWS_PER_PAGE);

    // Generate the PDF content
    doc.fontSize(20).text("Sales Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12);
    // Add generation date
    doc.text(`Generated on: ${new Date().toLocaleString()}`, {
      align: "right",
    });
    doc.moveDown();

    // Create table header
    const ROW_HEIGHT = 30;
    let currentPage = 1;
    let rowsOnCurrentPage = 0;
    let tableTop = 150;
    let position = tableTop;

    // Create initial table headers
    createTableHeaders(doc, tableTop);

    // Add sales data
    sales.forEach((sale, index) => {
      // Check if we need a new page
      if (rowsOnCurrentPage >= ROWS_PER_PAGE) {
        doc.addPage(); // Add new page
        currentPage++;
        rowsOnCurrentPage = 0;
        tableTop = 50; // Reset tableTop for new page
        position = tableTop;

        // Add page number
        // doc.moveDown();
        // addPageNumber(doc, currentPage, totalPages);

        // Add headers to new page
        createTableHeaders(doc, tableTop);
      }

      position = tableTop + (rowsOnCurrentPage + 1) * ROW_HEIGHT;

      // Add alternate row background
      if (rowsOnCurrentPage % 2 === 0) {
        doc
          .fillColor("#f9f9f9")
          .rect(40, position - 10, 520, 30)
          .fill();
        doc.fillColor("#000000"); // Reset to black text
      }

      // Add row data
      doc.text(sale.id!.toString(), 50, position);
      doc.text(`${sale.make || "N/A"} ${sale.model || "N/A"}`, 100, position);
      doc.text(sale.customer_name, 200, position);
      doc.text(`$${Number(sale.sale_price).toFixed(2)}`, 300, position);
      doc.text(new Date(sale.sale_date).toLocaleDateString(), 400, position);

      rowsOnCurrentPage++;
    });

    // Add total at the bottom of the last page
    const total = sales.reduce((sum, sale) => sum + Number(sale.sale_price), 0);
    doc.moveDown();
    doc.fontSize(14);
    doc.text(`Total Sales: $${total.toFixed(2)}`, { align: "right" });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating report" });
  }
});

// Add a new route to get the report
// router.get("/:filename", async (req: Request, res: Response) => {
//   try {
//     const signedUrl = await s3Client.getSignedUrl("getObject", {
//       Bucket: "gabo-tesis",
//       Key: req.params.filename,
//       Expires: 60 * 5, // URL expires in 5 minutes
//     });

//     res.json({ url: signedUrl });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error getting report URL" });
//   }
// });

export default router;
