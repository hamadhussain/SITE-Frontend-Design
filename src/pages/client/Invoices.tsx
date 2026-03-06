import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { paymentApi } from '@/services/api'
import { FileText, Download, Eye } from 'lucide-react'
import { toast } from 'sonner'
import type { Invoice, PageResponse } from '@/types'

function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount)
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  VIEWED: 'bg-indigo-100 text-indigo-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
}

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoices', statusFilter, page],
    queryFn: () =>
      paymentApi.getInvoices({
        status: statusFilter || undefined,
        page,
        size: 20,
      }).then((r) => r.data as PageResponse<Invoice>),
  })

  const invoices = data?.content || []

  const handleDownloadPdf = async (invoiceId: number, invoiceNumber: string) => {
    try {
      const response = await paymentApi.downloadInvoicePdf(invoiceId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoiceNumber}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Invoice downloaded')
    } catch {
      toast.error('Failed to download invoice')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoice List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading invoices...</p>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-red-500">Failed to load invoices.</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
          <p className="text-gray-500">Invoices will be generated when milestone payments are processed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-medium">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                    {invoice.projectTitle || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{invoice.issueDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{invoice.dueDate || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-right">{formatPKR(invoice.totalAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status] || 'bg-gray-100'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)}
                        className="p-1.5 text-gray-400 hover:text-primary rounded"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                Page {(data.number || 0) + 1} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={data.first}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={data.last}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Invoice {selectedInvoice.invoiceNumber}</h2>
                <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedInvoice.status] || ''}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span>{selectedInvoice.invoiceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issue Date</span>
                  <span>{selectedInvoice.issueDate}</span>
                </div>
                {selectedInvoice.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date</span>
                    <span>{selectedInvoice.dueDate}</span>
                  </div>
                )}
                {selectedInvoice.paidDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid Date</span>
                    <span>{selectedInvoice.paidDate}</span>
                  </div>
                )}

                <hr />

                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPKR(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span>{formatPKR(selectedInvoice.taxAmount)}</span>
                  </div>
                )}
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span>-{formatPKR(selectedInvoice.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPKR(selectedInvoice.totalAmount)}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => {
                    handleDownloadPdf(selectedInvoice.id, selectedInvoice.invoiceNumber)
                    setSelectedInvoice(null)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 text-sm"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
