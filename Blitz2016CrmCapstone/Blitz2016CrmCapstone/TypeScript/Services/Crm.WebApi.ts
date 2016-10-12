/// <reference path="../../typings/azure-activedirectory-library/adal.d.ts" />
import { Inject, Injectable } from "@angular/core";
import { CRM_CONFIG } from "../Models/CrmConfig";
import { CrmConfig } from "../Models/CrmConfig";
import { Exception } from "../Models/Exception";

export module Crm {
    @Injectable()
    export class WebApi {
        constructor (@Inject(CRM_CONFIG) public Config: CrmConfig) {

            //if (!Config) this.AuthType = adal.AuthType.OnPrem;
            this._adalConfig.authType = this.Config.AuthType;

            this._authContext = new AuthenticationContext(this._adalConfig);
        }


        private _constants = {
            WebApiEndPoint: "/api/data/v8.1/"
        };

        private _user: adal.User;

        private _authContext: adal.AuthenticationContext;

        private _adalConfig: adal.Config = {
            tenant: this.Config.Tenant,
            clientId: this.Config.ClientId,
            postLogoutRedirectUri: this.Config.AdfsRedirectUri,
            redirectUri: this.Config.AdfsRedirectUri,
            endpoints: {
                orgUri: this.Config.OrganizationUri
            },
            cacheLocation: "localStorage",
            instance: this.Config.AdfsLoginUri,
            authType: this.Config.AuthType
        };


        private _getParameterByName = (name: string, url?: string): any => {
            /// <summary>Attempts to extract a value from the query string parameters</summary>
            /// <param name="name">The query string parameter to extract</param>
            /// <param name="url">The URL to attempt extracting the query string parameter from</param>
            if (!name) {
                return null;
            }

            if (!url) {
                url = window.location.href;
            }

            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
                results = regex.exec(url);
            if (!results) {
                return null;
            }
            if (!results[2]) {
                return "";
            }
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        };

        private convertCodeToToken (code: string): Promise<{}> {
            /// <summary>Converts an ADFS 3.0 auth code request into a JWT</summary>
                        /// <param name="code" type="string">The ADFS 3.0 auth code request token that needs to be converted into a JWT</param>
            return new Promise((resolve, reject) => {
                if (this.Config.AuthType !== 0) {
                    reject("No need to convert the token into a JWT if not using on prem ADFS.");
                }

                var req = new XMLHttpRequest;
                const params = {
                    adfsUri: this.Config.AdfsLoginUri,
                    grantType: "authorization_code",
                    code: code,
                    clientId: this._adalConfig.clientId,
                    redirectUri: this._adalConfig.redirectUri
                };

                req.open("POST", this.Config.AdfsCodeTokenToJwtServiceUri, true);
                req.setRequestHeader("Content-Type", "application/json");

                req.onreadystatechange = () => {
                    if (req.readyState === 4) {
                        if (req.status === 200) {
                            resolve(req);
                        }

                        if (req.status === 500) {
                            reject(req.responseText);
                        }
                    }
                };


                req.send(JSON.stringify(params));
            });
        }

        private handleAuthenticationError (exception: Exception): void {
            /// <summary>Generic handler for authentication errors</summary>
            /// <param name="errorMsg" type="string"></param>
            if (exception.Id === this._authContext.CONSTANTS.ERRS.REQUIRES_LOGIN.Id) {
                this.login();
                return;
            };

            if (exception) {
                alert(exception.Message);
            }

            //Clear the user and ID token from the auth context
            this._authContext._user = null;
            this._authContext._saveItem(this._authContext.CONSTANTS.STORAGE.IDTOKEN, null);

            this.authenticate();
        }


        private executeRequest (request: (token: string) => any): void {
            /// <summary>Retrieves an authentication token and then invokes the request</summary>
            this.login()
                .then(() => {
                    this._authContext.acquireToken(this._adalConfig.clientId,
                    (error, token) => {
                        if (error) {
                            this.handleAuthenticationError(error);
                            return;
                        }

                        request(token);

                    });
                })
                .catch(e => console.log(`reject:  ${e}`));


        }


        private authenticate (): void {
            /// <summary>Attempts to authenticate the user and retrieve the JWT token needed to consume the CRM webAPI</summary>
            const isCallback = this._authContext.isCallback(window.location.hash);
            const code = this._getParameterByName("code");
            const error = this._getParameterByName("error");

            if (error) {
                const errorDescription = this._getParameterByName("error_description");
                alert(`An error occurred while trying to authenticate to CRM.\r\nError:  ${error}\r\nMessage:  ${
                    errorDescription}`);
                return;
            }

            //ADFS's oauth 2.0 implementation only supports the code flow, so
            //check if authenticating against ADSF and if so convert code response
            //to token
            if (code && this._adalConfig.authType === 0) {
                this.convertCodeToToken(code);
                //return;
            }
            else if (isCallback) {
                this._authContext.handleWindowCallback();
            }

            const loginError = this._authContext.getLoginError();

            if (isCallback && !loginError) {
                window.location = (this._authContext
                    ._getItem(this._authContext.CONSTANTS.STORAGE.LOGIN_REQUEST) as Location);
            }

            this._user = this._authContext.getCachedUser();
            if (!this._user) {
                this.login();
                return;
            }

            this._authContext.acquireToken(this._adalConfig.clientId,
            (exception: Exception) => {

                if (exception) {
                    this.handleAuthenticationError(exception);
                    return;
                }
            });
        }


        private login (): Promise<{}> {
            /// <summary>Opens a login dialog so a user can login into ADFS</summary>
            const dummyAuthPage = ""; // "getAuthToken.htm";
            const authContext = this._authContext;
            const self = this;

            return new Promise((resolve, reject) => {
                // If the user is cached, resolve the promise immediately.
                const user = authContext.getCachedUser();
                if (user) {
                    resolve(user);
                    return;
                }

                // The user was not cached. Open a popup window which
                // performs the OAuth login process, then signals
                // the result.
                authContext.config.displayCall = url => {
                    authContext.config.displayCall = null;
                    var popup = window.open(url, "auth-popup", "width=800,height=500");
                    var intervalId = window.setInterval(() => {
                            try {
                                if (popup.location.pathname.indexOf(`/${dummyAuthPage}`) >= 0) {
                                    window.clearInterval(intervalId);


                                    if (popup.location.hash.indexOf("#id_token") > -1) {

                                        authContext.handleWindowCallback(popup.location.hash);
                                        popup.close();
                                        const user = authContext.getCachedUser();

                                        if (user) {
                                            resolve(user);
                                        }
                                        else {
                                            reject(authContext.getLoginError());
                                        }
                                        return;                                        
                                    }


                                    const code = self._getParameterByName("code", popup.location.href);

                                    //ADFS's oauth 2.0 implementation only supports the code flow, so
                                    //check if authenticating against ADSF and if so convert code response
                                    //to token
                                    if (!code) {
                                        reject("Failed to login into ADFS and retrieve a code token");
                                    }

                                    //Convert the code token to a JWT
                                    self.convertCodeToToken(code)
                                        // ReSharper disable InconsistentNaming
                                        .then((req: { responseText: string; access_token: string }) => {
                                            // ReSharper restore InconsistentNaming


                                            const response = JSON.parse(req.responseText);

                                            //oauth id_token requests return there response in the URL
                                            //thus we need to format the code request to look like
                                            //a id_token request
                                            popup.location.hash = req.responseText
                                                .replace(/,/g, "&")
                                                .replace(/\:/g, "=")
                                                .replace(/{/, "")
                                                .replace(/}/, "")
                                                .replace(/"/g, "") +
                                                "&id_token=" +
                                                response.access_token +
                                                "&state=" +
                                                self._authContext
                                                ._getItem(self._authContext.CONSTANTS.STORAGE.STATE_LOGIN);


                                            authContext.handleWindowCallback(popup.location.hash);
                                            popup.close();
                                            const user = authContext.getCachedUser();

                                            if (user) {
                                                resolve(user);
                                            }
                                            else {
                                                reject(authContext.getLoginError());
                                            }
                                            return;
                                        })
                                        .catch(e => console.log(`reject:  ${e}`));


                                }
                            }
                            catch (ex) {
                                if (popup.closed) {
                                    reject(ex);
                                }
                            }
                        },
                        100);
                };

                authContext.config.redirectUri = window.location.href.replace("index.html", "") + dummyAuthPage;
                authContext.login();
            });
        }


        private addHeadersToRequest(req: XMLHttpRequest, token: string, headers?: { Key: string, Value: any }[]): void {
            /// <summary>Adds headers to HTTP requests</summary>
            /// <param name="req" type="XMLHttpRequest">The HTTP request to add the headers to</param>
            /// <param name="token" type="string">The auth token need to authenticate with the CRM Web API</param>
            /// <param name="headers?" type="{ Key: string, Value: string }[]">Collection of the headers to add to the requets</param>
            
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader("Authorization", `Bearer ${token}`);
            req.setRequestHeader("Access-Control-Allow-Origin", "localhost");

            headers = headers || [];
            for (let header of headers) {
                req.setRequestHeader(header.Key, header.Value);
            }
        }


        Create (setName: string, toCreate: {}): Promise<string> {
            /// <summary>Creates a record using the CRM API</summary>
            /// <param name="setName" type="string">The entity set to create the record in</param>
            /// <param name="toCreate" type="{}">The record to create</param>
            const headers = [
                { Key: "Accept", Value: "application/json" },
                { Key: "Content-Type", Value: "application/json; charset=utf-8" }
            ];

            const regex = new RegExp("\\((\\w{8}\\-\\w{4}\\-\\w{4}\\-\\w{4}\\-\\w{12})\\)$");

            return new Promise((resolve, reject) => {
                this.executeRequest((token) => {
                    var req = new XMLHttpRequest;
                    req.open("POST",
                        encodeURI(this.Config.OrganizationUri + this._constants.WebApiEndPoint + setName),
                        true);
                    this.addHeadersToRequest(req, token, headers);

                    req.onreadystatechange = () => {
                        if (req.readyState === 4 && req.status === 204) {
                            const entityId = req.getResponseHeader("OData-EntityId"),
                                matches = regex.exec(entityId);

                            if (!matches || !matches[1]) {
                                reject("Failed to create the contact");
                                return;
                            }

                            resolve(matches[1].replace("(", "").replace(")", ""));
                        }

                    };

                    req.send(JSON.stringify(toCreate));
                });
            });

        }

        InvokeAction (actionName: string, parameters: {}): Promise<{}> {
            /// <summary>Invokes a custom action in the CRM API</summary>
            /// <param name="actionName" type="string">The name of the action to invoke</param>
            /// <param name="parameters" type="{}">The parameters to send to the action</param>
            const headers = [
                { Key: "Accept", Value: "application/json" },
                { Key: "Content-Type", Value: "application/json; charset=utf-8" }
            ];

            return new Promise((resolve) => {
                this.executeRequest((token) => {
                    var req = new XMLHttpRequest;
                    req.open("POST",
                        encodeURI(this.Config.OrganizationUri + this._constants.WebApiEndPoint + actionName),
                        true);
                    this.addHeadersToRequest(req, token, headers);

                    req.onreadystatechange = () => {
                        if (req.readyState === 4 && req.status === 200) {
                            const response = JSON.parse(req.responseText || null);
                            resolve(response);
                        }

                        //TODO add reject for failed requests
                    };

                    req.send(JSON.stringify(parameters));
                });
            });
        }

        Retrieve (setName: string, recordId: string, columns?: string[]): Promise<{}> {
            /// <summary>Retrieves a record from the CRM API</summary>
            /// <param name="setName" type="string">The entity set name to return the record from</param>
            /// <param name="recordId" type="string">The ID of the record to retrieve</param>
            /// <param name="columns?" type="string[]">The columns to return.  If null, all columns will be returned</param>
            return new Promise((resolve, reject) => {
                if (!setName) {
                    reject("The provided set name is null or whitespace.");
                    return;
                }
                if (!recordId) {
                    reject("The provided record ID is null or whitespace.");
                    return;
                }

                this.executeRequest((token) => {
                    var req = new XMLHttpRequest;
                    req.open("GET",
                        encodeURI(this.Config.OrganizationUri +
                            this._constants.WebApiEndPoint +
                            setName +
                            `(${recordId})` +
                            (!columns ? "" : + `?$select=${columns.join(",")})`)));
                    this.addHeadersToRequest(req, token);

                    req.onreadystatechange = () => {
                        if (req.readyState === 4 && req.status === 200) {
                            const response = JSON.parse(req.responseText || null);
                            resolve(!response ? null : response.value);
                        }

                        //TODO add reject for failed requests
                    };

                    req.send();
                });
            });

        }

        RetrieveMultiple (setName: string, parameters?: string, headers?: { Key: string, Value: any }[]):
        Promise<Object[]> {
            /// <summary>Executes a RetrieveMultiple requests against the CRM API</summary>
                        /// <param name="client" type="Client">The CRM client that will be used to execute the request</param>
                        /// <param name="setName" type="string">The entity set to retrieve</param>
                        /// <param name="parameters?" type="string">The Web API parameters to apply to the query</param>
                        /// <param name="headers?" type="{key: string, value: any}[]">
                        ///     Array of headers to include in the request submitted to the
                        ///     CRM API
                        /// </param>
            return new Promise((resolve) => {
                this.executeRequest((token) => {
                    var req = new XMLHttpRequest;
                    req.open("GET",
                        encodeURI(this.Config.OrganizationUri +
                            this._constants.WebApiEndPoint +
                            setName +
                            (!parameters ? "" : `?${parameters}`)),
                        true);
                    this.addHeadersToRequest(req, token, headers);

                    req.onreadystatechange = () => {
                        if (req.readyState === 4 && req.status === 200) {
                            const response = JSON.parse(req.responseText || null);
                            resolve(!response ? null : response.value);
                        }

                        //TODO add reject for failed requests
                    };

                    req.send();
                });
            });
        }

        GetGlobalOptionSetOptions(optionsetId: string): Promise<{}[]> {
            /// <summary>Retrieves the options for a global option set</summary>
            /// <param name="optionsetId" type="string">The ID of the global option set to retrieve</param>
            return new Promise((resolve) => {

                this.executeRequest((token) => {
                    var req = new XMLHttpRequest;
                    req.open("GET",
                        encodeURI(this.Config.OrganizationUri +
                            this._constants.WebApiEndPoint +
                            `GlobalOptionSetDefinitions(${optionsetId})`));

                    this.addHeadersToRequest(req, token);

                    req.onreadystatechange = () => {
                        if (req.readyState === 4 && req.status === 200) {
                            const response = JSON.parse(req.responseText || null);
                            resolve(!response ? null : response.value);
                        }
                    };

                    req.send();
                });
            });
        }
    }
}