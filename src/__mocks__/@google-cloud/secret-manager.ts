'use strict';

const secretManager = jest.createMockFromModule(
  '@google-cloud/secret-manager',
) as any;

class SecretManagerServiceClient {
  constructor() {
    return;
  }

  accessSecretVersion = async ({
    name,
  }: {
    name: string | null;
  }): Promise<
    [
      {
        name: string | null;
        payload: {data?: Uint8Array | string | null};
      },
    ]
  > => {
    switch (name) {
      // gcp-secrets://projects/projectfoo/secrets/secretbar/versions/latest
      case 'projects/projectfoo/secrets/secretbar/versions/latest':
        return [
          {
            name,
            payload: {
              data: 'somesecretvalue',
            },
          },
        ];
      default:
        throw new Error(`unimplemented test value ${name}`);
    }
  };
}

secretManager.SecretManagerServiceClient = SecretManagerServiceClient;

module.exports = secretManager;
