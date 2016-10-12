"use strict";
var Crm;
(function (Crm) {
    var Config = (function () {
        function Config() {
            this.OrganizationUri = "https://dominioncmxdev.crowelocalvm.com";
            this.Tenant = null;
            this.ClientId = "58ED4A27-AFAB-4AB5-A330-5B2B287BAE1C";
            this.PageUrl = "http://localhost:8013/";
            this.AuthType = adal.AuthType.OnPrem;
        }
        return Config;
    }());
    Crm.Config = Config;
})(Crm = exports.Crm || (exports.Crm = {}));
//# sourceMappingURL=Crm.Config.js.map