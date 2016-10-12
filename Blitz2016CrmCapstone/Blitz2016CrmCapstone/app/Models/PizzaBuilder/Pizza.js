"use strict";
var PizzaSizes_1 = require("./PizzaSizes");
var CrustTypes_1 = require("./CrustTypes");
var Pizza = (function () {
    function Pizza(size, crust) {
        this.Size = size;
        this.Crust = crust;
    }
    Object.defineProperty(Pizza.prototype, "Name", {
        get: function () {
            return this.convertSizeEnumToString(this.Size) + " " + this.convertCrustTypeEnumToString(this.Crust);
        },
        enumerable: true,
        configurable: true
    });
    Pizza.prototype.convertSizeEnumToString = function (size) {
        switch (size) {
            case PizzaSizes_1.PizzaSizes.Large:
                return "14 \"";
            case PizzaSizes_1.PizzaSizes.Medium:
                return "12 \"";
            case PizzaSizes_1.PizzaSizes.Small:
                return "10 \"";
        }
    };
    Pizza.prototype.convertCrustTypeEnumToString = function (crustType) {
        if (crustType === CrustTypes_1.CrustTypes.HandTossed)
            return "Hand Tossed";
        return "Pan";
    };
    Pizza.prototype.AddTopping = function () {
    };
    Pizza.prototype.RemoveTopping = function () {
    };
    Pizza.prototype.GetName = function () {
    };
    return Pizza;
}());
exports.Pizza = Pizza;
//# sourceMappingURL=Pizza.js.map