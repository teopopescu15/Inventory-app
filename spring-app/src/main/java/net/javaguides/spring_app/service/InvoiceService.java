package net.javaguides.spring_app.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import net.javaguides.spring_app.entity.Order;
import net.javaguides.spring_app.entity.OrderItem;
import net.javaguides.spring_app.entity.User;
import net.javaguides.spring_app.repository.OrderItemRepository;
import net.javaguides.spring_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class InvoiceService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

    /**
     * Generate PDF invoice for an order
     * @param order the finalized order
     * @return byte array of PDF document
     */
    public byte[] generateInvoicePdf(Order order) {
        if (order.getStatus() != Order.OrderStatus.FINALIZED) {
            throw new RuntimeException("Cannot generate invoice for non-finalized order");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            // Initialize PDF writer and document
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Get company information
            User company = userRepository.findById(order.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found"));

            // Get order items
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());

            // Build PDF content
            addHeader(document, order);
            addCompanyInfo(document, company);
            addClientInfo(document, order);
            addItemsTable(document, items);
            addTotals(document, order);
            addFooter(document, order);

            // Close document
            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF invoice: " + e.getMessage(), e);
        }
    }

    /**
     * Add invoice header with title and invoice number
     */
    private void addHeader(Document document, Order order) {
        // Invoice title
        Paragraph title = new Paragraph("INVOICE")
                .setFontSize(24)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10);
        document.add(title);

        // Invoice number and date
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .useAllAvailableWidth();

        headerTable.addCell(new Cell()
                .add(new Paragraph("Invoice Number:")
                        .setBold())
                .add(new Paragraph(order.getInvoiceNumber()))
                .setBorder(null));

        headerTable.addCell(new Cell()
                .add(new Paragraph("Date:")
                        .setBold())
                .add(new Paragraph(order.getFinalizedAt().format(DATE_FORMATTER)))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null));

        document.add(headerTable);
        document.add(new Paragraph("\n"));
    }

    /**
     * Add company (from) information
     */
    private void addCompanyInfo(Document document, User company) {
        Paragraph fromLabel = new Paragraph("From:")
                .setBold()
                .setFontSize(12);
        document.add(fromLabel);

        Paragraph companyName = new Paragraph(company.getCompanyName())
                .setFontSize(14)
                .setBold();
        document.add(companyName);

        Paragraph companyEmail = new Paragraph(company.getCompanyEmail())
                .setFontSize(10);
        document.add(companyEmail);

        document.add(new Paragraph("\n"));
    }

    /**
     * Add client (bill to) information
     */
    private void addClientInfo(Document document, Order order) {
        Paragraph billToLabel = new Paragraph("Bill To:")
                .setBold()
                .setFontSize(12);
        document.add(billToLabel);

        Paragraph clientName = new Paragraph(order.getClientName())
                .setFontSize(12)
                .setBold();
        document.add(clientName);

        if (order.getClientCompany() != null && !order.getClientCompany().isEmpty()) {
            Paragraph clientCompany = new Paragraph(order.getClientCompany())
                    .setFontSize(10);
            document.add(clientCompany);
        }

        Paragraph address = new Paragraph(order.getClientAddress())
                .setFontSize(10);
        document.add(address);

        Paragraph cityPostal = new Paragraph(order.getClientCity() + ", " + order.getClientPostalCode())
                .setFontSize(10);
        document.add(cityPostal);

        Paragraph phone = new Paragraph("Phone: " + order.getClientPhone())
                .setFontSize(10);
        document.add(phone);

        if (order.getClientEmail() != null && !order.getClientEmail().isEmpty()) {
            Paragraph email = new Paragraph("Email: " + order.getClientEmail())
                    .setFontSize(10);
            document.add(email);
        }

        document.add(new Paragraph("\n"));
    }

    /**
     * Add items table with product details
     */
    private void addItemsTable(Document document, List<OrderItem> items) {
        // Create table with 5 columns: #, Product, Quantity, Unit Price, Subtotal
        float[] columnWidths = {0.5f, 3f, 1f, 1.5f, 1.5f};
        Table table = new Table(UnitValue.createPercentArray(columnWidths))
                .useAllAvailableWidth();

        // Header row with background color
        DeviceRgb headerColor = new DeviceRgb(52, 73, 94); // Dark blue-gray
        String[] headers = {"#", "Product", "Quantity", "Unit Price", "Subtotal"};

        for (String header : headers) {
            Cell cell = new Cell()
                    .add(new Paragraph(header)
                            .setFontColor(ColorConstants.WHITE)
                            .setBold())
                    .setBackgroundColor(headerColor)
                    .setTextAlignment(TextAlignment.CENTER);
            table.addHeaderCell(cell);
        }

        // Data rows
        int index = 1;
        for (OrderItem item : items) {
            // Row number
            table.addCell(new Cell()
                    .add(new Paragraph(String.valueOf(index++)))
                    .setTextAlignment(TextAlignment.CENTER));

            // Product title
            table.addCell(new Cell()
                    .add(new Paragraph(item.getProductTitle())));

            // Quantity
            table.addCell(new Cell()
                    .add(new Paragraph(String.valueOf(item.getQuantity())))
                    .setTextAlignment(TextAlignment.CENTER));

            // Unit price
            table.addCell(new Cell()
                    .add(new Paragraph(String.format("$%.2f", item.getUnitPrice())))
                    .setTextAlignment(TextAlignment.RIGHT));

            // Subtotal
            table.addCell(new Cell()
                    .add(new Paragraph(String.format("$%.2f", item.getSubtotal())))
                    .setTextAlignment(TextAlignment.RIGHT));
        }

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    /**
     * Add totals section
     */
    private void addTotals(Document document, Order order) {
        // Create a table for totals aligned to the right
        Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .useAllAvailableWidth();

        // Total items
        totalsTable.addCell(new Cell()
                .add(new Paragraph("Total Items:").setBold())
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null));
        totalsTable.addCell(new Cell()
                .add(new Paragraph(String.valueOf(order.getTotalItems())))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null));

        // Grand total
        DeviceRgb totalBgColor = new DeviceRgb(236, 240, 241); // Light gray
        totalsTable.addCell(new Cell()
                .add(new Paragraph("Grand Total:").setBold().setFontSize(14))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBackgroundColor(totalBgColor)
                .setPadding(10));
        totalsTable.addCell(new Cell()
                .add(new Paragraph(String.format("$%.2f", order.getTotalAmount()))
                        .setBold()
                        .setFontSize(14))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBackgroundColor(totalBgColor)
                .setPadding(10));

        document.add(totalsTable);
        document.add(new Paragraph("\n"));
    }

    /**
     * Add footer with notes and generation info
     */
    private void addFooter(Document document, Order order) {
        // Notes section if present
        if (order.getNotes() != null && !order.getNotes().isEmpty()) {
            Paragraph notesLabel = new Paragraph("Notes:")
                    .setBold()
                    .setFontSize(10);
            document.add(notesLabel);

            Paragraph notes = new Paragraph(order.getNotes())
                    .setFontSize(9)
                    .setItalic();
            document.add(notes);

            document.add(new Paragraph("\n"));
        }

        // Thank you message
        Paragraph thankYou = new Paragraph("Thank you for your business!")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(12)
                .setBold();
        document.add(thankYou);

        // Generation timestamp
        Paragraph generated = new Paragraph("Generated on " +
                java.time.LocalDateTime.now().format(DATETIME_FORMATTER))
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY);
        document.add(generated);
    }
}
