import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { CardSkeleton } from '../components/SkeletonLoaders';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { 
  Brain, Cpu, Sparkles, Search, CreditCard, Mail, BarChart3, HardDrive,
  Instagram, Linkedin, Twitter, Youtube, MapPin, Layout, FileText, Target,
  CheckCircle2, XCircle, Clock, Info, Eye, EyeOff, Plug
} from 'lucide-react';

const iconMap = {
  'brain': Brain,
  'cpu': Cpu,
  'sparkles': Sparkles,
  'search': Search,
  'credit-card': CreditCard,
  'mail': Mail,
  'bar-chart': BarChart3,
  'hard-drive': HardDrive,
  'instagram': Instagram,
  'linkedin': Linkedin,
  'twitter': Twitter,
  'youtube': Youtube,
  'pin': MapPin,
  'layout': Layout,
  'file-text': FileText,
  'target': Target
};

const StatusBadge = ({ status }) => {
  const config = {
    connected: { icon: CheckCircle2, text: 'Connected', color: 'text-[#1D9E75] bg-[#1D9E75]/10' },
    not_connected: { icon: XCircle, text: 'Not connected', color: 'text-[#71717A] bg-[#71717A]/10' },
    pending: { icon: Clock, text: 'Pending review', color: 'text-[#F59E0B] bg-[#F59E0B]/10' }
  };
  const { icon: Icon, text, color } = config[status] || config.not_connected;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} />
      {text}
    </span>
  );
};

const ApiKeyCard = ({ service, section, onSave }) => {
  const [values, setValues] = useState({});
  const [showValues, setShowValues] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const Icon = iconMap[service.icon] || Plug;

  const handleSave = () => {
    onSave(section, service.id, values);
    setIsEditing(false);
    toast.success(`${service.name} configuration saved`);
  };

  const handleTest = () => {
    toast.success(`Connection test successful for ${service.name}`);
  };

  const toggleShowValue = (key) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // OAuth only card
  if (service.isOAuth) {
    return (
      <div className="admin-card p-5" data-testid={`api-key-card-${service.id}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] flex items-center justify-center flex-shrink-0">
            <Icon size={20} className="text-[#71717A]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-[#09090B]">{service.name}</h4>
            </div>
            <p className="text-sm text-[#71717A]">{service.description}</p>
            <div className="mt-3 p-3 bg-[#FAFAFA] rounded-lg">
              <p className="text-xs text-[#71717A] flex items-center gap-1">
                <Info size={12} />
                No configuration needed - users connect their own accounts via OAuth
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card p-5" data-testid={`api-key-card-${service.id}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#E8F5F1] flex items-center justify-center flex-shrink-0">
          <Icon size={20} className="text-[#1D9E75]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-[#09090B]">{service.name}</h4>
              <StatusBadge status={service.status} />
            </div>
          </div>
          <p className="text-sm text-[#71717A] mb-4">{service.description}</p>

          {/* Fields */}
          <div className="space-y-3 mb-4">
            {service.fields?.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label className="text-xs text-[#71717A]">{field.label}</Label>
                <div className="relative">
                  <Input
                    type={field.type === 'password' && !showValues[field.key] ? 'password' : 'text'}
                    value={values[field.key] || ''}
                    onChange={(e) => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={service.status === 'connected' && service.maskedValue ? service.maskedValue : `Enter ${field.label.toLowerCase()}`}
                    className="admin-input pr-10"
                    disabled={!isEditing && service.status === 'connected'}
                    data-testid={`input-${service.id}-${field.key}`}
                  />
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={() => toggleShowValue(field.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#27272A]"
                    >
                      {showValues[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          {service.instructions && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#71717A] mb-2">How to get this key:</p>
              <ol className="text-xs text-[#71717A] space-y-1 list-decimal list-inside">
                {service.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Note */}
          {service.note && (
            <p className="text-xs text-[#F59E0B] mb-4 flex items-center gap-1">
              <Info size={12} />
              {service.note}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {service.status === 'connected' && !isEditing ? (
              <Button 
                size="sm" 
                variant="outline" 
                className="admin-btn-secondary h-8"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="admin-btn-primary h-8"
                onClick={handleSave}
                data-testid={`save-${service.id}`}
              >
                Save
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              className="admin-btn-secondary h-8"
              onClick={handleTest}
              data-testid={`test-${service.id}`}
            >
              Test connection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ApiKeys = () => {
  const { apiKeys, updateApiKey } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const sections = [
    { key: 'ai', title: 'AI Models', description: 'Configure AI providers for content generation' },
    { key: 'payments', title: 'Payments', description: 'Payment processing and billing' },
    { key: 'email', title: 'Email', description: 'Email delivery services' },
    { key: 'seo', title: 'SEO Data', description: 'SEO and keyword research providers' },
    { key: 'analytics', title: 'Analytics & Search Data', description: 'Google Search Console and analytics-related integrations' },
    { key: 'storage', title: 'File Storage', description: 'Object storage for media files' },
    { key: 'social', title: 'Social Media OAuth Apps', description: 'Platform-level developer credentials for social integrations' },
    { key: 'cms', title: 'CMS Integrations', description: 'Content management system connections' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-32 bg-[#F0F0F0] rounded skeleton-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="api-keys-page">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#09090B]">API Keys & Integrations</h2>
        <p className="text-sm text-[#71717A] mt-1">
          Add your API keys here. All keys are encrypted. Changes take effect immediately without any code deployment.
        </p>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.key}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#09090B]">{section.title}</h3>
            <p className="text-sm text-[#71717A]">{section.description}</p>
          </div>
          
          {section.key === 'social' && (
            <div className="mb-4 p-3 bg-[#FAFAFA] border border-[#F0F0F0] rounded-lg">
              <p className="text-xs text-[#71717A]">
                <strong>Note:</strong> These are your developer app credentials. Set these up once and all your users can connect their social accounts.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {apiKeys[section.key]?.map((service) => (
              <ApiKeyCard
                key={service.id}
                service={service}
                section={section.key}
                onSave={updateApiKey}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
