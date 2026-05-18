import { useState, useEffect } from 'react';
import { MetricCard, SkeletonCard } from '../components/MetricCard';
import { TableSkeleton, ChartSkeleton } from '../components/SkeletonLoaders';
import { REVENUE_CHART, TRANSACTIONS } from '../data/dummyData';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { DollarSign, TrendingUp, AlertCircle, RefreshCcw, RotateCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 shadow-sm">
        <p className="text-xs text-[#71717A]">{label}</p>
        <p className="text-sm font-semibold text-[#09090B]">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const StatusBadge = ({ status }) => {
  const colors = {
    Paid: 'bg-[#1D9E75]/10 text-[#1D9E75]',
    Failed: 'bg-[#EF4444]/10 text-[#EF4444]',
    Refunded: 'bg-[#F59E0B]/10 text-[#F59E0B]'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

export const Billing = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState(TRANSACTIONS);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = (id) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, status: 'Paid' } : t)
    );
    toast.success('Payment retry successful');
  };

  const handleRefund = (id) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, status: 'Refunded' } : t)
    );
    toast.success('Refund processed successfully');
  };

  const monthlyRevenue = 38492;
  const annualRunRate = monthlyRevenue * 12;
  const failedPayments = transactions.filter(t => t.status === 'Failed').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
        <ChartSkeleton height={300} />
        <TableSkeleton rows={10} columns={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="billing-page">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Monthly Revenue"
          value={monthlyRevenue}
          format="currency"
          icon={DollarSign}
        />
        <MetricCard
          title="Annual Run Rate"
          value={annualRunRate}
          format="currency"
          icon={TrendingUp}
        />
        <MetricCard
          title="Failed Payments"
          value={failedPayments}
          icon={AlertCircle}
        />
      </div>

      {/* Revenue Chart */}
      <div className="admin-card p-5">
        <h3 className="text-sm font-semibold text-[#09090B] mb-4">Revenue (Last 12 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={REVENUE_CHART}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#71717A', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#71717A', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue" 
              fill="#1D9E75" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div className="admin-card overflow-hidden">
        <div className="p-5 border-b border-[#F0F0F0]">
          <h3 className="text-sm font-semibold text-[#09090B]">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full admin-table" data-testid="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} data-testid={`transaction-row-${tx.id}`}>
                  <td>{tx.date}</td>
                  <td>{tx.user}</td>
                  <td>{tx.plan}</td>
                  <td className="font-medium">${tx.amount}</td>
                  <td><StatusBadge status={tx.status} /></td>
                  <td>
                    <button className="text-[#2563EB] text-sm hover:underline">
                      {tx.invoiceId}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {tx.status === 'Failed' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 text-xs"
                          onClick={() => handleRetry(tx.id)}
                          data-testid={`retry-btn-${tx.id}`}
                        >
                          <RefreshCcw size={12} className="mr-1" />
                          Retry
                        </Button>
                      )}
                      {tx.status === 'Paid' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 text-xs text-[#71717A]"
                              data-testid={`refund-btn-${tx.id}`}
                            >
                              <RotateCcw size={12} className="mr-1" />
                              Refund
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Process Refund</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to refund ${tx.amount} to {tx.user}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRefund(tx.id)}
                                className="admin-btn-primary"
                              >
                                Process Refund
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
};
