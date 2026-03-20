/**
 * Tenant utility functions for multi-tenant architecture
 */

export interface TenantInfo {
  subdomain: string;
  isCentral: boolean;
  isValid?: boolean;
  isCustomDomain?: boolean;
}

/**
 * Extract tenant subdomain from hostname
 * @param hostname - The hostname to extract tenant from
 * @returns TenantInfo object with subdomain and central login flag
 */
export function extractTenant(hostname: string): TenantInfo {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0];

  // Get base domain from environment or default, strip port for comparison
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'atomsuit.test';
  const cleanBaseDomain = baseDomain.split(':')[0];

  // Check if it's the main domain (central login)
  if (cleanHostname === cleanBaseDomain || cleanHostname === `www.${cleanBaseDomain}`) {
    return {
      subdomain: '',
      isCentral: true,
    };
  }

  // Check if it's a subdomain of the base domain
  const escapedBase = cleanBaseDomain.replace(/\./g, '\\.');
  const subdomainPattern = new RegExp(`^([^.]+)\\.${escapedBase}$`);
  const subdomainMatch = cleanHostname.match(subdomainPattern);

  if (subdomainMatch) {
    const subdomain = subdomainMatch[1];

    // Reserved subdomains that should redirect to central
    const reservedSubdomains = ['www', 'api', 'admin', 'mail', 'ftp'];

    if (reservedSubdomains.includes(subdomain)) {
      return {
        subdomain: '',
        isCentral: true,
      };
    }

    return {
      subdomain,
      isCentral: false,
    };
  }

  // If hostname doesn't match base domain pattern, it might be a custom domain.
  // Send the full hostname as subdomain for the backend to resolve directly.
  // Exclude common non-tenant hostnames.
  const nonTenantHosts = ['localhost', '127.0.0.1'];
  if (!nonTenantHosts.includes(cleanHostname)) {
    return {
      subdomain: cleanHostname,
      isCentral: false,
      isCustomDomain: true,
    };
  }

  return {
    subdomain: '',
    isCentral: true,
  };
}

/**
 * Get tenant info from browser window location
 * @returns TenantInfo object
 */
export function getTenantFromBrowser(): TenantInfo {
  if (typeof window === 'undefined') {
    return { subdomain: '', isCentral: true };
  }

  return extractTenant(window.location.hostname);
}

/**
 * Get tenant info from Next.js request headers
 * @param headers - Request headers
 * @returns TenantInfo object
 */
export function getTenantFromHeaders(headers: Headers): TenantInfo {
  const host = headers.get('host');
  if (!host) {
    return { subdomain: '', isCentral: true };
  }

  return extractTenant(host);
}

/**
 * Build URL for tenant or central domain
 * @param path - Path to append
 * @param tenant - Tenant info
 * @returns Complete URL
 */
export function buildTenantUrl(path: string = '', tenant?: TenantInfo): string {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'atomsuit.test';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  if (!tenant) {
    tenant = getTenantFromBrowser();
  }

  const domain = tenant.isCentral ? baseDomain : `${tenant.subdomain}.${baseDomain}`;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${protocol}://${domain}${cleanPath}`;
}

/**
 * Check if current environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get main domain URL for redirects
 */
export function getMainDomainUrl(): string {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'atomsuit.test';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${baseDomain}`;
}
