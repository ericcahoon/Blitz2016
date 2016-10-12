/// <reference path="../typings/azure-activedirectory-library/adal.d.ts" />
export module Crm {
    export class Config {
        OrganizationUri: string = "https://dominioncmxdev.crowelocalvm.com";
        Tenant: string = null;
        ClientId: string = "58ED4A27-AFAB-4AB5-A330-5B2B287BAE1C";
        PageUrl: string = "http://localhost:8013/";
        AuthServiceUri: string = "http://localhost:48582/api/Login";
        AdfsInstanceUri: string = "https://sts.crowelocalvmadfs.com:444/adfs/";
        AuthType: adal.AuthType = adal.AuthType.OnPrem;
        DisplayCall: (navigationUrl: string) => void;
    }
}