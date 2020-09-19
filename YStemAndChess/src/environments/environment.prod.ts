// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

//Issue: need to convert 'http://52.249.251.163:8500' to https
export const environment = {
  production: false,
  agora: {
    appId: '6c368b93b82a4b3e9fb8e57da830f2a4',
  },
  urls: {
    middlewareURL: 'https://ystemandchess.com/middleware',
    //chessClientURL: 'http://52.249.251.163:8500',
    chessClientURL: 'https://ystemandchess.com/chessclient',
    stockFishURL : 'https://ystemandchess.com/stockfishserver'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
