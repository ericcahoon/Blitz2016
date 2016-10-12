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
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/http");
var app_component_1 = require("./app.component");
var Crm_WebApi_1 = require("./Services/Crm.WebApi");
var CrmConfig_1 = require("./Models/CrmConfig");
function createAppModule(config) {
    var AppModule = (function () {
        function AppModule() {
        }
        AppModule = __decorate([
            core_1.NgModule({
                imports: [platform_browser_1.BrowserModule, forms_1.FormsModule],
                providers: [
                    { provide: "CrmConfig", useValue: config },
                    { provide: CrmConfig_1.CRM_CONFIG, useValue: config },
                    Crm_WebApi_1.Crm.WebApi,
                    http_1.HTTP_PROVIDERS
                ],
                declarations: [app_component_1.AppComponent],
                bootstrap: [app_component_1.AppComponent]
            }), 
            __metadata('design:paramtypes', [])
        ], AppModule);
        return AppModule;
    }());
    return AppModule;
}
exports.createAppModule = createAppModule;
//# sourceMappingURL=app.module.js.map