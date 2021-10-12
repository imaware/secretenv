import {
  awsSecretsManagerPattern,
  gcpSecretsPattern,
  retrieveAwsSecret,
} from '../secretenv/resolvers';
import each from 'jest-each';

describe('AWS Secrets Manager', () => {
  each([
    [
      'should throw an error when the needed matches are not provided',
      {
        matchObj:
          'gcp-secrets://projects/my-project/secrets/my-secret/versions/latest'.match(
            gcpSecretsPattern,
          ),
        errString:
          'aws secrets manager missing required values: AWS region, AWS Secrets Manager secret name',
      },
    ],
    [
      'should throw an error when the AWS region is not provided in the match group',
      {
        matchObj: (() => {
          const match =
            'aws-secrets://arn:aws:secretsmanager:us-east-1:123456789012:secret:tutorials/MyFirstSecret-jiObOV'.match(
              awsSecretsManagerPattern,
            );
          delete match?.groups?.['region'];
          return match;
        })(),
        errString: 'aws secrets manager missing required values: AWS region',
      },
    ],
    [
      'should resolve a AWS Secrets Manager SecretString value',
      {
        matchObj:
          'aws-secrets://arn:aws:secretsmanager:us-east-2:123456789012:secret:my-simple-secret'.match(
            awsSecretsManagerPattern,
          ),
        errString: undefined,
        value: 'my-simple-secret-value',
      },
    ],
    [
      'should resolve a AWS Secrets Manager SecretString complex value',
      {
        matchObj:
          'aws-secrets://arn:aws:secretsmanager:us-east-2:123456789012:secret:my/Complex/Secret@'.match(
            awsSecretsManagerPattern,
          ),
        errString: undefined,
        value: 'my-complex-secret-value',
      },
    ],
    [
      'should resolve a AWS Secrets Manager SecretString complex value by version stage AWSCURRENT',
      {
        matchObj:
          'aws-secrets://arn:aws:secretsmanager:us-east-2:123456789012:secret:my/Complex/Secret@:stage:AWSCURRENT'.match(
            awsSecretsManagerPattern,
          ),
        errString: undefined,
        value: 'my-complex-secret-value',
      },
    ],
    [
      'should resolve a AWS Secrets Manager SecretString complex value by version stage STAGING',
      {
        matchObj:
          'aws-secrets://arn:aws:secretsmanager:us-east-2:123456789012:secret:my/Complex/Secret@:stage:STAGING'.match(
            awsSecretsManagerPattern,
          ),
        errString: undefined,
        value: 'my-complex-secret-value-staging',
      },
    ],
    [
      'should resolve a AWS Secrets Manager SecretString complex value by version id',
      {
        matchObj:
          'aws-secrets://arn:aws:secretsmanager:us-east-2:123456789012:secret:my/Complex/Secret@:version:f5529425-1aa3-4f8b-85c6-7e94e559bd0d'.match(
            awsSecretsManagerPattern,
          ),
        errString: undefined,
        value: 'my-complex-secret-value-specificid',
      },
    ],
    [
      'should resolve a AWS Secrets Manager SecretString complex value by version stage and id',
      {
        matchObj:
          'aws-secrets://arn:aws:secretsmanager:us-east-2:123456789012:secret:my/Complex/Secret@:stage:DEV:version:3bb6519e-bd6e-4db6-a52e-3671015e2cda'.match(
            awsSecretsManagerPattern,
          ),
        errString: undefined,
        value: 'my-complex-secret-value-both',
      },
    ],
  ] as [
    string,
    {
      matchObj: RegExpMatchArray;
      errString?: string;
      value?: string;
    },
  ][]).test('%s', async (_, {matchObj, errString, value}) => {
    expect(matchObj).not.toBeNull();
    if (errString) {
      return expect(retrieveAwsSecret(matchObj)).rejects.toThrow(errString);
    } else {
      return expect(retrieveAwsSecret(matchObj))
        .resolves.toEqual(value)
        .catch(e => {
          console.error(e);
          throw e;
        });
    }
  });
});
