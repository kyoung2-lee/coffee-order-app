import { Amplify } from 'aws-amplify';

console.log('=== Amplify 設定 start ===');

// Amplify 設定
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-northeast-1_M8a6C9ANv',
      userPoolClientId: '1oma17ste1l8b82oav7ltoaqfh'
    }
  }
});

console.log('=== Amplify 設定 end ===');
console.log('設定 Auth:', Amplify.getConfig().Auth); 