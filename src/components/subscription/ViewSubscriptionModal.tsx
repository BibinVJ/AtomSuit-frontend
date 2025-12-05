import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Badge from '../ui/badge/Badge';
import { Subscription } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
}

export default function ViewSubscriptionModal({ isOpen, onClose, subscription }: Props) {
  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    if (subscription.is_canceled) {
      return <Badge size="sm" color="error">Canceled</Badge>;
    }
    if (subscription.is_on_trial) {
      return <Badge size="sm" color="warning">Trial</Badge>;
    }
    if (subscription.is_active) {
      return <Badge size="sm" color="success">Active</Badge>;
    }
    return <Badge size="sm" color="secondary">Inactive</Badge>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[900px] lg:p-11">
      <div className="relative w-full max-h-[85vh] p-4 overflow-y-auto bg-white custom-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Subscription Details
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            View subscription information and history.
          </p>
        </div>

        <div className="px-2 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <p className="text-gray-900 dark:text-white">{subscription.name}</p>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <div>{getStatusBadge()}</div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Stripe ID</label>
              <p className="text-gray-900 dark:text-white font-mono text-sm">{subscription.stripe_id}</p>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Stripe Status</label>
              <p className="text-gray-900 dark:text-white capitalize">{subscription.stripe_status}</p>
            </div>
          </div>

          {/* Tenant & Plan */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tenant</label>
              <p className="text-gray-900 dark:text-white">{subscription.tenant?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Plan</label>
              <p className="text-gray-900 dark:text-white">{subscription.plan?.name || 'N/A'}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
              <p className="text-gray-900 dark:text-white">${subscription.stripe_price}</p>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
              <p className="text-gray-900 dark:text-white">{subscription.quantity}</p>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Total</label>
              <p className="text-gray-900 dark:text-white font-semibold">${parseFloat(subscription.stripe_price) * subscription.quantity}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
              <p className="text-gray-900 dark:text-white">{formatDate(subscription.created_at)}</p>
            </div>
            {subscription.trial_ends_at && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Trial Ends At</label>
                <p className="text-gray-900 dark:text-white">{formatDate(subscription.trial_ends_at)}</p>
              </div>
            )}
            {subscription.ends_at && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Ends At</label>
                <p className="text-gray-900 dark:text-white">{formatDate(subscription.ends_at)}</p>
              </div>
            )}
          </div>

          {/* Subscription Items */}
          {subscription.items && subscription.items.length > 0 && (
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Subscription Items</label>
              <div className="overflow-x-auto border rounded dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Stripe Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Price ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {subscription.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">{item.stripe_product}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">{item.stripe_price}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoices */}
          {subscription.invoices && subscription.invoices.length > 0 && (
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Invoices</label>
              <div className="overflow-x-auto border rounded dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Invoice Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {subscription.invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{formatDate(invoice.invoice_date)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{invoice.amount} {invoice.currency.toUpperCase()}</td>
                        <td className="px-4 py-2 text-sm">
                          <Badge size="sm" color={invoice.payment_status === 'paid' ? 'success' : 'warning'}>
                            {invoice.payment_status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">{invoice.transaction_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button type="button" variant='outline' onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
