const awsConfig = {
  Auth: {
    region: 'ap-northeast-1',
    userPoolId: 'ap-northeast-1_M8a6C9ANv',
    userPoolWebClientId: '1oma17ste1l8b82oav7ltoaqfh',
    oauth: {
      domain: 'ap-northeast-1m8a6c9anv.auth.ap-northeast-1.amazoncognito.com',
      scope: ['email', 'openid', 'phone'],
      redirectSignIn: 'http://localhost:5173/',
      redirectSignOut: 'http://localhost:5173/',
      responseType: 'code'
    }
  }
};

export default awsConfig; 