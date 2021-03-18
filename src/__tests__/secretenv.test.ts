import {resolveEnv} from '../secretenv';

describe('ResolveEnv', () => {
  const testEnv: NodeJS.ProcessEnv = {
    FOO: 'BAR',
  };
  const oldEnv = process.env;

  afterEach(async () => {
    // Reset the env
    process.env = Object.assign({} as NodeJS.ProcessEnv, testEnv);
  });

  it('should not modify regular environment variables', async () => {
    process.env = testEnv;
    await resolveEnv();
    expect(process.env['FOO']).toEqual(testEnv['FOO']);
  });

  it('should resolve GCP Secrets', async () => {
    const testGcpSecretName =
      'gcp-secrets://projects/projectfoo/secrets/secretbar/versions/latest';
    const testGcpSecretValue = 'somesecretvalue';
    process.env = Object.assign(testEnv, {
      SOME_GCP_SECRET: testGcpSecretName,
    });
    await resolveEnv();
    expect(process.env['SOME_GCP_SECRET']).toEqual(testGcpSecretValue);
  });

  it('should not resolve incorrectly formatted GCP Secrets', async () => {
    let badGcpSecretName =
      'gcp-secret://projects/projectfoo/secrets/secretbar/versions/latest';
    process.env = Object.assign(testEnv, {
      SOME_GCP_SECRET: badGcpSecretName,
    });
    await resolveEnv();
    expect(process.env['SOME_GCP_SECRET']).toEqual(badGcpSecretName);
    badGcpSecretName = 'projects/projectfoo/secrets/secretbar/versions/latest';
    process.env = Object.assign(testEnv, {
      SOME_GCP_SECRET: badGcpSecretName,
    });
    await resolveEnv();
    expect(process.env['SOME_GCP_SECRET']).toEqual(badGcpSecretName);
    badGcpSecretName =
      'gcp-secrets://projects/projectfoo/secrets/secretbar/versions/';
    process.env = Object.assign(testEnv, {
      SOME_GCP_SECRET: badGcpSecretName,
    });
    await resolveEnv();
    expect(process.env['SOME_GCP_SECRET']).toEqual(badGcpSecretName);
    badGcpSecretName =
      'gcp-secrets://projects//secrets/secretbar/versions/latest';
    process.env = Object.assign(testEnv, {
      SOME_GCP_SECRET: badGcpSecretName,
    });
    await resolveEnv();
    expect(process.env['SOME_GCP_SECRET']).toEqual(badGcpSecretName);
  });

  afterEach(async () => {
    // Restore env
    process.env = oldEnv;
  });
});
