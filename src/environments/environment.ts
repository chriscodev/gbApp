// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

/**
 * This file can be replaced during build by using the `fileReplacements` array.
 * `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
 * The list of file replacements can be found in `angular.json`.
 */

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname?.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

/**
 * starting set-up with default prefixes of local dev environment
 */
let objApi = {
    production: true,
    PARENT_URL: '/',
    LOGIN_URL: 'http://localhost:8080/gbApp/',
    GBWEBAPP_URL: 'http://localhost:8080/gbApp',
    STOMP_URL: 'http://localhost:8080/gbWebApp/stomp',
    DEVSERVERAPI_URL: 'http://localhost:8080/api/json/admin',
    DEVNETWORKURL: 'http://localhost:8080/api/json/',
    DEVKEYSTOREAPI_URL: 'http://localhost:8080/api/json/keyStore',
    LOG_URL: 'http://localhost:8080/',
    ZIP_EXPORT_URL: 'http://localhost:8080',
    SWAGGER_URL_DEVAPI:
        'https://virtserver.swaggerhub.com/Triveni-Digital/GB-DEV-API/1.0.0',
    SWAGGER_URL:
        'https://virtserver.swaggerhub.com/Triveni-Digital/GBWebApp/1.0.0',
    LOGOUT_REDIRECT_URL: '/gbApp/#/login',
};

if (!isLocalhost) {
    objApi = {
        production: true,
        PARENT_URL: '/',
        LOGIN_URL: '',
        GBWEBAPP_URL: '/gbApp',
        STOMP_URL: '/gbWebApp/stomp',
        DEVSERVERAPI_URL: '/api/json/admin',
        DEVNETWORKURL: '/api/json/',
        DEVKEYSTOREAPI_URL: '/api/json/keyStore',
        LOG_URL: '/',
        ZIP_EXPORT_URL: window.location.protocol + '//' + window.location.host,
        SWAGGER_URL:
            'https://virtserver.swaggerhub.com/Triveni-Digital/GBWebApp/1.0.0',
        SWAGGER_URL_DEVAPI:
            'https://virtserver.swaggerhub.com/Triveni-Digital/GB-DEV-API/1.0.0',
        LOGOUT_REDIRECT_URL: '/gbApp/#/login',
    };
}

export const environment = objApi;

// export const environment = {
//   production: false
// };

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
