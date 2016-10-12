import { Component, Inject } from "@angular/core";
import { PizzaBuilder } from "./PizzaBuilder/container";

@Component({
    selector: "my-app",
    template: "<pizza-builder></pizza-builder>",
    directives: [PizzaBuilder]
})
export class AppComponent {
    constructor (@Inject("CrmConfig") private _config: Object) {
    }
}