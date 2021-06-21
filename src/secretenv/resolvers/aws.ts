import aws from 'aws-sdk';

/** AWS SSM arn format
 *
 * E.g. aws-ssm://arn:aws:ssm:us-east-2:123456789:parameter/my/parameter:encrypted
 */
export const awsSsmPattern = new RegExp(
  /^aws-ssm:\/\/arn:aws:ssm:(?<region>[^/]+):(?<account_id>[^/]+):parameter\/(?<parameter_id>[^:]+)(?<encrypted>:encrypted)?$/,
);

/**
 * Function to retrieve the AWS SSM Parameter value.
 *
 * @param {RegExpMatchArray} match - The RegEx match object.
 * @returns {string | undefined} - Returns the value of the secret, or undefined.
 */
export const retrieveAwsSsmParameter = async (
  match: RegExpMatchArray,
): Promise<string | undefined> => {
  // Get required parameters from match
  const region = match.groups?.['region'];
  const paramId = match.groups?.['parameter_id'];
  const encrypted = !!match.groups?.['encrypted'];
  if (!region || !paramId) {
    throw new Error(
      `aws ssm parameter missing required values: ${[
        ...(!region ? ['AWS region'] : []),
        ...(!paramId ? ['AWS SSM parameter id'] : []),
      ].join(', ')}`,
    );
  }
  // Create region-specific client
  const ssmClient = new aws.SSM({
    region,
    ...(process.env.AWS_SSM_ENDPOINT_URL && {
      endpoint: process.env.AWS_SSM_ENDPOINT_URL,
    }),
    ...(process.env.AWS_SSM_ENDPOINT_TLS === '0' && {tls: false}),
  });
  const res = await ssmClient
    .getParameter({
      Name: paramId,
      WithDecryption: encrypted,
    } as aws.SSM.GetParameterRequest)
    .promise();
  return res.Parameter?.Value;
};

/** AWS Secrets Manager arn format
 *
 * E.g. arn:aws:secretsmanager:us-east-1:123456789012:secret:tutorials/MyFirstSecret-jiObOV
 */
export const awsSecretsManagerPattern = new RegExp(
  /^aws-secrets:\/\/arn:aws:secretsmanager:(?<region>[^/]+):(?<account_id>[^/]+):secret:(?<secret_id>[a-zA-Z0-9/_+=.@-]+)(?<stage>:stage:(?<version_stage>[a-zA-Z0-9]+))?(?<version>:version:(?<version_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}))?$/,
);

/**
 * Function to retrieve the AWS Secrets Manager SecretString value.
 *
 * @param {RegExpMatchArray} match - The RegEx match object.
 * @returns {string | undefined} - Returns the value of the secret, or undefined.
 */
export const retrieveAwsSecret = async (
  match: RegExpMatchArray,
): Promise<string | undefined> => {
  // Get required parameters from match
  const region = match.groups?.['region'];
  const secretId = match.groups?.['secret_id'];
  // Optional: version stage and/or version id
  const versionStage = match.groups?.['version_stage'];
  const versionId = match.groups?.['version_id'];
  if (!region || !secretId) {
    throw new Error(
      `aws secrets manager missing required values: ${[
        ...(!region ? ['AWS region'] : []),
        ...(!secretId ? ['AWS Secrets Manager secret name'] : []),
      ].join(', ')}`,
    );
  }
  // Create region-specific client
  const secretsClient = new aws.SecretsManager({
    region,
    ...(process.env.AWS_SECRETS_MANAGER_ENDPOINT_URL && {
      endpoint: process.env.AWS_SECRETS_MANAGER_ENDPOINT_URL,
    }),
    ...(process.env.AWS_SECRETS_MANAGER_ENDPOINT_TLS === '0' && {tls: false}),
  });
  const res = await secretsClient
    .getSecretValue({
      SecretId: secretId,
      ...(versionId && {VersionId: versionId}),
      ...(versionStage && {VersionStage: versionStage}),
    } as aws.SecretsManager.GetSecretValueRequest)
    .promise();
  return res.SecretString;
};
