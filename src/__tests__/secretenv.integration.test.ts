import aws from 'aws-sdk';
import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

jest.unmock('@google-cloud/secret-manager');
jest.unmock('aws-sdk');
const gcpSecretsClient = new SecretManagerServiceClient();
const ssmClient = new aws.SSM({
  region: process.env.AWS_REGION ?? 'us-east-2',
  ...(process.env.AWS_SSM_ENDPOINT_URL && {
    endpoint: process.env.AWS_SSM_ENDPOINT_URL,
  }),
  ...(process.env.AWS_SSM_ENDPOINT_TLS === '0' && {tls: false}),
});
const secretsClient = new aws.SecretsManager({
  region: process.env.AWS_REGION ?? 'us-east-2',
  ...(process.env.AWS_SECRETS_MANAGER_ENDPOINT_URL && {
    endpoint: process.env.AWS_SECRETS_MANAGER_ENDPOINT_URL,
  }),
  ...(process.env.AWS_SECRETS_MANAGER_ENDPOINT_TLS === '0' && {tls: false}),
});

/** AWS Secrets Manager */
const testAwsSecretsManagerTestSecretName = 'testing/secretenvTestSecret';
const testAwsSecretsManagerEnvVar = `aws-secrets://arn:aws:secretsmanager:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:secret:${testAwsSecretsManagerTestSecretName}`;
const testAwsSecretsManagerTestSecretCurrentValue =
  'secretenv-test-current-value';
const testAwsSecretsManagerTestSecretStagingValue =
  'secretenv-test-staging-value';

/** AWS SSM */
const testAwsSsmParameterName =
  process.env.TEST_SECRET_NAME ?? 'secretenv-test-param';
const testAwsSsmParameterEnvVar = `aws-ssm://arn:aws:ssm:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:parameter/${testAwsSsmParameterName}:encrypted`;
const testAwsSsmParameterValue =
  process.env.TEST_SECRET_VALUE ?? 'mysecretawsssmvalue';
const testAwsSsmParameterUnencryptedName =
  process.env.TEST_SECRET_NAME ?? 'secretenv-test-param-unencrypted';
const testAwsSsmParameterUnencryptedEnvVar = `aws-ssm://arn:aws:ssm:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:parameter/${testAwsSsmParameterUnencryptedName}`;
const testAwsSsmParameterUnencryptedValue =
  process.env.TEST_SECRET_VALUE ?? 'mysecretawsssmvalue-unencrypted';

/** GCP */
const testGcpSecretName =
  process.env.TEST_SECRET_NAME ?? 'secretenv-test-param';
const testGcpSecretEnvVar = `gcp-secrets://projects/${process.env.GCP_PROJECT_ID}/secrets/${testGcpSecretName}/versions/latest`;
const testGcpSecretValue =
  process.env.TEST_SECRET_VALUE ?? 'mysecretgcpsecretvalue';

describe('ResolveEnv', () => {
  const oldEnv = process.env;
  let testAwsSecretsManagerTestSecretArn: string;
  let testAwsSecretsManagerTestSecretStagingId: string | undefined;

  beforeAll(async () => {
    // Create GCP secret
    try {
      await gcpSecretsClient.createSecret({
        parent: `projects/${process.env.GCP_PROJECT_ID ?? ''}`,
        secretId: testGcpSecretName,
        secret: {
          replication: {
            automatic: {},
          },
        },
      });
      await gcpSecretsClient.addSecretVersion({
        parent: `projects/${process.env.GCP_PROJECT_ID}/secrets/${testGcpSecretName}`,
        payload: {data: new TextEncoder().encode(testGcpSecretValue)},
      });
    } catch (e) {
      console.error('error creating test GCP secret', e);
      throw e;
    }
    // Create AWS SSM Parameter
    try {
      await ssmClient
        .putParameter({
          Name: testAwsSsmParameterName,
          Value: testAwsSsmParameterValue,
          Type: 'SecureString',
          KeyId: process.env.AWS_SSM_KMS_KEY_ID ?? '',
        })
        .promise();
    } catch (e) {
      console.error('error creating test AWS SSM parameter', e);
      throw e;
    }
    // Create AWS SSM Parameter (unencrypted)
    try {
      await ssmClient
        .putParameter({
          Name: testAwsSsmParameterUnencryptedName,
          Value: testAwsSsmParameterUnencryptedValue,
          Type: 'String',
        })
        .promise();
    } catch (e) {
      console.error('error creating test AWS SSM parameter (unencrypted)', e);
      throw e;
    }
    // Create AWS secret with multiple versions
    /** AWSCURRENT */
    try {
      await secretsClient
        .createSecret({
          Name: testAwsSecretsManagerTestSecretName,
          SecretString: testAwsSecretsManagerTestSecretCurrentValue,
        } as AWS.SecretsManager.CreateSecretRequest)
        .promise()
        .then((res: AWS.SecretsManager.CreateSecretResponse) => {
          testAwsSecretsManagerTestSecretArn = res.ARN ?? '';
          return secretsClient
            .putSecretValue({
              SecretString: testAwsSecretsManagerTestSecretStagingValue,
              SecretId: res.ARN,
              VersionStages: ['STAGING'],
            } as AWS.SecretsManager.PutSecretValueRequest)
            .promise()
            .then((res: AWS.SecretsManager.PutSecretValueResponse) => {
              testAwsSecretsManagerTestSecretStagingId = res.VersionId;
            });
        });
    } catch (e) {
      console.error('error creating AWS Secrets Manager SecretString', e);
      throw e;
    }
  });

  it('should resolve a test GCP Secret', async () => {
    process.env = Object.assign(oldEnv, {
      SOME_GCP_SECRET: testGcpSecretEnvVar,
    });
    const {resolveEnv} = await import('../secretenv');
    await resolveEnv();
    expect(process.env['SOME_GCP_SECRET']).toEqual(testGcpSecretValue);
  });

  it('should resolve a test AWS SSM Parameter', async () => {
    process.env = Object.assign(oldEnv, {
      SOME_AWS_SSM_PARAMETER: testAwsSsmParameterEnvVar,
    });
    const {resolveEnv} = await import('../secretenv');
    await resolveEnv();
    expect(process.env['SOME_AWS_SSM_PARAMETER']).toEqual(
      testAwsSsmParameterValue,
    );
  });

  it('should resolve a test AWS SSM Parameter (unencrypted)', async () => {
    process.env = Object.assign(oldEnv, {
      SOME_AWS_SSM_UNENCRYPTED_PARAMETER: testAwsSsmParameterUnencryptedEnvVar,
    });
    const {resolveEnv} = await import('../secretenv');
    await resolveEnv();
    expect(process.env['SOME_AWS_SSM_UNENCRYPTED_PARAMETER']).toEqual(
      testAwsSsmParameterUnencryptedValue,
    );
  });

  it('should resolve a test AWS Secrets Manager SecretString', async () => {
    process.env = Object.assign(oldEnv, {
      SOME_AWS_SECRET: testAwsSecretsManagerEnvVar,
    });
    const {resolveEnv} = await import('../secretenv');
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET']).toEqual(
      testAwsSecretsManagerTestSecretCurrentValue,
    );
  });

  it('should resolve a test AWS Secrets Manager SecretString by version stage', async () => {
    process.env = Object.assign(oldEnv, {
      SOME_AWS_SECRET_CURRENT: `${testAwsSecretsManagerEnvVar}:stage:AWSCURRENT`,
    });
    const {resolveEnv} = await import('../secretenv');
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET_CURRENT']).toEqual(
      testAwsSecretsManagerTestSecretCurrentValue,
    );
  });

  it('should resolve a test AWS Secrets Manager SecretString by version id', async () => {
    process.env = Object.assign(oldEnv, {
      SOME_AWS_SECRET_ID: `${testAwsSecretsManagerEnvVar}:version:${testAwsSecretsManagerTestSecretStagingId}`,
    });
    const {resolveEnv} = await import('../secretenv');
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET_ID']).toEqual(
      testAwsSecretsManagerTestSecretStagingValue,
    );
  });

  it('should resolve a test AWS Secrets Manager SecretString by version stage and id', async () => {
    process.env = Object.assign(oldEnv, {
      SOME_AWS_SECRET_STAGE_ID: `${testAwsSecretsManagerEnvVar}:stage:STAGING:version:${testAwsSecretsManagerTestSecretStagingId}`,
    });
    const {resolveEnv} = await import('../secretenv');
    await resolveEnv();
    expect(process.env['SOME_AWS_SECRET_STAGE_ID']).toEqual(
      testAwsSecretsManagerTestSecretStagingValue,
    );
  });

  it('should throw an error if Secret Manager stage and id do not match', async () => {
    process.env = Object.assign(oldEnv, {
      SOME_AWS_SECRET_NOMATCH: `${testAwsSecretsManagerEnvVar}:stage:AWSCURRENT:version:${testAwsSecretsManagerTestSecretStagingId}`,
    });
    const {resolveEnv} = await import('../secretenv');
    await expect(resolveEnv()).rejects.toThrow();
  });

  afterAll(async () => {
    // Restore env
    process.env = oldEnv;
    // Delete GCP secret
    try {
      await gcpSecretsClient.deleteSecret({
        name: `projects/${process.env.GCP_PROJECT_ID}/secrets/${testGcpSecretName}`,
      });
    } catch (e) {
      console.error('error deleting test GCP secret', e);
      throw e;
    }
    // Delete AWS SSM Parameter
    try {
      await ssmClient
        .deleteParameter({Name: testAwsSsmParameterName})
        .promise();
    } catch (e) {
      console.error('error deleting test AWS SSM parameter', e);
      throw e;
    }
    // Delete AWS SSM Parameter (Unencrypted)
    try {
      await ssmClient
        .deleteParameter({
          Name: testAwsSsmParameterUnencryptedName,
        })
        .promise();
    } catch (e) {
      console.error('error deleting test AWS SSM parameter (unencrypted)', e);
      throw e;
    }
    // Delete AWS Secrets Manager Secret
    try {
      await secretsClient
        .deleteSecret({
          SecretId: testAwsSecretsManagerTestSecretArn,
          ForceDeleteWithoutRecovery: true,
        } as AWS.SecretsManager.DeleteSecretRequest)
        .promise();
    } catch (e) {
      console.error('error deleting test AWS Secrets Manager secret', e);
      throw e;
    }
  });
});
