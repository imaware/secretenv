import {
  awsSsmPattern,
  gcpSecretsPattern,
  retrieveAwsSsmParameter,
} from '../secretenv/resolvers';

describe('AWS SSM', () => {
  it('should throw an error when the needed matches are not provided', async () => {
    const envVar =
      'gcp-secrets://projects/my-project/secrets/my-secret/versions/latest';
    const envVarMatch = envVar.match(gcpSecretsPattern);
    expect(envVarMatch).not.toBeNull();
    if (envVarMatch) {
      expect(retrieveAwsSsmParameter(envVarMatch)).rejects.toThrow(
        'aws ssm parameter missing required values: AWS region, AWS SSM parameter id',
      );
    }
  });

  it('should throw an error when the AWS region is not provided in the match group', async () => {
    const envVar =
      'aws-ssm://arn:aws:ssm:us-east-2:123456789:parameter/my/parameter:encrypted';
    const envVarMatch = envVar.match(awsSsmPattern);
    delete envVarMatch?.groups?.['region'];
    expect(envVarMatch).not.toBeNull();
    if (envVarMatch) {
      expect(retrieveAwsSsmParameter(envVarMatch)).rejects.toThrow(
        'aws ssm parameter missing required values: AWS region',
      );
    }
  });

  it('should resolve a AWS SSM parameter value', async () => {
    const envVar =
      'aws-ssm://arn:aws:ssm:us-east-2:12345678910:parameter/my/parameter:encrypted';
    const envVarMatch = envVar.match(awsSsmPattern);
    expect(envVarMatch).not.toBeNull();
    if (envVarMatch) {
      expect(retrieveAwsSsmParameter(envVarMatch)).resolves.toEqual('my-value');
    }
  });

  it('should resolve a AWS SSM parameter value (unencrypted)', async () => {
    const envVar =
      'aws-ssm://arn:aws:ssm:us-east-2:12345678910:parameter/my/parameter';
    const envVarMatch = envVar.match(awsSsmPattern);
    expect(envVarMatch).not.toBeNull();
    if (envVarMatch) {
      expect(retrieveAwsSsmParameter(envVarMatch)).resolves.toEqual('my-value');
    }
  });

  it('should resolve to undefined when no value', async () => {
    const envVar =
      'aws-ssm://arn:aws:ssm:us-east-2:12345678910:parameter/my/undefined/parameter:encrypted';
    const envVarMatch = envVar.match(awsSsmPattern);
    expect(envVarMatch).not.toBeNull();
    if (envVarMatch) {
      expect(retrieveAwsSsmParameter(envVarMatch)).resolves.toBeUndefined();
    }
  });
});
