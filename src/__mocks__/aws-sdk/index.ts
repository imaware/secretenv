'use strict';

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

aws.SSM = SSM;

module.exports = aws;
