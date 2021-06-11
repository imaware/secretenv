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
 * @param {string} region - The AWS region where the parameter is stored.
 * @param {string} paramName - The name of the parameter
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
