# secretenv

NodeJS utility for automatically resolving environment variables to secret values.

## Docs

Automatically generated docs located in `./docs.md`.

## Supported Secret Providers

- [x] GCP Secrets
- [x] AWS SSM Parameter Store
- [ ] AWS Secrets Manager
- [ ] Vault
- [ ] Azure Key Vault

## Usage

In your code's initialization logic, simply call:

```javascript
await resolveEnv()
```

The function `resolveEnv` returns a Promise which resolves once all environment variables have been processed (and resolved if necessary).

Environment variables that should be resolved from remote secret storage sources follow a given pattern for each source type (see `src/secretenv/resolvers/<provider>.ts` for patterns). If any environment variables match these patterns, secretenv will attempt to resolve them from their respective providers, and replace them in the environment with their resolved values.

The `resolveEnv` function presumes that valid credentials for the target provider are available. If they are not, it will throw authentication errors.

secretenv will throw errors if:

- No authentication is present for a provider
- Credentials do not have permissions to access the secret resource from the provider
- The secret resource does not exist

secretenv will not throw errors if:

- The value of the resolved secret is `undefined` or an empty string

### GCP Secrets

GCP secrets should be referenced by this pattern:

```javascript
/^gcp-secrets:\/\/projects\/(?<gcp_project>[^/]+)\/secrets\/(?<secret_name>[^/]+)\/versions\/(?<version>[^/]+)$/
```

### AWS SSM Parameter Store

AWS SSM Parameters should be referenced by this pattern:

```javascript
/^aws-ssm:\/\/arn:aws:ssm:(?<region>[^/]+):(?<account_id>[^/]+):parameter\/(?<parameter_id>[^:]+)(?<encrypted>:encrypted)?$/
```

The `:encrypted` suffix specifies whether the SSM Parameter is KMS encrypted or not.
