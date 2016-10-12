"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require("@angular/core");
var CrmConfig_1 = require("../Models/CrmConfig");
var CrmConfig_2 = require("../Models/CrmConfig");
var Crm;
(function (Crm) {
    var WebApi = (function () {
        function WebApi(Config) {
            this.Config = Config;
            this._constants = {
                WebApiEndPoint: "/api/data/v8.1/"
            };
            this._adalConfig = {
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
            this._getParameterByName = function (name, url) {
                if (!name) {
                    return null;
                }
                if (!url) {
                    url = window.location.href;
                }
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
                if (!results) {
                    return null;
                }
                if (!results[2]) {
                    return "";
                }
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            };
            this._adalConfig.authType = this.Config.AuthType;
            this._authContext = new AuthenticationContext(this._adalConfig);
        }
        WebApi.prototype.convertCodeToToken = function (code) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (_this.Config.AuthType !== 0) {
                    reject("No need to convert the token into a JWT if not using on prem ADFS.");
                }
                var req = new XMLHttpRequest;
                var params = {
                    adfsUri: _this.Config.AdfsLoginUri,
                    grantType: "authorization_code",
                    code: code,
                    clientId: _this._adalConfig.clientId,
                    redirectUri: _this._adalConfig.redirectUri
                };
                req.open("POST", _this.Config.AdfsCodeTokenToJwtServiceUri, true);
                req.setRequestHeader("Content-Type", "application/json");
                req.onreadystatechange = function () {
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
        };
        WebApi.prototype.handleAuthenticationError = function (exception) {
            if (exception.Id === this._authContext.CONSTANTS.ERRS.REQUIRES_LOGIN.Id) {
                this.login();
                return;
            }
            ;
            if (exception) {
                alert(exception.Message);
            }
            this._authContext._user = null;
            this._authContext._saveItem(this._authContext.CONSTANTS.STORAGE.IDTOKEN, null);
            this.authenticate();
        };
        WebApi.prototype.executeRequest = function (request) {
            var _this = this;
            this.login()
                .then(function () {
                _this._authContext.acquireToken(_this._adalConfig.clientId, function (error, token) {
                    if (error) {
                        _this.handleAuthenticationError(error);
                        return;
                    }
                    request(token);
                });
            })
                .catch(function (e) { return console.log("reject:  " + e); });
        };
        WebApi.prototype.authenticate = function () {
            var _this = this;
            var isCallback = this._authContext.isCallback(window.location.hash);
            var code = this._getParameterByName("code");
            var error = this._getParameterByName("error");
            if (error) {
                var errorDescription = this._getParameterByName("error_description");
                alert("An error occurred while trying to authenticate to CRM.\r\nError:  " + error + "\r\nMessage:  " + errorDescription);
                return;
            }
            if (code && this._adalConfig.authType === 0) {
                this.convertCodeToToken(code);
            }
            else if (isCallback) {
                this._authContext.handleWindowCallback();
            }
            var loginError = this._authContext.getLoginError();
            if (isCallback && !loginError) {
                window.location = this._authContext
                    ._getItem(this._authContext.CONSTANTS.STORAGE.LOGIN_REQUEST);
            }
            this._user = this._authContext.getCachedUser();
            if (!this._user) {
                this.login();
                return;
            }
            this._authContext.acquireToken(this._adalConfig.clientId, function (exception) {
                if (exception) {
                    _this.handleAuthenticationError(exception);
                    return;
                }
            });
        };
        WebApi.prototype.login = function () {
            var dummyAuthPage = "";
            var authContext = this._authContext;
            var self = this;
            return new Promise(function (resolve, reject) {
                var user = authContext.getCachedUser();
                if (user) {
                    resolve(user);
                    return;
                }
                authContext.config.displayCall = function (url) {
                    authContext.config.displayCall = null;
                    var popup = window.open(url, "auth-popup", "width=800,height=500");
                    var intervalId = window.setInterval(function () {
                        try {
                            if (popup.location.pathname.indexOf("/" + dummyAuthPage) >= 0) {
                                window.clearInterval(intervalId);
                                if (popup.location.hash.indexOf("#id_token") > -1) {
                                    authContext.handleWindowCallback(popup.location.hash);
                                    popup.close();
                                    var user_1 = authContext.getCachedUser();
                                    if (user_1) {
                                        resolve(user_1);
                                    }
                                    else {
                                        reject(authContext.getLoginError());
                                    }
                                    return;
                                }
                                var code = self._getParameterByName("code", popup.location.href);
                                if (!code) {
                                    reject("Failed to login into ADFS and retrieve a code token");
                                }
                                self.convertCodeToToken(code)
                                    .then(function (req) {
                                    var response = JSON.parse(req.responseText);
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
                                    var user = authContext.getCachedUser();
                                    if (user) {
                                        resolve(user);
                                    }
                                    else {
                                        reject(authContext.getLoginError());
                                    }
                                    return;
                                })
                                    .catch(function (e) { return console.log("reject:  " + e); });
                            }
                        }
                        catch (ex) {
                            if (popup.closed) {
                                reject(ex);
                            }
                        }
                    }, 100);
                };
                authContext.config.redirectUri = window.location.href.replace("index.html", "") + dummyAuthPage;
                authContext.login();
            });
        };
        WebApi.prototype.addHeadersToRequest = function (req, token, headers) {
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader("Authorization", "Bearer " + token);
            req.setRequestHeader("Access-Control-Allow-Origin", "localhost");
            headers = headers || [];
            for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
                var header = headers_1[_i];
                req.setRequestHeader(header.Key, header.Value);
            }
        };
        WebApi.prototype.Create = function (setName, toCreate) {
            var _this = this;
            var headers = [
                { Key: "Accept", Value: "application/json" },
                { Key: "Content-Type", Value: "application/json; charset=utf-8" }
            ];
            var regex = new RegExp("\\((\\w{8}\\-\\w{4}\\-\\w{4}\\-\\w{4}\\-\\w{12})\\)$");
            return new Promise(function (resolve, reject) {
                _this.executeRequest(function (token) {
                    var req = new XMLHttpRequest;
                    req.open("POST", encodeURI(_this.Config.OrganizationUri + _this._constants.WebApiEndPoint + setName), true);
                    _this.addHeadersToRequest(req, token, headers);
                    req.onreadystatechange = function () {
                        if (req.readyState === 4 && req.status === 204) {
                            var entityId = req.getResponseHeader("OData-EntityId"), matches = regex.exec(entityId);
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
        };
        WebApi.prototype.InvokeAction = function (actionName, parameters) {
            var _this = this;
            var headers = [
                { Key: "Accept", Value: "application/json" },
                { Key: "Content-Type", Value: "application/json; charset=utf-8" }
            ];
            return new Promise(function (resolve) {
                _this.executeRequest(function (token) {
                    var req = new XMLHttpRequest;
                    req.open("POST", encodeURI(_this.Config.OrganizationUri + _this._constants.WebApiEndPoint + actionName), true);
                    _this.addHeadersToRequest(req, token, headers);
                    req.onreadystatechange = function () {
                        if (req.readyState === 4 && req.status === 200) {
                            var response = JSON.parse(req.responseText || null);
                            resolve(response);
                        }
                    };
                    req.send(JSON.stringify(parameters));
                });
            });
        };
        WebApi.prototype.Retrieve = function (setName, recordId, columns) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (!setName) {
                    reject("The provided set name is null or whitespace.");
                    return;
                }
                if (!recordId) {
                    reject("The provided record ID is null or whitespace.");
                    return;
                }
                _this.executeRequest(function (token) {
                    var req = new XMLHttpRequest;
                    req.open("GET", encodeURI(_this.Config.OrganizationUri +
                        _this._constants.WebApiEndPoint +
                        setName +
                        ("(" + recordId + ")") +
                        (!columns ? "" : +("?$select=" + columns.join(",") + ")"))));
                    _this.addHeadersToRequest(req, token);
                    req.onreadystatechange = function () {
                        if (req.readyState === 4 && req.status === 200) {
                            var response = JSON.parse(req.responseText || null);
                            resolve(!response ? null : response.value);
                        }
                    };
                    req.send();
                });
            });
        };
        WebApi.prototype.RetrieveMultiple = function (setName, parameters, headers) {
            var _this = this;
            return new Promise(function (resolve) {
                _this.executeRequest(function (token) {
                    var req = new XMLHttpRequest;
                    req.open("GET", encodeURI(_this.Config.OrganizationUri +
                        _this._constants.WebApiEndPoint +
                        setName +
                        (!parameters ? "" : "?" + parameters)), true);
                    _this.addHeadersToRequest(req, token, headers);
                    req.onreadystatechange = function () {
                        if (req.readyState === 4 && req.status === 200) {
                            var response = JSON.parse(req.responseText || null);
                            resolve(!response ? null : response.value);
                        }
                    };
                    req.send();
                });
            });
        };
        WebApi.prototype.GetGlobalOptionSetOptions = function (optionsetId) {
            var _this = this;
            return new Promise(function (resolve) {
                _this.executeRequest(function (token) {
                    var req = new XMLHttpRequest;
                    req.open("GET", encodeURI(_this.Config.OrganizationUri +
                        _this._constants.WebApiEndPoint +
                        ("GlobalOptionSetDefinitions(" + optionsetId + ")")));
                    _this.addHeadersToRequest(req, token);
                    req.onreadystatechange = function () {
                        if (req.readyState === 4 && req.status === 200) {
                            var response = JSON.parse(req.responseText || null);
                            resolve(!response ? null : response.value);
                        }
                    };
                    req.send();
                });
            });
        };
        WebApi = __decorate([
            core_1.Injectable(),
            __param(0, core_1.Inject(CrmConfig_1.CRM_CONFIG)), 
            __metadata('design:paramtypes', [CrmConfig_2.CrmConfig])
        ], WebApi);
        return WebApi;
    }());
    Crm.WebApi = WebApi;
})(Crm = exports.Crm || (exports.Crm = {}));
//# sourceMappingURL=Crm.WebApi.js.map