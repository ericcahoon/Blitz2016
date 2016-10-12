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
var myorder_1 = require("./myorder");
var progress_1 = require("./progress");
var select_cheese_and_sauce_1 = require("./select-cheese-and-sauce");
var select_crust_1 = require("./select-crust");
var select_toppings_1 = require("./select-toppings");
var OrderSteps_1 = require("../Models/PizzaBuilder/OrderSteps");
var Pizza_1 = require("../Models/PizzaBuilder/Pizza");
var Crm_WebApi_1 = require("../Services/Crm.WebApi");
var PizzaBuilder = (function () {
    function PizzaBuilder(_client) {
        this._client = _client;
        this._activeStep = OrderSteps_1.OrderSteps.SelectCrust;
        this._pizzas = [];
    }
    PizzaBuilder.prototype.gotoPreviousStep = function () {
        switch (this._activeStep) {
            case OrderSteps_1.OrderSteps.SelectCrust:
                break;
            case OrderSteps_1.OrderSteps.SelectCheeseAndSauce:
                this._activeStep = OrderSteps_1.OrderSteps.SelectCrust;
                break;
            case OrderSteps_1.OrderSteps.SelectToppings:
                this._activeStep = OrderSteps_1.OrderSteps.SelectCheeseAndSauce;
                break;
            default:
                this._activeStep = OrderSteps_1.OrderSteps.SelectCrust;
        }
    };
    PizzaBuilder.prototype.addToOrder = function () {
        var p = new Pizza_1.Pizza(this._selectCrust.SelectedSize, this._selectCrust.SelectedCrustType);
        this._pizzas.push(p);
        this._activeStep = OrderSteps_1.OrderSteps.SelectCrust;
    };
    PizzaBuilder.prototype.adjustActiveStep = function (value) {
        if (this._activeStep + value > OrderSteps_1.OrderSteps.SelectToppings) {
            this.addToOrder();
            return;
        }
        this._activeStep = this._activeStep + value;
    };
    __decorate([
        core_1.ViewChild(select_cheese_and_sauce_1.SelectCheeseAndSauce), 
        __metadata('design:type', select_cheese_and_sauce_1.SelectCheeseAndSauce)
    ], PizzaBuilder.prototype, "_selectCheeseAndSauce", void 0);
    __decorate([
        core_1.ViewChild(select_crust_1.SelectCrust), 
        __metadata('design:type', select_crust_1.SelectCrust)
    ], PizzaBuilder.prototype, "_selectCrust", void 0);
    __decorate([
        core_1.ViewChild(select_toppings_1.SelectToppings), 
        __metadata('design:type', select_toppings_1.SelectToppings)
    ], PizzaBuilder.prototype, "_selectToppings", void 0);
    PizzaBuilder = __decorate([
        core_1.Component({
            selector: "pizza-builder",
            templateUrl: "app/Templates/PizzaBuilder/container.htm",
            styleUrls: ["app/Templates/PizzaBuilder/default.css"],
            directives: [myorder_1.MyOrder, progress_1.Progress, select_cheese_and_sauce_1.SelectCheeseAndSauce, select_crust_1.SelectCrust, select_toppings_1.SelectToppings],
            entryComponents: []
        }), 
        __metadata('design:paramtypes', [Crm_WebApi_1.Crm.WebApi])
    ], PizzaBuilder);
    return PizzaBuilder;
}());
exports.PizzaBuilder = PizzaBuilder;
//# sourceMappingURL=container.js.map