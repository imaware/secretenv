import aws from 'aws-sdk';
import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

jest.unmock('@google-cloud/secret-manager');
jest.unmock('aws-sdk');
const gcpSecretsClient = new SecretManagerServiceClient();
const ssmClient = new aws.SSM({
  region: process.env.AWS_REGION ?? '',
  ...(process.env.AWS_SSM_ENDPOINT_URL && {
    endpoint: process.env.AWS_SSM_ENDPOINT_URL,
  }),
  ...(process.env.AWS_SSM_ENDPOINT_TLS === '0' && {tls: false}),
});

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
const testGcpSecretName =
  process.env.TEST_SECRET_NAME ?? 'secretenv-test-param';
const testGcpSecretEnvVar = `gcp-secrets://projects/${process.env.GCP_PROJECT_ID}/secrets/${testGcpSecretName}/versions/latest`;
const testGcpSecretValue =
  process.env.TEST_SECRET_VALUE ?? 'mysecretgcpsecretvalue';

describe('ResolveEnv', () => {
  const oldEnv = process.env;

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
  });
});
