import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/**
 * Generate and download a PDF from an invoice element.
 * Clones the element off-screen to avoid modal/overflow capture issues.
 * @param {HTMLElement} element - The invoice DOM element to capture
 * @param {string} [filename] - Filename for the downloaded PDF
 */
export async function downloadInvoicePdf(element, filename = "booking-invoice.pdf") {
  if (!element || !(element instanceof HTMLElement)) {
    throw new Error("Invalid invoice element");
  }

  // Clone and render off-screen to avoid modal overflow/transform issues
  const clone = element.cloneNode(true);
  const width = element.offsetWidth || element.scrollWidth || 600;
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = `${width}px`;
  clone.style.maxWidth = "none";
  clone.style.zIndex = "-1";
  clone.style.visibility = "visible";
  document.body.appendChild(clone);

  try {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL("image/png");
    if (!imgData || imgData.length < 100) {
      throw new Error("Failed to generate image");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight > pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, pageHeight);
      const remaining = imgHeight - pageHeight;
      const pages = Math.ceil(remaining / pageHeight);
      for (let i = 1; i <= pages; i++) {
        pdf.addPage();
        const y = -pageHeight * i;
        pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      }
    } else {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(clone);
  }
}
