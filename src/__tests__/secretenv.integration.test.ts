describe('ResolveEnv', () => {
  const oldEnv = process.env;

  beforeAll(() => {
    jest.unmock('@google-cloud/secret-manager');
  });

  it('should resolve a test GCP Secret', async () => {
    const testGcpSecretName = `gcp-secrets://projects/${process.env.GCP_PROJECT_ID}/secrets/${process.env.TEST_SECRET_NAME}/versions/latest`;
    const testGcpSecretValue = process.env.TEST_SECRET_VALUE;
    process.env = Object.assign(oldEnv, {
      SOME_GCP_SECRET: testGcpSecretName,
    });
    const {resolveEnv} = await import('../secretenv');
    await resolveEnv();
    expect(process.env['SOME_GCP_SECRET']).toEqual(testGcpSecretValue);
  });

  afterAll(async () => {
    // Restore env
    process.env = oldEnv;
  });
});
