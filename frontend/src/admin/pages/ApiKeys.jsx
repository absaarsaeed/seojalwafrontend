import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '../../components/ui/collapsible';
import { CardSkeleton } from '../components/SkeletonLoaders';
import {
  Eye, EyeOff, Check, Save, Loader2, AlertCircle, ChevronDown,
  Clock, ExternalLink, KeyRound,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import { adaptService, SECTIONS, SECTION_COLORS, SERVICE_CATALOG } from '../data/serviceCatalog';

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_META = {
  connected: { label: 'Connected', cls: 'bg-[#1D9E75]/10 text-[#1D9E75]' },
  not_connected: { label: 'Not connected', cls: 'bg-[#71717A]/10 text-[#71717A]' },
  error: { label: 'Error', cls: 'bg-[#EF4444]/10 text-[#EF4444]' },
  pending_review: { label: 'Pending review', cls: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
};

const relativeTime = (iso) => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffSec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (diffSec < 30) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const m = Math.round(diffSec / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.not_connected;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.cls}`}
      data-testid={`service-status-${status}`}
    >
      {meta.label}
    </span>
  );
};

const LogoSquare = ({ section, label }) => {
  const colour = SECTION_COLORS[section] || '#1D9E75';
  const initials = (label || '?').split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
      style={{ backgroundColor: colour }}
    >
      {initials}
    </div>
  );
};

// ── Per-service card ───────────────────────────────────────────────────────
const ServiceCard = ({ service, onSaved, onTested }) => {
  const [values, setValues] = useState(() => {
    // Seed inputs with masked backend value (empty string if not yet set).
    const v = {};
    for (const f of service.fields) v[f.name] = '';
    return v;
  });
  const [showSecret, setShowSecret] = useState({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [nowTick, setNowTick] = useState(0);

  // Live-relative "last tested" — re-render every 30s.
  useEffect(() => {
    if (!service.last_tested) return;
    const id = setInterval(() => setNowTick((x) => x + 1), 30_000);
    return () => clearInterval(id);
  }, [service.last_tested]);

  const handleField = (name, val) => setValues((v) => ({ ...v, [name]: val }));

  const handleSave = async () => {
    // Only send non-empty fields — empty means "don't change" so we don't blank
    // out an existing secret.
    const fieldsPayload = {};
    for (const f of service.fields) {
      const val = values[f.name];
      if (val !== '' && val !== undefined) fieldsPayload[f.name] = val;
    }
    if (Object.keys(fieldsPayload).length === 0) {
      toast.error('Enter a value before saving');
      return;
    }
    setSaving(true);
    try {
      const updated = await adminApi.updateApiKey(service.key, fieldsPayload);
      toast.success(`${service.label} saved`);
      // Clear inputs after save so the user knows they were sent.
      const cleared = {};
      for (const f of service.fields) cleared[f.name] = '';
      setValues(cleared);
      onSaved?.(adaptService(updated || { key: service.key, status: 'connected' }));
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await adminApi.testApiKey(service.key);
      const ok = res?.success !== false;
      const ms = res?.latency_ms ?? res?.latencyMs;
      const msg = res?.message || (ok ? 'Connected' : 'Connection failed');
      if (ok) {
        toast.success(`✓ ${msg}${ms != null ? ` (${ms}ms)` : ''}`);
      } else {
        toast.error(`✗ ${msg}`);
      }
      onTested?.({
        key: service.key,
        status: ok ? 'connected' : 'error',
        test_status: ok ? 'success' : 'failed',
        last_tested: res?.tested_at || new Date().toISOString(),
      });
    } catch (err) {
      toast.error(`✗ ${err?.message || 'Connection failed'}`);
      onTested?.({
        key: service.key,
        status: 'error',
        test_status: 'failed',
        last_tested: new Date().toISOString(),
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      className="admin-card p-5 space-y-4"
      data-testid={`service-card-${service.key}`}
      data-tick={nowTick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <LogoSquare section={service.section} label={service.label} />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#09090B] truncate">{service.label}</h3>
            {service.description && (
              <p className="text-xs text-[#71717A] mt-0.5 line-clamp-2">{service.description}</p>
            )}
          </div>
        </div>
        <StatusBadge status={service.status} />
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {service.fields.map((f) => {
          const isPwd = f.type === 'password';
          const shown = showSecret[f.name];
          return (
            <div key={f.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-[#71717A]">{f.label}{f.required && <span className="text-[#EF4444]"> *</span>}</Label>
                {f.isSet && <span className="text-[10px] text-[#1D9E75]"><Check size={10} className="inline mr-0.5" />Set</span>}
              </div>
              <div className="relative">
                <Input
                  type={isPwd && !shown ? 'password' : f.type === 'password' ? 'text' : f.type}
                  placeholder={f.value ? f.value : f.placeholder}
                  value={values[f.name] || ''}
                  onChange={(e) => handleField(f.name, e.target.value)}
                  className="admin-input pr-9"
                  data-testid={`service-${service.key}-field-${f.name}`}
                />
                {isPwd && (
                  <button
                    type="button"
                    onClick={() => setShowSecret((s) => ({ ...s, [f.name]: !s[f.name] }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#09090B]"
                    aria-label="Toggle visibility"
                  >
                    {shown ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* How to get this key */}
      {service.instructions && (
        <Collapsible open={howToOpen} onOpenChange={setHowToOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-[#1D9E75] hover:underline"
              data-testid={`service-${service.key}-howto-toggle`}
            >
              <KeyRound size={12} />
              {service.instructions.title || 'How to get this key'}
              <ChevronDown
                size={14}
                className={`transition-transform ${howToOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 bg-[#FAFAFA] rounded-md space-y-2 border border-[#F0F0F0]">
            {service.instructions.steps?.length > 0 && (
              <ol className="text-xs text-[#27272A] space-y-1 list-decimal pl-4">
                {service.instructions.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            )}
            {service.instructions.url && (
              <a
                href={service.instructions.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs text-[#1D9E75] hover:underline"
                data-testid={`service-${service.key}-howto-link`}
              >
                Open platform <ExternalLink size={12} />
              </a>
            )}
            {service.instructions.note && (
              <p className="text-[11px] text-[#71717A] italic">{service.instructions.note}</p>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#F0F0F0]">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="admin-btn-primary h-8"
          data-testid={`service-${service.key}-save-btn`}
        >
          {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleTest}
          disabled={testing}
          className="admin-btn-secondary h-8"
          data-testid={`service-${service.key}-test-btn`}
        >
          {testing ? (
            <><Loader2 size={14} className="animate-spin mr-1.5" />Testing...</>
          ) : (
            <>Test connection</>
          )}
        </Button>
        {service.last_tested && (
          <span className="text-xs text-[#71717A] ml-auto flex items-center gap-1">
            <Clock size={12} />
            Last tested: {relativeTime(service.last_tested)}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────
export const ApiKeys = () => {
  const [services, setServices] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await adminApi.apiKeys();
        if (cancelled) return;
        const arr = Array.isArray(list) ? list : list?.services || [];
        // Adapt + dedupe by key (backend may include catalog entries we don't recognise).
        const adapted = arr.map(adaptService);
        // If backend doesn't include some catalog entries, surface them with default not_connected state.
        const seen = new Set(adapted.map((s) => s.key));
        for (const [k, meta] of Object.entries(SERVICE_CATALOG)) {
          if (!seen.has(k)) {
            adapted.push(adaptService({ key: k, ...meta, status: 'not_connected' }));
          }
        }
        setServices(adapted);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Could not load API keys');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onCardUpdated = (updated) => {
    setServices((prev) => prev?.map((s) => (s.key === updated.key ? { ...s, ...updated } : s)) || prev);
  };

  const grouped = useMemo(() => {
    if (!services) return null;
    const map = {};
    for (const s of services) {
      const sec = s.section || 'Other';
      map[sec] = map[sec] || [];
      map[sec].push(s);
    }
    return map;
  }, [services]);

  if (!services) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card p-6 flex items-center gap-3 text-[#EF4444]" data-testid="api-keys-error">
        <AlertCircle size={20} />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="api-keys-page">
      <div>
        <h2 className="text-xl font-semibold text-[#09090B]">API Keys &amp; Integrations</h2>
        <p className="text-sm text-[#71717A] mt-1">
          Configure third-party services that power SEO Jalwa. {services.length} services configured.
        </p>
      </div>

      {SECTIONS.map((sectionName) => {
        const list = grouped[sectionName];
        if (!list || list.length === 0) return null;
        return (
          <section key={sectionName} className="space-y-4" data-testid={`api-keys-section-${sectionName.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex items-center gap-3">
              <span
                className="w-1.5 h-5 rounded-full"
                style={{ backgroundColor: SECTION_COLORS[sectionName] }}
              />
              <h3 className="text-sm font-semibold text-[#09090B]">{sectionName}</h3>
              <span className="text-xs text-[#71717A]">({list.length})</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {list.map((service) => (
                <ServiceCard
                  key={service.key}
                  service={service}
                  onSaved={onCardUpdated}
                  onTested={onCardUpdated}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
