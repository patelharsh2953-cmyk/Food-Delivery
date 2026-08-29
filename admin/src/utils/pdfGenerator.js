import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSalesPDF = (salesData, filterPreset = 'all', dateRange = {}) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const primaryColor = [255, 76, 36];     // #ff4c24
    const darkTextColor = [15, 23, 42];     // #0f172a
    const grayTextColor = [100, 116, 139];  // #64748b
    const lightBgColor = [248, 250, 252];   // #f8fafc

    // ── Header Banner Bar ──
    doc.setFillColor(255, 76, 36);
    doc.rect(0, 0, 210, 8, 'F');

    // ── Brand Title & Header ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 76, 36);
    doc.text('FoodDel', 14, 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...darkTextColor);
    doc.text('Business Analytics & Financial Report', 14, 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayTextColor);
    const generatedOn = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
    doc.text(`Generated: ${generatedOn}`, 14, 34);

    // Filter range text
    let rangeText = 'Time Range: All Time Records';
    if (filterPreset === 'today') rangeText = 'Time Range: Today';
    else if (filterPreset === '7days') rangeText = 'Time Range: Last 7 Days';
    else if (filterPreset === '30days') rangeText = 'Time Range: Last 30 Days';
    else if (dateRange.startDate || dateRange.endDate) {
        rangeText = `Time Range: ${dateRange.startDate || 'Start'} to ${dateRange.endDate || 'Present'}`;
    }
    doc.text(rangeText, 140, 34);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    // ── Section 1: Executive KPI Summary ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkTextColor);
    doc.text('1. EXECUTIVE SUMMARY & REVENUE METRICS', 14, 45);

    const revenue = salesData?.totalRevenue || 0;
    const totalOrders = salesData?.totalOrders || 0;
    const avgOrder = salesData?.avgOrderValue || 0;
    const deliveredCount = salesData?.deliveredOrdersCount || 0;
    const paidCount = salesData?.paidOrdersCount || 0;
    const cancelledCount = salesData?.cancelledOrdersCount || 0;

    const kpiData = [
        ['Total Gross Revenue', `Rs. ${revenue.toLocaleString()}`, 'Total collected across all completed orders'],
        ['Total Customer Orders', `${totalOrders} orders`, `${paidCount} paid, ${totalOrders - paidCount} pending/COD`],
        ['Average Order Value (AOV)', `Rs. ${avgOrder.toLocaleString()}`, 'Average transaction size per customer order'],
        ['Delivered Orders', `${deliveredCount} orders`, `${cancelledCount} cancelled orders recorded`]
    ];

    autoTable(doc, {
        startY: 48,
        head: [['Metric', 'Value', 'Details']],
        body: kpiData,
        theme: 'grid',
        headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [30, 41, 59]
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 55 },
            1: { fontStyle: 'bold', textColor: [255, 76, 36], cellWidth: 40 },
            2: { cellWidth: 85 }
        },
        margin: { left: 14, right: 14 }
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // ── Section 2: Top Selling Menu Items ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkTextColor);
    doc.text('2. TOP SELLING FOOD ITEMS', 14, currentY);

    const productsRows = (salesData?.topProducts && salesData.topProducts.length > 0)
        ? salesData.topProducts.map((p, index) => [
            `#${index + 1}`,
            p.name,
            `${p.quantity} portions`,
            `Rs. ${p.revenue.toLocaleString()}`
        ])
        : [['-', 'No products sales recorded for this period', '-', 'Rs. 0']];

    autoTable(doc, {
        startY: currentY + 3,
        head: [['Rank', 'Food Product Name', 'Quantity Sold', 'Revenue Generated']],
        body: productsRows,
        theme: 'striped',
        headStyles: {
            fillColor: [255, 76, 36],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 8.5,
            textColor: [30, 41, 59]
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 90, fontStyle: 'bold' },
            2: { cellWidth: 35, halign: 'center' },
            3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // Check if new page needed
    if (currentY > 230) {
        doc.addPage();
        currentY = 20;
    }

    // ── Section 3: Order Status & Payment Gateways ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkTextColor);
    doc.text('3. ORDER STATUS & PAYMENT GATEWAY BREAKDOWN', 14, currentY);

    const statusRows = salesData?.statusBreakdown
        ? Object.entries(salesData.statusBreakdown).map(([status, count]) => [
            status,
            `${count} orders`,
            `${totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0}%`
        ])
        : [['No order status data', '0', '0%']];

    autoTable(doc, {
        startY: currentY + 3,
        head: [['Order Status', 'Order Count', 'Percentage']],
        body: statusRows,
        theme: 'grid',
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 8.5
        },
        columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold' },
            1: { cellWidth: 50, halign: 'center' },
            2: { cellWidth: 50, halign: 'center' }
        },
        margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 8;

    // Payment Methods Breakdown
    if (salesData?.paymentMethods) {
        if (currentY > 240) {
            doc.addPage();
            currentY = 20;
        }

        const paymentRows = Object.entries(salesData.paymentMethods).map(([method, amount]) => [
            method,
            `Rs. ${amount.toLocaleString()}`,
            `${revenue > 0 ? Math.round((amount / revenue) * 100) : 0}%`
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [['Payment Gateway / Method', 'Total Volume Amount', 'Share (%)']],
            body: paymentRows,
            theme: 'grid',
            headStyles: {
                fillColor: [16, 185, 129],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8.5
            },
            columnStyles: {
                0: { cellWidth: 80, fontStyle: 'bold' },
                1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
                2: { cellWidth: 50, halign: 'center' }
            },
            margin: { left: 14, right: 14 }
        });
    }

    // ── Footer with Page Numbers ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `FoodDel Management System  |  Confidential Business Report  |  Page ${i} of ${pageCount}`,
            14,
            290
        );
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(14, 286, 196, 286);
    }

    // Save and download PDF file
    const filename = `FoodDel_Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    return filename;
};
