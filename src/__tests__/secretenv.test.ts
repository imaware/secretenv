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

  it('should resolve AWS SSM Parameters', async () => {
    const testAwsSsmParameter =
      'aws-ssm://arn:aws:ssm:us-east-2:123456789:parameter/my/parameter:encrypted';
    const testAwsSsmParameterValue = 'my-value';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SSM_PARAM: testAwsSsmParameter,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SSM_PARAM']).toEqual(testAwsSsmParameterValue);
  });

  it('should resolve AWS SSM Parameters (Unencrypted)', async () => {
    const testAwsSsmParameter =
      'aws-ssm://arn:aws:ssm:us-east-2:123456789:parameter/my/parameter';
    const testAwsSsmParameterValue = 'my-value';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SSM_UNENCRYPTED_PARAM: testAwsSsmParameter,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SSM_UNENCRYPTED_PARAM']).toEqual(
      testAwsSsmParameterValue,
    );
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

  it('should not resolve incorrectly formatted AWS SSM Parameters', async () => {
    let badAwsSsmParameterName =
      'aws-ssm//arn:aws:ssm:us-east-2:123456789:/my/parameter';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SSM_PARAMETER: badAwsSsmParameterName,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SSM_PARAMETER']).toEqual(
      badAwsSsmParameterName,
    );
    badAwsSsmParameterName =
      'arn:aws:ssm:us-east-2:123456789:parameter/my/parameter';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SSM_PARAMETER: badAwsSsmParameterName,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SSM_PARAMETER']).toEqual(
      badAwsSsmParameterName,
    );
    badAwsSsmParameterName =
      'aws-ssm://arn:aws:ssm:us-east-2:123456789:parameter';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SSM_PARAMETER: badAwsSsmParameterName,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SSM_PARAMETER']).toEqual(
      badAwsSsmParameterName,
    );
    badAwsSsmParameterName =
      'aws-ssm://arn:aws:ssm::123456789:parameter/my/parameter';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SSM_PARAMETER: badAwsSsmParameterName,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SSM_PARAMETER']).toEqual(
      badAwsSsmParameterName,
    );
  });

  afterAll(async () => {
    // Restore env
    process.env = oldEnv;
  });
});
