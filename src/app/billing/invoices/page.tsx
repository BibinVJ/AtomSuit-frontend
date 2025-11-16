"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Download, Eye, Calendar, CreditCard, RefreshCw } from 'lucide-react';
import Button from '../../../components/ui/button/Button';

interface Invoice {
  id: string;
  number: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  created: number;
  due_date: number;
  hosted_invoice_url: string;
  invoice_pdf: string;
  period_start: number;
  period_end: number;
}

export default function BillingInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingInvoice, setUpcomingInvoice] = useState<any>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockInvoices: Invoice[] = [
        {
          id: 'in_1234567890',
          number: 'INV-2024-001',
          amount_paid: 2900,
          amount_due: 0,
          currency: 'usd',
          status: 'paid',
          created: Date.now() / 1000 - 86400 * 30,
          due_date: Date.now() / 1000 - 86400 * 15,
          hosted_invoice_url: '#',
          invoice_pdf: '#',
          period_start: Date.now() / 1000 - 86400 * 60,
          period_end: Date.now() / 1000 - 86400 * 30,
        },
        {
          id: 'in_0987654321',
          number: 'INV-2024-002',
          amount_paid: 2900,
          amount_due: 0,
          currency: 'usd',
          status: 'paid',
          created: Date.now() / 1000 - 86400 * 60,
          due_date: Date.now() / 1000 - 86400 * 45,
          hosted_invoice_url: '#',
          invoice_pdf: '#',
          period_start: Date.now() / 1000 - 86400 * 90,
          period_end: Date.now() / 1000 - 86400 * 60,
        },
      ];
      
      setInvoices(mockInvoices);
      
      // Mock upcoming invoice
      setUpcomingInvoice({
        amount_due: 2900,
        currency: 'usd',
        period_start: Date.now() / 1000,
        period_end: Date.now() / 1000 + 86400 * 30,
        next_payment_attempt: Date.now() / 1000 + 86400 * 30,
      });
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'open':
        return 'text-blue-600 bg-blue-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading invoices...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices & Payments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your billing history and upcoming payments</p>
        </div>
        <Button
          onClick={loadInvoices}
          size="sm"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Upcoming Invoice */}
      {upcomingInvoice && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Upcoming Invoice
              </h3>
              <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Amount: {formatAmount(upcomingInvoice.amount_due, upcomingInvoice.currency)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Next payment: {formatDate(upcomingInvoice.next_payment_attempt)}</span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Billing period: {formatDate(upcomingInvoice.period_start)} - {formatDate(upcomingInvoice.period_end)}
                </div>
              </div>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              View Details
            </Button>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</h3>
          <Button size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
            Update
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Expires 12/25</p>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Invoice</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Amount</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{invoice.number}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-900 dark:text-white">
                    {formatDate(invoice.created)}
                  </td>
                  <td className="py-4 px-6 text-gray-900 dark:text-white">
                    {formatAmount(invoice.amount_paid, invoice.currency)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}