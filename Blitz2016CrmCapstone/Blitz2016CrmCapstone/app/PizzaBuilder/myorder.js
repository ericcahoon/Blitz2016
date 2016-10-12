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
var place_order_1 = require("./place-order");
var MyOrder = (function () {
    function MyOrder() {
        this._showPlaceOrderDialog = false;
    }
    MyOrder.prototype.placeOrder = function () {
        this._showPlaceOrderDialog = true;
    };
    MyOrder.prototype.hidePlaceOrderDialog = function () {
        this._showPlaceOrderDialog = false;
    };
    __decorate([
        core_1.Input("Pizzas"), 
        __metadata('design:type', Array)
    ], MyOrder.prototype, "_pizzas", void 0);
    MyOrder = __decorate([
        core_1.Component({
            selector: "pizza-builder-myorder",
            templateUrl: "app/Templates/PizzaBuilder/myorder.htm",
            directives: [
                place_order_1.PlaceOrderDialog
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], MyOrder);
    return MyOrder;
}());
exports.MyOrder = MyOrder;
//# sourceMappingURL=myorder.js.map