import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HTTP_PROVIDERS } from "@angular/http";
import { AppComponent } from "./app.component";
import { Crm } from"./Services/Crm.WebApi";
import { CRM_CONFIG } from "./Models/CrmConfig";
import { CrmConfig } from "./Models/CrmConfig";


// ReSharper disable once UnusedParameter
export function createAppModule (config: CrmConfig) {
    @NgModule({
        imports: [BrowserModule, FormsModule],
        providers: [
            { provide: "CrmConfig", useValue: config },
            { provide: CRM_CONFIG, useValue: config },
            Crm.WebApi,
            HTTP_PROVIDERS
        ],
        declarations: [AppComponent],
        bootstrap: [AppComponent]
    })
    class AppModule {
    }

    return AppModule;
}