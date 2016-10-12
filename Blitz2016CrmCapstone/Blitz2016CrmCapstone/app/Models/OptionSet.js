"use strict";
var OptionSet = (function () {
    function OptionSet(Label, Value, IsSelected) {
        if (IsSelected === void 0) { IsSelected = false; }
        this.Label = Label;
        this.Value = Value;
        this.IsSelected = IsSelected;
    }
    return OptionSet;
}());
exports.OptionSet = OptionSet;
//# sourceMappingURL=OptionSet.js.map