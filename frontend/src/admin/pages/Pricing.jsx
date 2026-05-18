import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
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

const LimitInput = ({ label, value, onChange, isUnlimited }) => (
  <div className="space-y-1">
    <Label className="text-xs text-[#71717A]">{label}</Label>
    {isUnlimited ? (
      <div className="h-10 px-3 flex items-center bg-[#FAFAFA] rounded-md text-sm text-[#71717A]">
        Unlimited
      </div>
    ) : (
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="admin-input"
      />
    )}
  </div>
);

export const Pricing = () => {
  const { pricing, updatePricing } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [localPricing, setLocalPricing] = useState(pricing);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
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

  const handleSave = () => {
    updatePricing(localPricing);
    toast.success('Pricing saved successfully');
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
                    label="CMS connections"
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
        <Button onClick={handleSave} className="admin-btn-primary" data-testid="save-pricing-btn">
          <Check size={16} className="mr-2" />
          Save changes
        </Button>
        <Button variant="outline" className="admin-btn-secondary">
          Preview changes
        </Button>
      </div>

      <p className="text-xs text-[#71717A]">
        Saved changes reflect instantly on the public pricing page.
      </p>
    </div>
  );
};
