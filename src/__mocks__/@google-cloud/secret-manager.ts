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
      case 'projects/projectfoo/secrets/secretbar/versions/latest':
        return [
          {
            name,
            payload: {
              data: 'somesecretvalue',
            },
          },
        ];
      case 'projects/my-project/secrets/my-secret/versions/latest':
        return [
          {
            name,
            payload: {
              data: 'my-value',
            },
          },
        ];
      case 'projects/my-project/secrets/my-undefined-secret/versions/latest':
        return [
          {
            name,
            payload: {},
          },
        ];
      default:
        throw new Error(`unimplemented test value ${name}`);
    }
  };
}

secretManager.SecretManagerServiceClient = SecretManagerServiceClient;

module.exports = secretManager;
