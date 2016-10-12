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
var CrustTypes_1 = require("../Models/PizzaBuilder/CrustTypes");
var PizzaSizes_1 = require("../Models/PizzaBuilder/PizzaSizes");
var SelectCrust = (function () {
    function SelectCrust() {
        this.stepChange = new core_1.EventEmitter();
        this.SelectedCrustType = CrustTypes_1.CrustTypes.HandTossed;
        this.SelectedSize = PizzaSizes_1.PizzaSizes.Small;
    }
    SelectCrust.prototype.setSelectedCrustTypeAndSize = function (crust, size) {
        this.SelectedCrustType = crust;
        this.SelectedSize = size;
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], SelectCrust.prototype, "stepChange", void 0);
    SelectCrust = __decorate([
        core_1.Component({
            selector: "select-crust",
            templateUrl: "app/Templates/PizzaBuilder/select-crust.htm"
        }), 
        __metadata('design:paramtypes', [])
    ], SelectCrust);
    return SelectCrust;
}());
exports.SelectCrust = SelectCrust;
//# sourceMappingURL=select-crust.js.map