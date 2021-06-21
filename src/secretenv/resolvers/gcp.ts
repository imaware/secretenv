import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

// GCP Secrets Manager
const gcpSecretsClient = new SecretManagerServiceClient();

/** GCP Secrets format
 *
 * E.g. gcp-secrets://projects/my-project-id/secrets/my-secret/versions/latest
 */
export const gcpSecretsPattern = new RegExp(
  /^gcp-secrets:\/\/projects\/(?<gcp_project>[^/]+)\/secrets\/(?<secret_name>[^/]+)\/versions\/(?<version>[^/]+)$/,
);

/**
 * Function to retrieve the GCP Secrets Manager version specified by project ID, name, and version.
 *
 * @param {RegExpMatchArray} match - The RegEx match object.
 * @returns {string | undefined} - Returns the value of the secret, or undefined.
 */
export const retrieveGcpSecret = async (
  match: RegExpMatchArray,
): Promise<string | undefined> => {
  // Get required parameters from match
  const projectId = match.groups?.['gcp_project'];
  const secretName = match.groups?.['secret_name'];
  const secretVersion = match.groups?.['version'];
  if (!projectId || !secretName || !secretVersion) {
    throw new Error(
      `gcp secret missing required values: ${[
        ...(!projectId ? ['GCP project id'] : []),
        ...(!secretName ? ['GCP secret name'] : []),
        ...(!secretVersion ? ['GCP secret version'] : []),
      ].join(', ')}`,
    );
  }

  // Retrieve the secret version
  const [version] = await gcpSecretsClient.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/${secretVersion}`,
  });

  // Convert payload of secret version to string
  return version.payload?.data?.toString();
};
