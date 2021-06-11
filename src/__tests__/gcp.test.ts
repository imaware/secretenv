import {
  awsSsmPattern,
  gcpSecretsPattern,
  retrieveGcpSecret,
} from '../secretenv/resolvers';

describe('GCP Secrets', () => {
  it('should throw an error when the needed matches are not provided', async () => {
    const envVar =
      'aws-ssm://arn:aws:ssm:us-east-2:123456789:parameter/my/parameter';
    const envVarMatch = envVar.match(awsSsmPattern);
    if (envVarMatch) {
      expect(retrieveGcpSecret(envVarMatch)).rejects.toThrow(
        'gcp secret missing required values: GCP project id, GCP secret name, GCP secret version',
      );
    }
  });

  it('should throw an error when the GCP secret name is not provided in the match group', async () => {
    const envVar =
      'gcp-secrets://projects/my-project/secrets/my-secret/versions/latest';
    const envVarMatch = envVar.match(gcpSecretsPattern);
    delete envVarMatch?.groups?.['secret_name'];
    expect(envVarMatch).not.toBeNull();
    if (envVarMatch) {
      expect(retrieveGcpSecret(envVarMatch)).rejects.toThrow(
        'gcp secret missing required values: GCP secret name',
      );
    }
  });

  it('should resolve a GCP secret value', async () => {
    const envVar =
      'gcp-secrets://projects/my-project/secrets/my-secret/versions/latest';
    const envVarMatch = envVar.match(gcpSecretsPattern);
    expect(envVarMatch).not.toBeNull();
    if (envVarMatch) {
      expect(retrieveGcpSecret(envVarMatch)).resolves.toEqual('my-value');
    }
  });

  it('should resolve to undefined when no value', async () => {
    const envVar =
      'gcp-secrets://projects/my-project/secrets/my-undefined-secret/versions/latest';
    const envVarMatch = envVar.match(gcpSecretsPattern);
    expect(envVarMatch).not.toBeNull();
    if (envVarMatch) {
      expect(retrieveGcpSecret(envVarMatch)).resolves.toBeUndefined();
    }
  });
});
