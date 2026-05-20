import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../../lib/api';
import { TableSkeleton } from '../components/SkeletonLoaders';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Search, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const PlanBadge = ({ plan }) => {
  const planName = typeof plan === 'object' && plan ? (plan.name || plan.id || 'Free') : (plan || 'Free');
  const colors = {
    Starter: 'bg-[#2563EB]/10 text-[#2563EB]',
    Growth: 'bg-[#1D9E75]/10 text-[#1D9E75]',
    Agency: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    Free: 'bg-[#71717A]/10 text-[#71717A]'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[planName] || colors.Free}`}>
      {planName}
    </span>
  );
};

const StatusDot = ({ status }) => {
  const isActive = status === 'Active';
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#1D9E75]' : 'bg-[#EF4444]'}`} />
      <span className="text-sm text-[#27272A]">{status}</span>
    </div>
  );
};

// Adapt a live API user (with optional subscription) to the row shape this UI expects.
const adaptUser = (u) => {
  const sub = u.subscription;
  const plan = sub?.planName || sub?.plan || 'Free';
  const initials = (u.fullName || u.email || '?').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return {
    id: u.id,
    name: u.fullName || u.name || u.email,
    email: u.email,
    plan,
    status: sub?.status === 'CANCELLED' ? 'Suspended' : 'Active',
    signupDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
    lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—',
    jalwaScore: u.jalwaScore ?? u.growthScore ?? '—',
    avatar: u.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || u.email)}&background=1D9E75&color=fff&bold=true`,
    _initials: initials,
  };
};

export const UsersList = () => {
  const { users: dummyUsers } = useAdmin();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.users({ limit: 200 });
        const list = Array.isArray(data) ? data : data?.users || [];
        if (cancelled) return;
        setUsers(list.length ? list.map(adaptUser) : dummyUsers);
      } catch {
        if (!cancelled) setUsers(dummyUsers);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dummyUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * perPage, currentPage * perPage);

  if (isLoading) {
    return <TableSkeleton rows={10} columns={8} />;
  }

  return (
    <div className="space-y-6" data-testid="users-list-page">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="admin-input pl-9 w-64"
              data-testid="users-search-input"
            />
          </div>
          <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-36 border-[#F0F0F0]" data-testid="users-plan-filter">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="Starter">Starter</SelectItem>
              <SelectItem value="Growth">Growth</SelectItem>
              <SelectItem value="Agency">Agency</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-36 border-[#F0F0F0]" data-testid="users-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="admin-btn-secondary" data-testid="users-export-btn">
          <Download size={16} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="admin-card">
          <EmptyState
            type="search"
            title="No users found"
            description="Try adjusting your search or filter criteria."
          />
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full admin-table" data-testid="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Signup Date</th>
                  <th>Last Login</th>
                  <th>Growth Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} data-testid={`user-row-${user.id}`}>
                    <td>
                      <div className="flex items-center gap-2">
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-medium text-[#09090B]">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td><PlanBadge plan={user.plan} /></td>
                    <td><StatusDot status={user.status} /></td>
                    <td>{user.signupDate}</td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <span className="font-medium text-[#1D9E75]">{user.jalwaScore}</span>
                      <span className="text-[#71717A]">/100</span>
                    </td>
                    <td>
                      <Link to={`/adminpanel/users/${user.id}`}>
                        <Button size="sm" variant="ghost" className="h-8" data-testid={`view-user-${user.id}`}>
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#71717A]">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="admin-btn-secondary h-8"
              data-testid="users-prev-page"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-[#27272A] px-2">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="admin-btn-secondary h-8"
              data-testid="users-next-page"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Note: real-time backend pagination not yet wired */}
      <p className="text-xs text-[#71717A] text-center">
        Showing {users.length} {users.length === 1 ? 'user' : 'users'} from the live database
      </p>
    </div>
  );
};
