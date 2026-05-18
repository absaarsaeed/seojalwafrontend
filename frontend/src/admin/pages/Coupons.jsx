import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { TableSkeleton } from '../components/SkeletonLoaders';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Copy, Power, Trash2, CalendarIcon } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const isActive = status === 'Active';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      isActive ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-[#71717A]/10 text-[#71717A]'
    }`}>
      {status}
    </span>
  );
};

export const Coupons = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    duration: 'once',
    expiry: null,
    limit: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      toast.error('Please fill in required fields');
      return;
    }
    addCoupon({
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: parseInt(formData.value),
      uses: 0,
      limit: formData.limit ? parseInt(formData.limit) : null,
      expiry: formData.expiry ? format(formData.expiry, 'yyyy-MM-dd') : null,
      status: 'Active'
    });
    setFormData({ code: '', type: 'percentage', value: '', duration: 'once', expiry: null, limit: '' });
    setShowForm(false);
    toast.success('Coupon created successfully');
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const handleDeactivate = (id) => {
    updateCoupon(id, { status: 'Expired' });
    toast.success('Coupon deactivated');
  };

  const handleDelete = (id) => {
    deleteCoupon(id);
    toast.success('Coupon deleted');
  };

  if (isLoading) {
    return <TableSkeleton rows={8} columns={8} />;
  }

  return (
    <div className="space-y-6" data-testid="coupons-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#09090B]">Discount Coupons</h2>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          className="admin-btn-primary"
          data-testid="create-coupon-btn"
        >
          <Plus size={16} className="mr-2" />
          Create coupon
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="admin-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-[#71717A]">Coupon Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g. JALWA20"
                  className="admin-input uppercase"
                  data-testid="coupon-code-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#71717A]">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                >
                  <SelectTrigger className="border-[#F0F0F0]" data-testid="coupon-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#71717A]">
                  Value {formData.type === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={formData.type === 'percentage' ? '20' : '50'}
                  className="admin-input"
                  data-testid="coupon-value-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-[#71717A]">Duration</Label>
                <Select 
                  value={formData.duration} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, duration: v }))}
                >
                  <SelectTrigger className="border-[#F0F0F0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="repeating">Repeating</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#71717A]">Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-[#F0F0F0]">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiry ? format(formData.expiry, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expiry}
                      onSelect={(date) => setFormData(prev => ({ ...prev, expiry: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#71717A]">Usage Limit</Label>
                <Input
                  type="number"
                  value={formData.limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                  placeholder="Leave blank for unlimited"
                  className="admin-input"
                  data-testid="coupon-limit-input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="admin-btn-primary" data-testid="create-coupon-submit">
                Create
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="admin-btn-secondary">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      {coupons.length === 0 ? (
        <div className="admin-card">
          <EmptyState
            title="No coupons yet"
            description="Create your first discount coupon to attract more customers."
            action={
              <Button onClick={() => setShowForm(true)} className="admin-btn-primary">
                <Plus size={16} className="mr-2" />
                Create coupon
              </Button>
            }
          />
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full admin-table" data-testid="coupons-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Uses</th>
                  <th>Limit</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} data-testid={`coupon-row-${coupon.id}`}>
                    <td>
                      <code className="px-2 py-1 bg-[#FAFAFA] rounded text-sm font-mono">
                        {coupon.code}
                      </code>
                    </td>
                    <td className="capitalize">{coupon.type}</td>
                    <td>
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                    </td>
                    <td>{coupon.uses}</td>
                    <td>{coupon.limit || '∞'}</td>
                    <td>{coupon.expiry || 'Never'}</td>
                    <td><StatusBadge status={coupon.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={() => handleCopy(coupon.code)}
                          data-testid={`copy-coupon-${coupon.id}`}
                        >
                          <Copy size={14} />
                        </Button>
                        {coupon.status === 'Active' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0 text-[#F59E0B]"
                            onClick={() => handleDeactivate(coupon.id)}
                            data-testid={`deactivate-coupon-${coupon.id}`}
                          >
                            <Power size={14} />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0 text-[#EF4444]"
                              data-testid={`delete-coupon-${coupon.id}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete coupon "{coupon.code}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(coupon.id)}
                                className="bg-[#EF4444] hover:bg-[#DC2626]"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
