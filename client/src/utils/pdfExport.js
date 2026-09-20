import { jsPDF } from "jspdf";

/**
 * Generates and downloads a beautifully branded, agency-grade PDF for any Creative Ad.
 * Supports creative brief, copy specs, applied AI recommendations, cultural parameters, and performance targets.
 */
export const exportCreativeToPdf = ({
    brandName = "Brand",
    productName = "Product",
    headline = "",
    subheadline = "",
    caption = "",
    cta = "",
    platform = "Instagram",
    targetAudience = "General Audience",
    brandTone = "Modern",
    strategicAngle = "",
    visualDirection = "",
    hashtags = "",
    appliedRecommendations = [],
    indianCulture = null,
    metrics = null
}) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;

    // --- 1. TOP EXECUTIVE HEADER BANNER ---
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, pageWidth, 28, "F");

    // Accent line (Cyan/Primary)
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 28, pageWidth, 2.5, "F");

    // Header Titles
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ZYNORA AI", margin, 13);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("CREATIVE AD BRIEF & OPTIMIZATION REPORT", margin, 20);

    // Date & Platform Badge (Right Aligned)
    const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.text(`Exported: ${dateStr}`, pageWidth - margin, 13, { align: "right" });

    doc.setTextColor(14, 165, 233);
    doc.setFont("helvetica", "bold");
    doc.text(`Target: ${platform ? platform.toUpperCase() : "MULTI-CHANNEL"}`, pageWidth - margin, 20, { align: "right" });

    y = 38;

    // Helper: Add section header
    const addSectionHeader = (title) => {
        if (y > pageHeight - 35) {
            doc.addPage();
            y = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(14, 165, 233);
        doc.text(title.toUpperCase(), margin, y);
        y += 2;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(margin, y, margin + contentWidth, y);
        y += 5.5;
    };

    // --- 2. CAMPAIGN METADATA OVERVIEW BOX ---
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "FD");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Brand:", margin + 5, y + 6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(brandName || "Brand", margin + 18, y + 6.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Product:", margin + 70, y + 6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(productName || "Product", margin + 85, y + 6.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Audience:", margin + 5, y + 15.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(targetAudience || "All Audiences", margin + 22, y + 15.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Tone:", margin + 70, y + 15.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(brandTone || "Modern", margin + 81, y + 15.5);

    y += 28;

    // --- 3. INDIAN CULTURAL & FESTIVE METRICS (if present) ---
    if (indianCulture && indianCulture.enabled) {
        addSectionHeader("Hyper-Localized Market Context");
        doc.setFillColor(254, 243, 199); // Amber tint
        doc.setDrawColor(251, 191, 36);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(180, 83, 9);
        doc.text(`Region: ${indianCulture.region || "Pan-India"} (${indianCulture.tier || "Metro / Tier 1"})`, margin + 4, y + 5.5);
        doc.text(`Festival: ${indianCulture.festivalOccasion || "None / Everyday"}`, margin + 90, y + 5.5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(146, 64, 14);
        doc.text(`Language: ${indianCulture.outputLanguage || "Hinglish"} (${indianCulture.codeMixRatio || 40}% code-mix)`, margin + 4, y + 10.5);
        if (indianCulture.offerTrustMechanic) {
            doc.text(`Trust Driver: ${indianCulture.offerTrustMechanic}`, margin + 90, y + 10.5);
        }

        y += 19;
    }

    // --- 4. PRIMARY HEADLINE ---
    if (headline) {
        addSectionHeader("Primary Ad Headline");
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(14, 165, 233);
        doc.setLineWidth(0.8);

        const cleanHeadline = `"${headline.replace(/^["']|["']$/g, "")}"`;
        const headlineLines = doc.splitTextToSize(cleanHeadline, contentWidth - 10);
        const boxHeight = Math.max(16, headlineLines.length * 6 + 7);

        doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11.5);
        doc.setTextColor(15, 23, 42);
        doc.text(headlineLines, margin + 5, y + 7);

        y += boxHeight + 4;

        if (subheadline) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            const subLines = doc.splitTextToSize(subheadline, contentWidth);
            doc.text(subLines, margin, y);
            y += subLines.length * 4.5 + 4;
        }
    }

    // --- 5. AD BODY COPY / CAPTION ---
    if (caption) {
        addSectionHeader("Primary Ad Text & Caption");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);

        const captionLines = doc.splitTextToSize(caption, contentWidth - 8);
        const copyBoxHeight = Math.max(20, captionLines.length * 4.8 + 8);

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, y, contentWidth, copyBoxHeight, 2, 2, "FD");

        doc.text(captionLines, margin + 4, y + 6);
        y += copyBoxHeight + 6;
    }

    // --- 6. CALL TO ACTION & HASHTAGS ---
    if (cta || hashtags) {
        addSectionHeader("Conversion Mechanics");

        if (cta) {
            doc.setFillColor(224, 242, 254);
            doc.setDrawColor(186, 230, 253);
            doc.roundedRect(margin, y, contentWidth, 11, 2, 2, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(2, 132, 199);
            doc.text(`CALL TO ACTION: ${cta}`, margin + 5, y + 7.5);
            y += 15;
        }

        if (hashtags) {
            const tagStr = Array.isArray(hashtags) ? hashtags.join(" ") : hashtags;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(100, 116, 139);
            const tagLines = doc.splitTextToSize(`Hashtags: ${tagStr}`, contentWidth);
            doc.text(tagLines, margin, y);
            y += tagLines.length * 4.5 + 4;
        }
    }

    // --- 7. APPLIED AI RECOMMENDATIONS & DIRECTIVES ---
    if (appliedRecommendations && appliedRecommendations.length > 0) {
        addSectionHeader("Incorporated AI Strategic Directives");

        appliedRecommendations.forEach((rec, index) => {
            if (y > pageHeight - 30) {
                doc.addPage();
                y = 20;
            }

            const recTitle = rec.title || `Optimization #${index + 1}`;
            const recText = rec.action || rec.suggestion || (typeof rec === "string" ? rec : JSON.stringify(rec));
            const recImpact = rec.impact || null;

            doc.setFillColor(240, 253, 244); // Light emerald
            doc.setDrawColor(187, 247, 208);
            doc.setLineWidth(0.3);

            const splitRecText = doc.splitTextToSize(recText, contentWidth - 10);
            const cardH = splitRecText.length * 4.5 + (recImpact ? 14 : 9);

            doc.roundedRect(margin, y, contentWidth, cardH, 2, 2, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(5, 150, 105);
            doc.text(`✓ ${recTitle}`, margin + 4, y + 5.5);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(51, 65, 85);
            doc.text(splitRecText, margin + 4, y + 10);

            if (recImpact) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.5);
                doc.setTextColor(14, 165, 233);
                doc.text(`Expected Impact: ${recImpact}`, margin + 4, y + cardH - 3);
            }

            y += cardH + 3.5;
        });
    }

    // --- 8. STRATEGIC & VISUAL DIRECTION (if provided) ---
    if (strategicAngle || visualDirection) {
        addSectionHeader("Creative Art Direction & Strategy");

        if (strategicAngle) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text("Strategic Mechanism:", margin, y);
            y += 4.5;

            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            const angleLines = doc.splitTextToSize(strategicAngle, contentWidth);
            doc.text(angleLines, margin, y);
            y += angleLines.length * 4.5 + 4;
        }

        if (visualDirection) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text("Visual Scene Direction:", margin, y);
            y += 4.5;

            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            const visLines = doc.splitTextToSize(visualDirection, contentWidth);
            doc.text(visLines, margin, y);
            y += visLines.length * 4.5 + 4;
        }
    }

    // --- FOOTER ACROSS ALL PAGES ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text("Generated by Zynora AI • Confidential Creative Asset", margin, pageHeight - 7);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: "right" });
    }

    // Download / Save PDF
    const cleanProduct = (productName || brandName || "Creative_Ad").replace(/[^a-zA-Z0-9_-]/g, "_");
    doc.save(`Zynora_${cleanProduct}_${Date.now()}.pdf`);
};
