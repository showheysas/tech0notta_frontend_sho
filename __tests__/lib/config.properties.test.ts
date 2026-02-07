import * as fc from 'fast-check';

/**
 * Feature: frontend-sho-v2, Property 34: Environment Variable Access
 * Validates: Requirements 3.12.4
 * 
 * For any required environment variable (NEXT_PUBLIC_API_URL), 
 * the system should successfully read and use the configured value.
 */
describe('Property 34: Environment Variable Access', () => {
  const testConfig = {
    numRuns: 100,
    verbose: true,
  };

  it('should successfully read NEXT_PUBLIC_API_URL environment variable', () => {
    fc.assert(
      fc.property(
        fc.constant(process.env.NEXT_PUBLIC_API_URL),
        (apiUrl) => {
          // The environment variable should be defined
          expect(apiUrl).toBeDefined();
          
          // It should be a non-empty string
          expect(typeof apiUrl).toBe('string');
          expect(apiUrl).not.toBe('');
          
          // It should be a valid URL format
          if (apiUrl) {
            expect(() => new URL(apiUrl)).not.toThrow();
          }
        }
      ),
      testConfig
    );
  });

  it('should provide a valid HTTPS URL for API endpoint', () => {
    fc.assert(
      fc.property(
        fc.constant(process.env.NEXT_PUBLIC_API_URL),
        (apiUrl) => {
          if (apiUrl) {
            const url = new URL(apiUrl);
            
            // Should use HTTPS protocol for security
            expect(url.protocol).toBe('https:');
            
            // Should have a valid hostname
            expect(url.hostname).toBeTruthy();
            expect(url.hostname.length).toBeGreaterThan(0);
          }
        }
      ),
      testConfig
    );
  });

  it('should maintain consistent API URL value across multiple reads', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constant(null), { minLength: 2, maxLength: 10 }),
        (iterations) => {
          // Read the environment variable multiple times
          const readings = iterations.map(() => process.env.NEXT_PUBLIC_API_URL);
          
          // All readings should be identical
          const firstReading = readings[0];
          readings.forEach(reading => {
            expect(reading).toBe(firstReading);
          });
        }
      ),
      testConfig
    );
  });

  it('should be accessible from any module in the application', () => {
    fc.assert(
      fc.property(
        fc.constant(process.env.NEXT_PUBLIC_API_URL),
        (apiUrl) => {
          // Environment variable should be accessible
          expect(apiUrl).toBeDefined();
          
          // Should be the expected Azure backend URL
          if (apiUrl) {
            expect(apiUrl).toContain('azurewebsites.net');
          }
        }
      ),
      testConfig
    );
  });
});
