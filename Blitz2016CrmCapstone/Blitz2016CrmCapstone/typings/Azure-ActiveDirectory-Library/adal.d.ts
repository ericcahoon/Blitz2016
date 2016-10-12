// Type definitions for ADAL.JS 1.0.8
// Project: https://github.com/AzureAD/azure-activedirectory-library-for-js
// Definitions by: mmaitre314 <https://github.com/mmaitre314>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare var AuthenticationContext: adal.AuthenticationContextStatic;
declare var Logging: adal.Logging;

declare module "adal" {
    export = { AuthenticationContext, Logging };
}

declare namespace adal {

    export interface IException {
        Id: number,
        Message: string;
    }

    interface Config {
        tenant?: string;
        clientId: string;
        redirectUri?: string;
        cacheLocation?: string;
        displayCall?: (urlNavigate: string) => any;
        correlationId?: string;
        loginResource?: string;
        resource?: string;
        instance?: string,
        endpoints?: any; // If you need to send CORS api requests.
        extraQueryParameter?: string;
        postLogoutRedirectUri?: string; // redirect url after succesful logout operation
        authType?: AuthType;
        state?: string;
    }

    interface User {
        userName: string;
        profile: any;
    }

    interface RequestInfo {
        valid: boolean;
        parameters: any;
        stateMatch: boolean;
        stateResponse: string;
        requestType: string;
    }

    interface Logging {
        log: (message: string) => void;
        level: LoggingLevel;
    }

    export enum LoggingLevel {
        ERROR = 0,
        WARNING = 1,
        INFO = 2,
        VERBOSE = 3
    }

    export enum AuthType {
        OnPrem = 0,
        Office365 = 1
    }

    interface AuthenticationContextStatic {
        new (config: Config): AuthenticationContext;
    }

    interface AuthenticationContext {

        CONSTANTS: {
            ACCESS_TOKEN: "access_token",
            EXPIRES_IN: "expires_in",
            ID_TOKEN: "id_token",
            ERROR_DESCRIPTION: "error_description",
            SESSION_STATE: "session_state",
            STORAGE: {
                TOKEN_KEYS: "adal.token.keys",
                ACCESS_TOKEN_KEY: "adal.access.token.key",
                EXPIRATION_KEY: "adal.expiration.key",
                START_PAGE: "adal.start.page",
                FAILED_RENEW: "adal.failed.renew",
                STATE_LOGIN: "adal.state.login",
                STATE_RENEW: "adal.state.renew",
                STATE_RENEW_RESOURCE: "adal.state.renew.resource",
                STATE_IDTOKEN: "adal.state.idtoken",
                NONCE_IDTOKEN: "adal.nonce.idtoken",
                SESSION_STATE: "adal.session.state",
                USERNAME: "adal.username",
                IDTOKEN: "adal.idtoken",
                ERROR: "adal.error",
                ERROR_DESCRIPTION: "adal.error.description",
                LOGIN_REQUEST: "adal.login.request",
                LOGIN_ERROR: "adal.login.error",
            },
            RESOURCE_DELIMETER: "|",
            ERR_MESSAGES: {
                NO_TOKEN: "User is not authorized",
            },
            ERRS: {
                NO_TOKEN: {
                    Id: number,
                    Message: string,
                },
                REQUIRES_LOGIN: {
                    Id: number,
                    Message: string,
                }
            },
            LOGGING_LEVEL: LoggingLevel,
            LEVEL_STRING_MAP: {
                0: "ERROR:",
                1: "WARNING:",
                2: "INFO:",
                3: "VERBOSE:",
            },
            AUTH_TYPE: AuthType,
        };

        instance: string;
        config: Config;

        /**
         * Gets initial Idtoken for the app backend
         * Saves the resulting Idtoken in localStorage.
         */
        login(): void;

        /**
         * Indicates whether login is in progress now or not.
         */
        loginInProgress(): boolean;

        /**
         * Gets token for the specified resource from local storage cache
         * @param {string}   resource A URI that identifies the resource for which the token is valid.
         * @returns {string} token if exists and not expired or null
         */
        getCachedToken(resource: string): string;

        /**
         * Retrieves and parse idToken from localstorage
         * @returns {User} user object
         */
        getCachedUser(): User;

        registerCallback(expectedState: string, resource: string, callback: (error: IException, token?: string) => any):
            void;

        /**
         * Acquire token from cache if not expired and available. Acquires token from iframe if expired.
         * @param {string}   resource  ResourceUri identifying the target resource
         * @param {requestCallback} callback
         */
        acquireToken(resource: string, callback: (error: IException, token?: string) => any): void;

        /**
         * Redirect the Browser to Azure AD Authorization endpoint
         * @param {string}   urlNavigate The authorization request url
         */
        promptUser(urlNavigate: string): void;

        /**
         * Clear cache items.
         */
        clearCache(): void;

        /**
         * Clear cache items for a resource.
         */
        clearCacheForResource(resource: string): void;

        /**
         * Logout user will redirect page to logout endpoint.
         * After logout, it will redirect to post_logout page if provided.
         */
        logOut(): void;

        /**
         * Gets a user profile
         * @param {requestCallback} callback - The callback that handles the response.
         */
        getUser(callback: (error: IException, user?: User) => any): void;

        /**
         * Checks if hash contains access token or id token or error_description
         * @param {string} hash  -  Hash passed from redirect page
         * @returns {Boolean}
         */
        isCallback(hash: string): boolean;

        /**
         * Gets login error
         * @returns {string} error message related to login
         */
        getLoginError(): string;

        /**
         * Gets requestInfo from given hash.
         * @returns {RequestInfo} for appropriate hash.
         */
        getRequestInfo(hash: string): RequestInfo;

        /**
         * Saves token from hash that is received from redirect.
         */
        saveTokenFromHash(requestInfo: RequestInfo): void;

        /**
         * Gets resource for given endpoint if mapping is provided with config.
         * @param {string} endpoint  -  API endpoint
         * @returns {string} resource for this API endpoint
         */
        getResourceForEndpoint(endpoint: string): string;

        /**
         * Handles redirection after login operation. 
         * Gets access token from url and saves token to the (local/session) storage
         * or saves error in case unsuccessful login.
         */
        handleWindowCallback(hash?: string): void;

        log(level: number, message: string, error: any): void;
        error(message: string, error: any): void;
        warn(message: string): void;
        info(message: string): void;
        verbose(message: string): void;

        /**
         * Attempts to retrieve a value from the cache
         * @param key = Name assigned to the cahced item to try retrieving
         * @returns {} 
         */
        _getItem(key: string): Object;

        /**
         * Saves and item to the cache
         * @param key = Name of key to save item to
         * @param obj = The item to save to the cache
         */
        _saveItem(key: string, obj: any): void;

        _createUser(idToken: Object): void;


        _user: User;
    }

}