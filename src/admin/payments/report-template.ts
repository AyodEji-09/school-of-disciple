type CenterBreakdown = {
  centerName: string;
  transactions: number;
  amountFormatted: string;
};

type FinancialReportTemplate = {
  scopeLabel: string;
  generatedAt: string;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalAmountFormatted: string;
  averageAmountFormatted: string;
  dateFrom?: string;
  dateTo?: string;
  centerBreakdown: CenterBreakdown[];
};

type ReportTransaction = {
  date: string;
  transactionRef: string;
  description: string;
  center: string;
  status: string;
  amountFormatted: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const openFinancialReportPrintPreview = ({
  report,
  transactions,
}: {
  report: FinancialReportTemplate;
  transactions: ReportTransaction[];
}) => {
  const reportWindow = window.open("", "_blank", "width=1200,height=800");

  if (!reportWindow) {
    return false;
  }

  const centerRows = report.centerBreakdown
    .map(
      (center) => `
        <tr>
          <td>${escapeHtml(center.centerName)}</td>
          <td>${center.transactions}</td>
          <td>${escapeHtml(center.amountFormatted)}</td>
        </tr>
      `,
    )
    .join("");

  const transactionRows = transactions
    .map(
      (payment) => `
        <tr>
          <td>${escapeHtml(payment.date)}</td>
          <td>${escapeHtml(payment.transactionRef)}</td>
          <td>${escapeHtml(payment.description)}</td>
          <td>${escapeHtml(payment.center)}</td>
          <td>${escapeHtml(payment.status)}</td>
          <td>${escapeHtml(payment.amountFormatted)}</td>
        </tr>
      `,
    )
    .join("");

  const html = `
    <html>
      <head>
        <title>Financial Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 24px;
            color: #001f54;
          }
          h1, h2 {
            margin: 0 0 12px;
          }
          .meta {
            margin-bottom: 18px;
          }
          .meta p {
            margin: 4px 0;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin-bottom: 18px;
          }
          .stat {
            border: 1px solid #d9e2f1;
            border-radius: 6px;
            padding: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 20px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #d9e2f1;
            padding: 8px;
            text-align: left;
            vertical-align: top;
            word-break: break-word;
          }
          th {
            background: #f5faff;
          }
          @media print {
            body {
              margin: 12mm;
            }
          }
        </style>
      </head>
      <body>
        <h1>Financial Report</h1>
        <div class="meta">
          <p><strong>Scope:</strong> ${escapeHtml(report.scopeLabel)}</p>
          <p><strong>Generated At:</strong> ${escapeHtml(report.generatedAt)}</p>
          <p><strong>Date Range:</strong> ${escapeHtml(report.dateFrom || "N/A")} - ${escapeHtml(report.dateTo || "N/A")}</p>
        </div>

        <div class="stats">
          <div class="stat"><strong>Total Transactions:</strong> ${report.totalTransactions}</div>
          <div class="stat"><strong>Total Amount:</strong> ${escapeHtml(report.totalAmountFormatted)}</div>
          <div class="stat"><strong>Successful:</strong> ${report.successfulTransactions}</div>
          <div class="stat"><strong>Pending:</strong> ${report.pendingTransactions}</div>
          <div class="stat"><strong>Failed:</strong> ${report.failedTransactions}</div>
          <div class="stat"><strong>Average Amount:</strong> ${escapeHtml(report.averageAmountFormatted)}</div>
        </div>

        <h2>Center Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Center</th>
              <th>Transactions</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${centerRows || "<tr><td colspan='3'>No records found</td></tr>"}
          </tbody>
        </table>

        <h2>Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction Ref</th>
              <th>Description</th>
              <th>Center</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows || "<tr><td colspan='6'>No transactions found</td></tr>"}
          </tbody>
        </table>
      </body>
    </html>
  `;

  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();

  reportWindow.focus();
  reportWindow.print();

  return true;
};
