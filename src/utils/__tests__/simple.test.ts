import { extractTenant, isDevelopment, getMainDomainUrl } from '@/utils/tenant';

describe('tenant utilities (simple tests)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_BASE_DOMAIN = 'atomsuit.test';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('extractTenant', () => {
    it('should identify central domain correctly', () => {
      expect(extractTenant('atomsuit.test')).toEqual({
        subdomain: '',
        isCentral: true,
      });

      expect(extractTenant('www.atomsuit.test')).toEqual({
        subdomain: '',
        isCentral: true,
      });
    });

    it('should extract valid subdomain', () => {
      expect(extractTenant('company1.atomsuit.test')).toEqual({
        subdomain: 'company1',
        isCentral: false,
      });

      expect(extractTenant('test-company.atomsuit.test')).toEqual({
        subdomain: 'test-company',
        isCentral: false,
      });
    });

    it('should handle reserved subdomains', () => {
      const reservedSubdomains = ['www', 'api', 'admin', 'mail', 'ftp'];

      reservedSubdomains.forEach((subdomain) => {
        expect(extractTenant(`${subdomain}.atomsuit.test`)).toEqual({
          subdomain: '',
          isCentral: true,
        });
      });
    });

    it('should handle hostnames with ports', () => {
      expect(extractTenant('company1.atomsuit.test:3000')).toEqual({
        subdomain: 'company1',
        isCentral: false,
      });

      expect(extractTenant('atomsuit.test:3000')).toEqual({
        subdomain: '',
        isCentral: true,
      });
    });

    it('should work when NEXT_PUBLIC_BASE_DOMAIN includes port', () => {
      process.env.NEXT_PUBLIC_BASE_DOMAIN = 'cubet.test:3000';

      expect(extractTenant('cubet.test:3000')).toEqual({
        subdomain: '',
        isCentral: true,
      });

      expect(extractTenant('company.cubet.test:3000')).toEqual({
        subdomain: 'company',
        isCentral: false,
      });

      expect(extractTenant('cubet.test')).toEqual({
        subdomain: '',
        isCentral: true,
      });
    });

    it('should detect custom domains', () => {
      expect(extractTenant('app.clientname.com')).toEqual({
        subdomain: 'app.clientname.com',
        isCentral: false,
        isCustomDomain: true,
      });

      expect(extractTenant('custom.example.org:8080')).toEqual({
        subdomain: 'custom.example.org',
        isCentral: false,
        isCustomDomain: true,
      });
    });

    it('should treat localhost as central', () => {
      expect(extractTenant('localhost')).toEqual({
        subdomain: '',
        isCentral: true,
      });

      expect(extractTenant('127.0.0.1')).toEqual({
        subdomain: '',
        isCentral: true,
      });
    });

    it('should handle invalid hostnames', () => {
      expect(extractTenant('localhost')).toEqual({
        subdomain: '',
        isCentral: true,
      });
    });
  });

  describe('isDevelopment', () => {
    it('should return true in development', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = 'development';
      expect(isDevelopment()).toBe(true);
    });

    it('should return false in production', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = 'production';
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('getMainDomainUrl', () => {
    it('should return http URL in development', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = 'development';
      expect(getMainDomainUrl()).toBe('http://atomsuit.test');
    });

    it('should return https URL in production', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = 'production';
      expect(getMainDomainUrl()).toBe('https://atomsuit.test');
    });
  });
});
