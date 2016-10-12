import { OpaqueToken } from '@angular/core';

export let CRM_CONFIG = new OpaqueToken('app.config');

export class CrmConfig {
    OrganizationUri: string;  //The URI of the CRM instance
    Tenant: string;
    ClientId: string;  //The ID assigned to the application in ADFS
    AdfsRedirectUri: string; //The URI ADFS should redirect browser to once user has logged in
    AdfsCodeTokenToJwtServiceUri: string;  //The URI of the service that converts the code token returned by ADFS 2.0 into a JWT token.  This is needed because ADFS does not support CORS
    AdfsLoginUri: string;  //The URI of the ADFS server
    AuthType: number; //0 == on-prem, 1 == online
}