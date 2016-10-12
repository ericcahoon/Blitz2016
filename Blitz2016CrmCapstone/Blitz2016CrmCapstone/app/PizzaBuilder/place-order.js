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
var forms_1 = require("@angular/forms");
var Crm_WebApi_1 = require("../Services/Crm.WebApi");
var PlaceOrderDialog = (function () {
    function PlaceOrderDialog(_client) {
        this._client = _client;
        this.onCloseDialogClicked = new core_1.EventEmitter();
        this._isSaving = false;
        this._isSubmitted = false;
        this.OnClose = new core_1.EventEmitter();
    }
    PlaceOrderDialog.prototype.handleException = function (ex) {
        console.log("Exception:  " + ex);
        this.OnClose.emit("event");
    };
    PlaceOrderDialog.prototype.submitOrder = function () {
        var _this = this;
        var order = {};
        this._client.Create("ch_order", order)
            .then(function (recordId) { return _this.getOrderNumber(recordId); })
            .catch(function (ex) { return _this.handleException(ex); });
    };
    PlaceOrderDialog.prototype.getOrderNumber = function (recordId) {
        var _this = this;
        this._client.Retrieve("ch_order", recordId, ["ch_ordernumber"])
            .then(function (order) {
            alert("Thank you for placing an order.  Your order number is " + order["ch_ordernumber"]);
            _this._isSubmitted = true;
            _this._isSaving = false;
        })
            .catch(function (ex) { return _this.handleException(ex); });
    };
    PlaceOrderDialog.prototype.closeDialog = function () {
        this.onCloseDialogClicked.emit();
    };
    __decorate([
        core_1.Input("Pizzas"), 
        __metadata('design:type', Array)
    ], PlaceOrderDialog.prototype, "_pizzas", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], PlaceOrderDialog.prototype, "onCloseDialogClicked", void 0);
    PlaceOrderDialog = __decorate([
        core_1.Component({
            selector: "place-order-dialog",
            templateUrl: "app/Templates/PizzaBuilder/place-order-dialog.htm",
            directives: [forms_1.FORM_DIRECTIVES]
        }), 
        __metadata('design:paramtypes', [Crm_WebApi_1.Crm.WebApi])
    ], PlaceOrderDialog);
    return PlaceOrderDialog;
}());
exports.PlaceOrderDialog = PlaceOrderDialog;
//# sourceMappingURL=place-order.js.map