import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

// GCP Secrets Manager
const gcpSecretsClient = new SecretManagerServiceClient();

/** GCP Secrets Manager format
 *
 * E.g. gcp-secrets://projects/my-project-id/secrets/my-secret/versions/latest
 */
const gcpSecretsPattern = new RegExp(
  /^gcp-secrets:\/\/projects\/(?<gcp_project>[^/]+)\/secrets\/(?<secret_name>[^/]+)\/versions\/(?<version>[^/]+)$/,
);

/**
 * Function to retrieve the GCP Secrets Manager version specified by project ID, name, and version.
 *
 * @param {string} projectId - The GCP project id.
 * @param {string} secretName - The name of the secret.
 * @param {string} secretVersion - The version of the secret
 * @returns {string | undefined} - Returns the value of the secret, or undefined.
 */
const retrieveGcpSecret = async (
  projectId: string,
  secretName: string,
  secretVersion: string,
): Promise<string | undefined> => {
  // Retrieve the secret version
  const [version] = await gcpSecretsClient.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/${secretVersion}`,
  });

  // Convert payload of secret version to string
  return version.payload?.data?.toString();
};

/**
 * Resolves any secret environment variables, and sets them in the environment.
 */
export const resolveEnv = async (): Promise<void> => {
  const resolvedEnvVars = await Promise.all(
    Object.keys(process.env).map(
      async (envVar: string): Promise<[string, string]> => {
        // Test the env var value against the GCP Secrets Manager pattern
        const match = process.env[envVar]?.match(gcpSecretsPattern);
        if (
          !!match &&
          match.groups &&
          match.groups['gcp_project'] &&
          match.groups['secret_name'] &&
          match.groups['version']
        ) {
          const projectId = match.groups['gcp_project'];
          const secretName = match.groups['secret_name'];
          const secretVersion = match.groups['version'];
          const secretValue = await retrieveGcpSecret(
            projectId,
            secretName,
            secretVersion,
          );
          return [envVar, secretValue ?? ''];
        }
        // Default, just return the existing env var value
        return [envVar, process.env[envVar] ?? ''];
      },
    ),
  );
  // Set the environment variables to the resolved values
  resolvedEnvVars.forEach((val: [string, string]) => {
    process.env[val[0]] = val[1];
  });
};
