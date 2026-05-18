// Colored brand-style square logo. 40x40 by default.
// Used on /integrations grid, homepage marquee, /dashboard/connections.

const LOGOS = {
  WordPress:    { bg: '#21759B', label: 'W',   gradient: null },
  Shopify:      { bg: '#96BF48', label: 'S',   gradient: null },
  Webflow:      { bg: '#4353FF', label: 'W',   gradient: null },
  Ghost:        { bg: '#15171A', label: 'G',   gradient: null },
  HubSpot:      { bg: '#FF7A59', label: 'H',   gradient: null },
  Wix:          { bg: '#000000', label: 'Wix', gradient: null, small: true },
  Squarespace:  { bg: '#000000', label: 'SS',  gradient: null, small: true },
  Notion:       { bg: '#000000', label: 'N',   gradient: null },
  'Next.js':    { bg: '#000000', label: 'N',   gradient: null },
  Instagram:    { bg: null,      label: 'IG',  gradient: 'linear-gradient(135deg, #E1306C 0%, #F77737 100%)', small: true },
  Facebook:     { bg: '#1877F2', label: 'f',   gradient: null },
  LinkedIn:     { bg: '#0A66C2', label: 'in',  gradient: null, small: true },
  'X / Twitter':{ bg: '#000000', label: 'X',   gradient: null },
  X:            { bg: '#000000', label: 'X',   gradient: null },
  Twitter:      { bg: '#000000', label: 'X',   gradient: null },
  Pinterest:    { bg: '#E60023', label: 'P',   gradient: null },
  YouTube:      { bg: '#FF0000', label: '▶',   gradient: null, small: true },
  Google:       { bg: '#4285F4', label: 'G',   gradient: null },
  'Google Search Console': { bg: '#4285F4', label: 'G', gradient: null },
  Zapier:       { bg: '#FF4A00', label: 'Z',   gradient: null },
  Make:         { bg: '#6D00CC', label: 'M',   gradient: null },
};

export const PlatformLogo = ({ name, size = 40, className = '' }) => {
  const config = LOGOS[name] || { bg: '#6B7280', label: (name?.[0] || '?').toUpperCase() };
  const textSize = config.small ? size * 0.4 : size * 0.5;

  return (
    <div
      className={`flex items-center justify-center rounded-lg flex-shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: config.bg || undefined,
        backgroundImage: config.gradient || undefined,
      }}
      aria-label={`${name} logo`}
      data-testid={`platform-logo-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
    >
      <span
        className="text-white font-bold leading-none"
        style={{ fontSize: textSize }}
      >
        {config.label}
      </span>
    </div>
  );
};
