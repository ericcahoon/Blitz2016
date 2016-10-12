//import 
import { Component, EventEmitter, Output } from "@angular/core";

//import models
import { SauceTypes } from "../Models/PizzaBuilder/SauceTypes";

//import react items
import { Observable } from "rxjs/Observable";

@Component({
    selector: "select-cheese-and-sauce",
    templateUrl: "app/Templates/PizzaBuilder/select-cheese-and-sauce.htm"
})
export class SelectCheeseAndSauce {
    @Output() stepChange = new EventEmitter();

    private _addCheese: boolean = true;
    private _addSacue: boolean = true;

    SelectedSacueType: SauceTypes;
}  