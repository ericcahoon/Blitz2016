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
var core_1 = require('@angular/core');
var Crm_WebApi_1 = require("./Crm.WebApi");
var OptionSet_1 = require('../Models/OptionSet');
var PizzaToppingsService = (function () {
    function PizzaToppingsService(_client) {
        this._client = _client;
    }
    PizzaToppingsService.prototype.GetToppings = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this._client.GetGlobalOptionSetOptions("24b7eb1a-2927-44cb-a92b-d54fee161b60")
                .then(function (options) {
                resolve(options.map(function (o) { return new OptionSet_1.OptionSet(o["Value"], o["UserLocalizedLabel"]["Label"]); }));
            });
        });
    };
    PizzaToppingsService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [Crm_WebApi_1.Crm.WebApi])
    ], PizzaToppingsService);
    return PizzaToppingsService;
}());
exports.PizzaToppingsService = PizzaToppingsService;
//# sourceMappingURL=PizzaToppings.js.map