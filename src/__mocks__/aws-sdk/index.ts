'use strict';
/* eslint-disable @typescript-eslint/no-explicit-any */

import awsDefault from 'aws-sdk';

const aws = jest.createMockFromModule('aws-sdk') as any;

class SSM {
  constructor() {
    return;
  }

  getParameter = (params: awsDefault.SSM.GetParameterRequest): any => {
    return {
      promise: async () => {
        switch (params.Name) {
          case 'my/parameter':
            return {
              Parameter: {
                Name: params.Name,
                Value: 'my-value',
              },
            } as awsDefault.SSM.GetParameterResult;
          case 'my/undefined/parameter':
            return {
              Parameter: {
                Name: params.Name,
              },
            } as awsDefault.SSM.GetParameterResult;
          default:
            throw new Error(`unimplemented test value ${params.Name}`);
        }
      },
    };
  };
}

class SecretsManager {
  constructor() {
    return;
  }

  getSecretValue = (
    params: awsDefault.SecretsManager.GetSecretValueRequest,
  ): any => {
    return {
      promise: async () => {
        if (
          params.VersionId === '3bb6519e-bd6e-4db6-a52e-3671015e2cda' &&
          params.VersionStage === 'DEV'
        ) {
          return {
            SecretString: 'my-complex-secret-value-both',
          } as awsDefault.SecretsManager.GetSecretValueResponse;
        }
        switch (params.SecretId) {
          case 'my-simple-secret':
            return {
              SecretString: 'my-simple-secret-value',
            } as awsDefault.SecretsManager.GetSecretValueResponse;
          case 'my/Complex/Secret@':
            switch (params.VersionStage) {
              case 'AWSCURRENT':
                return {
                  SecretString: 'my-complex-secret-value',
                } as awsDefault.SecretsManager.GetSecretValueResponse;
              case 'STAGING':
                return {
                  SecretString: 'my-complex-secret-value-staging',
                } as awsDefault.SecretsManager.GetSecretValueResponse;
              default:
                break;
            }
            switch (params.VersionId) {
              case 'f5529425-1aa3-4f8b-85c6-7e94e559bd0d':
                return {
                  SecretString: 'my-complex-secret-value-specificid',
                } as awsDefault.SecretsManager.GetSecretValueResponse;
              default:
                break;
            }
            return {
              SecretString: 'my-complex-secret-value',
            } as awsDefault.SecretsManager.GetSecretValueResponse;
          default:
            throw new Error(`unimplemented test value ${params.SecretId}`);
        }
      },
    };
  };
}

aws.SecretsManager = SecretsManager;
aws.SSM = SSM;

module.exports = aws;
