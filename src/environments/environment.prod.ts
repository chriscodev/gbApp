// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

// export const environment = {
//   production: true
// };

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

let objApi = {
    // starting set-up with default prefixes of local dev environment
    production: true,
    PARENT_URL: '/',
    LOGIN_URL: '/gbApp/',
    GBWEBAPP_URL: '/gbApp',
    STOMP_URL: '/gbWebApp/stomp',
    DEVSERVERAPI_URL: '/api/json/admin',
    DEVNETWORKURL: '/api/json/',
    DEVKEYSTOREAPI_URL: '/api/json/keyStore',
    LOG_URL: '/',
    ZIP_EXPORT_URL: 'https://localhost',

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

// console.log('objApi 2:', objApi);

export const environment = objApi;
