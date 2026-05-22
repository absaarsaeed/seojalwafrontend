import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../../lib/api';
import { CardSkeleton } from '../components/SkeletonLoaders';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Check, Star } from 'lucide-react';

const FeatureToggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-[#27272A]">{label}</span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const LimitInput = ({ label, value, onChange, isUnlimited }) => {
  // A value of 0 means the feature is disabled; toggle ON to enable & enter a value.
  const numericValue = typeof value === 'number' ? value : (value === 'unlimited' ? 'unlimited' : 0);
  const isEnabled = isUnlimited || (typeof numericValue === 'number' && numericValue > 0);
  return (
    <div className={`p-3 rounded-lg border ${isEnabled ? 'border-[#1D9E75]/30 bg-white' : 'border-[#F0F0F0] bg-[#FAFAFA] opacity-60'}`}>
      <div className="flex items-center justify-between mb-1">
        <Label className="text-xs text-[#71717A]">{label}</Label>
        <Switch
          checked={isEnabled}
          onCheckedChange={(on) => onChange(on ? (typeof value === 'number' && value > 0 ? value : 1) : 0)}
          data-testid={`feature-toggle-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        />
      </div>
      {isEnabled && (isUnlimited ? (
        <div className="h-9 px-3 flex items-center bg-[#FAFAFA] rounded-md text-sm text-[#71717A]">
          Unlimited
        </div>
      ) : (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="admin-input"
          data-testid={`feature-value-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        />
      ))}
    </div>
  );
};

// Map live API plan → legacy admin-page nested shape ({limits, features}).
const apiPlanToLocal = (p) => ({
  id: p.id,
  name: p.name,
  monthlyPrice: p.monthlyPrice ?? 0,
  annualPrice: p.annualPrice ?? 0,
  description: p.description || '',
  popular: !!p.popular || p.name === 'Growth',
  limits: {
    articles: p.articlesPerMonth ?? 0,
    socialPosts: p.socialPostsPerMonth ?? 0,
    aiScans: p.aiScansPerMonth ?? 0,
    teamSeats: p.teamSeats ?? 0,
    cmsConnections: p.cmsConnections === -1 ? 'unlimited' : (p.cmsConnections ?? 0),
  },
  features: {
    brandVoice: !!p.brandVoiceModel,
    competitorComparison: !!p.competitorComparison,
    prioritySupport: !!p.prioritySupport,
    whiteLabel: !!p.whiteLabel,
  },
});

const localToApiPayload = (local) => ({
  name: local.name,
  monthlyPrice: Number(local.monthlyPrice) || 0,
  annualPrice: Number(local.annualPrice) || 0,
  description: local.description,
  articlesPerMonth: Number(local.limits.articles) || 0,
  socialPostsPerMonth: Number(local.limits.socialPosts) || 0,
  aiScansPerMonth: Number(local.limits.aiScans) || 0,
  teamSeats: Number(local.limits.teamSeats) || 0,
  cmsConnections: local.limits.cmsConnections === 'unlimited' ? -1 : (Number(local.limits.cmsConnections) || 0),
  brandVoiceModel: !!local.features.brandVoice,
  competitorComparison: !!local.features.competitorComparison,
  prioritySupport: !!local.features.prioritySupport,
  whiteLabel: !!local.features.whiteLabel,
});

export const Pricing = () => {
  const { pricing, updatePricing } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [localPricing, setLocalPricing] = useState(pricing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.plans();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        if (list.length) {
          const keyed = {};
          for (const p of list) {
            const k = (p.name || '').toLowerCase();
            if (k) keyed[k] = apiPlanToLocal(p);
          }
          setLocalPricing((prev) => ({ ...prev, ...keyed }));
        }
      } catch {}
      if (!cancelled) setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setLocalPricing(pricing);
  }, [pricing]);

  const handlePlanChange = (planKey, field, value) => {
    setLocalPricing(prev => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        [field]: value
      }
    }));
  };

  const handleLimitChange = (planKey, limitKey, value) => {
    setLocalPricing(prev => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        limits: {
          ...prev[planKey].limits,
          [limitKey]: value
        }
      }
    }));
  };

  const handleFeatureChange = (planKey, featureKey, value) => {
    setLocalPricing(prev => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        features: {
          ...prev[planKey].features,
          [featureKey]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    let savedAny = false;
    let errors = 0;
    for (const planKey of ['starter', 'growth', 'agency']) {
      const plan = localPricing[planKey];
      if (!plan?.id) continue;
      try {
        await adminApi.updatePlan(plan.id, localToApiPayload(plan));
        savedAny = true;
      } catch {
        errors++;
      }
    }
    // Always also persist locally so the rest of the admin UI stays consistent.
    updatePricing(localPricing);
    setIsSaving(false);
    if (errors) toast.error(`${errors} plan(s) failed to save to backend`);
    else if (savedAny) toast.success('Pricing saved to backend');
    else toast.success('Pricing saved (local only — no plan IDs found)');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const plans = ['starter', 'growth', 'agency'];

  return (
    <div className="space-y-6" data-testid="pricing-page">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#09090B]">Pricing Manager</h2>
        <p className="text-sm text-[#71717A] mt-1">
          Changes here automatically reflect on the public pricing page
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((planKey) => {
          const plan = localPricing[planKey];
          const isPopular = plan.popular;
          const isAgency = planKey === 'agency';

          return (
            <div 
              key={planKey}
              className={`admin-card p-6 ${isPopular ? 'ring-2 ring-[#1D9E75]' : ''}`}
              data-testid={`plan-card-${planKey}`}
            >
              {isPopular && (
                <div className="flex items-center gap-1 text-[#1D9E75] text-xs font-semibold mb-3">
                  <Star size={14} fill="currentColor" />
                  Most Popular
                </div>
              )}

              {/* Plan Name */}
              <div className="space-y-1 mb-4">
                <Label className="text-xs text-[#71717A]">Plan Name</Label>
                <Input
                  value={plan.name}
                  onChange={(e) => handlePlanChange(planKey, 'name', e.target.value)}
                  className="admin-input font-semibold"
                  data-testid={`plan-name-${planKey}`}
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <Label className="text-xs text-[#71717A]">Monthly ($)</Label>
                  <Input
                    type="number"
                    value={plan.monthlyPrice}
                    onChange={(e) => handlePlanChange(planKey, 'monthlyPrice', parseInt(e.target.value) || 0)}
                    className="admin-input"
                    data-testid={`plan-monthly-${planKey}`}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#71717A]">Annual ($)</Label>
                  <Input
                    type="number"
                    value={plan.annualPrice}
                    onChange={(e) => handlePlanChange(planKey, 'annualPrice', parseInt(e.target.value) || 0)}
                    className="admin-input"
                    data-testid={`plan-annual-${planKey}`}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 mb-4">
                <Label className="text-xs text-[#71717A]">Description</Label>
                <Textarea
                  value={plan.description}
                  onChange={(e) => handlePlanChange(planKey, 'description', e.target.value)}
                  className="admin-input min-h-[60px] text-sm"
                />
              </div>

              {/* Feature Limits */}
              <div className="border-t border-[#F0F0F0] pt-4 mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#71717A] mb-3">Feature Limits</p>
                <div className="grid grid-cols-2 gap-3">
                  <LimitInput
                    label="Articles/month"
                    value={plan.limits.articles}
                    onChange={(v) => handleLimitChange(planKey, 'articles', v)}
                    isUnlimited={plan.limits.articles === 'unlimited'}
                  />
                  <LimitInput
                    label="Social posts/month"
                    value={plan.limits.socialPosts}
                    onChange={(v) => handleLimitChange(planKey, 'socialPosts', v)}
                    isUnlimited={plan.limits.socialPosts === 'unlimited'}
                  />
                  <LimitInput
                    label="AI scans"
                    value={plan.limits.aiScans}
                    onChange={(v) => handleLimitChange(planKey, 'aiScans', v)}
                    isUnlimited={plan.limits.aiScans === 'unlimited'}
                  />
                  <LimitInput
                    label="Team seats"
                    value={plan.limits.teamSeats}
                    onChange={(v) => handleLimitChange(planKey, 'teamSeats', v)}
                    isUnlimited={plan.limits.teamSeats === 'unlimited'}
                  />
                  <LimitInput
                    label="Website connections"
                    value={plan.limits.cmsConnections}
                    onChange={(v) => handleLimitChange(planKey, 'cmsConnections', v)}
                    isUnlimited={plan.limits.cmsConnections === 'unlimited'}
                  />
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="border-t border-[#F0F0F0] pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#71717A] mb-2">Features</p>
                <FeatureToggle
                  label="Brand Voice Model"
                  checked={plan.features.brandVoice}
                  onChange={(v) => handleFeatureChange(planKey, 'brandVoice', v)}
                />
                <FeatureToggle
                  label="Competitor Comparison"
                  checked={plan.features.competitorComparison}
                  onChange={(v) => handleFeatureChange(planKey, 'competitorComparison', v)}
                />
                <FeatureToggle
                  label="Priority Support"
                  checked={plan.features.prioritySupport}
                  onChange={(v) => handleFeatureChange(planKey, 'prioritySupport', v)}
                />
                <FeatureToggle
                  label="White Label"
                  checked={plan.features.whiteLabel}
                  onChange={(v) => handleFeatureChange(planKey, 'whiteLabel', v)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={isSaving} className="admin-btn-primary" data-testid="save-pricing-btn">
          <Check size={16} className="mr-2" />
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
        <Button
          variant="outline"
          className="admin-btn-secondary"
          onClick={() => window.open('/pricing', '_blank', 'noopener,noreferrer')}
          data-testid="preview-pricing-btn"
        >
          Preview on website
        </Button>
      </div>

      <p className="text-xs text-[#71717A]">
        Saved changes reflect instantly on the public pricing page.
      </p>
    </div>
  );
};
