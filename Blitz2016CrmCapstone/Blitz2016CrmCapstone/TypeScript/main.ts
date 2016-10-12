import { browserDynamicPlatform } from "@angular/platform-browser-dynamic";
import { CrmConfig } from "./Models/CrmConfig"
import { createAppModule } from "./app.module";

export function main (config: CrmConfig) {
    browserDynamicPlatform().bootstrapModule(createAppModule(config));
}