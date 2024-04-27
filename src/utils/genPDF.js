import { jsPDF } from "jspdf"
import moment from "moment";

const genPDF = (transaction) => {
  const {
    items,
    metadata,
    total,
    createdAt,
    transactionCode,
  } = transaction
  const {
    customerName,
    customerAddress,
  } = metadata
  let aLine1 = customerAddress
  let aLine2 = '---'
  const addressLength = customerAddress.length
  if (addressLength > 40) {
    aLine1 = customerAddress.substring(0, 40)
    aLine2 = customerAddress.substring(40, addressLength)
    aLine2 = aLine2.length > 42 ? `${aLine2.substring(0, 42)}...` : aLine2
  }
  let extraHeight = 0
  const itemsLength = items.length
  if (itemsLength > 4) {
    extraHeight = (itemsLength - 4) * 6
  }
  const currentDate =  moment(createdAt).format('MMMM DD, YYYY h:mm A');
  const doc = new jsPDF('p', 'mm', [100, 101 + extraHeight])
  doc.setFont("helvetica");
  doc.setFontSize(11);
  doc.text("Cafébara - Order Receipt", 5, 8)
  doc.text(`Date: ${currentDate}`, 5, 14)
  doc.text(`Name: ${customerName}`, 5, 20)
  doc.text(`Address: ${aLine1}`, 5, 26)
  doc.text(` ${aLine2}`, 21, 32)
  doc.text(`----------------------------------------------------------------------`, 5, 38)
  doc.text(`Items`, 5, 40)
  doc.text("|", 63, 40)
  doc.text(`Quantity`, 65, 40)
  doc.text(`----------------------------------------------------------------------`, 5, 42)
  let yP = 48
  items.forEach(({product, quantity}) => {
    const { productName, productCode, price } = product
    doc.text(`${productCode} - ${productName}`, 5, yP)
    doc.text(`PHP ${price} x ${quantity}`, 65, yP)
    yP += 6
  });
  doc.text(`----------------------------------------------------------------------`, 5, yP + 6)
  doc.text(`TOTAL: PHP ${total}`, 5, yP + 12)
  doc.text(`TRANSACTION CODE: ${transactionCode.toLocaleUpperCase()}`, 5, yP + 18)
  doc.text(`* present this receipt to the cashier`, 5, yP + 24)
  doc.output('dataurlnewwindow');
}

export default genPDF

