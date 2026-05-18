// Brand logo image (full wordmark). Uses /seo-jalwa-logo.png from public/.
// Height-driven sizing so the wordmark stays crisp at any scale.

export const Logo = ({ height = 32, className = '', alt = 'SEO Jalwa' }) => (
  <img
    src="/seo-jalwa-logo.png"
    alt={alt}
    height={height}
    style={{ height, width: 'auto' }}
    className={`object-contain select-none ${className}`}
    draggable={false}
  />
);

// Square app icon variant (for sidebars, favicons inline, etc.)
export const LogoIcon = ({ size = 32, className = '', alt = 'SEO Jalwa' }) => (
  <img
    src="/seo-jalwa-icon.png"
    alt={alt}
    width={size}
    height={size}
    className={`object-contain select-none ${className}`}
    draggable={false}
  />
);
