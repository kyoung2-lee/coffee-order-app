const awsConfig = {
  Auth: {
    region: 'ap-northeast-1',  
    userPoolId: 'ap-northeast-1_AbCdEfGhI',
    userPoolWebClientId: '1h2j3k4l5m6n7o8p9q0r',
    oauth: {
      domain: 'myapp-auth.ap-northeast-1.amazoncognito.com',
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:5173/',
      redirectSignOut: 'http://localhost:5173/',
      responseType: 'code'
    }
  }
};

export default awsConfig; 