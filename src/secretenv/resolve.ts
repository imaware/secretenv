import {SecretResolverFunc} from '../types';
import {
  awsSsmPattern,
  gcpSecretsPattern,
  retrieveAwsSsmParameter,
  retrieveGcpSecret,
} from './resolvers';

/**
 * Create a map of secret patterns -> resolver functions
 */
const secretResolverMap = new Map<RegExp, SecretResolverFunc>([
  [gcpSecretsPattern, retrieveGcpSecret],
  [awsSsmPattern, retrieveAwsSsmParameter],
]);

/**
 * Resolves any secret environment variables, and sets them in the environment.
 */
export const resolveEnv = async (): Promise<void> => {
  const resolvedEnvVars = await Promise.all(
    Object.keys(process.env).map(
      async (envVar: string): Promise<[string, string]> => {
        // Iterate over resolvers to check if the environment
        // variable value matches a supported secrets pattern
        for (const [pattern, resolverFunc] of Array.from(secretResolverMap)) {
          const match = process.env[envVar]?.match(pattern);
          // If a match is found, we will pass the match to the secret resolver function
          if (match) {
            const secretValue = await resolverFunc(match);
            return [envVar, secretValue ?? ''];
          }
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
