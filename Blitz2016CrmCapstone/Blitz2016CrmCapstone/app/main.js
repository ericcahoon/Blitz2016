"use strict";
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var app_module_1 = require("./app.module");
function main(config) {
    platform_browser_dynamic_1.browserDynamicPlatform().bootstrapModule(app_module_1.createAppModule(config));
}
exports.main = main;
//# sourceMappingURL=main.js.map