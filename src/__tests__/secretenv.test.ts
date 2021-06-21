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

  it('should resolve AWS Secrets Manager SecretString', async () => {
    const testAwsSecret =
      'aws-secrets://arn:aws:secretsmanager:us-east-2:123456789012:secret:my-simple-secret';
    const testAwsSecretValue = 'my-simple-secret-value';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SECRET: testAwsSecret,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET']).toEqual(testAwsSecretValue);
  });

  it('should resolve AWS Secrets Manager SecretString with version stage', async () => {
    const testAwsSecret =
      'aws-secrets://arn:aws:secretsmanager:us-east-2:123456789012:secret:my/Complex/Secret@:stage:STAGING';
    const testAwsSecretValue = 'my-complex-secret-value-staging';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SECRET_STAGE: testAwsSecret,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET_STAGE']).toEqual(testAwsSecretValue);
  });

  it('should resolve AWS Secrets Manager SecretString with version id', async () => {
    const testAwsSecret =
      'aws-secrets://arn:aws:secretsmanager:us-east-2:123456789012:secret:my/Complex/Secret@:version:f5529425-1aa3-4f8b-85c6-7e94e559bd0d';
    const testAwsSecretValue = 'my-complex-secret-value-specificid';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SECRET_VERSION: testAwsSecret,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET_VERSION']).toEqual(testAwsSecretValue);
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

  it('should not resolve incorrectly formatted AWS Secrets Manager Parameters', async () => {
    let badAwsSecretName =
      'aws-secrets//arn:aws:secretsmanager:us-east-2:123456789:secret:my/secret';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SECRET: badAwsSecretName,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET']).toEqual(badAwsSecretName);
    badAwsSecretName =
      'aws-secrets://arn:aws:secretsmanager:us-east-2:123456789:my/secret';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SECRET: badAwsSecretName,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET']).toEqual(badAwsSecretName);
    badAwsSecretName =
      'arn:aws:secretsmanager:us-east-2:123456789:secret:my/secret';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SECRET: badAwsSecretName,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET']).toEqual(badAwsSecretName);
    badAwsSecretName =
      'aws-secrets://arn:aws:secretsmanager:us-east-2:123456789:secret:';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SECRET: badAwsSecretName,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET']).toEqual(badAwsSecretName);
    badAwsSecretName =
      'aws-secrets://arn:aws:secretsmanager::123456789:secret:my/secret';
    process.env = Object.assign(testEnv, {
      SOME_AWS_SECRET: badAwsSecretName,
    });
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET']).toEqual(badAwsSecretName);
  });

  afterAll(async () => {
    // Restore env
    process.env = oldEnv;
  });
});
