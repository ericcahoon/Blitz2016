//import 
import { Component, EventEmitter, Output } from "@angular/core";

//import models
import { OptionSet } from '../Models/OptionSet';

//import services
import { PizzaToppingsService } from "../Services/PizzaToppings";

//import react items
import { Observable } from "rxjs/Observable";

@Component({
    selector: "select-toppings",
    templateUrl: "app/Templates/PizzaBuilder/select-toppings.htm",
    providers: [PizzaToppingsService]
})
export class SelectToppings {
    @Output() stepChange = new EventEmitter();

    private _meatToppings: OptionSet[] = [];
    private _nonmeatToppings: OptionSet[] = [];

    constructor(private _toppingsService: PizzaToppingsService) {}

    // ReSharper disable once InconsistentNaming
    ngOnInit(): void {
        this._toppingsService.GetToppings()
            .then((toppings) => {
                this._meatToppings = toppings;
            });


    }
}    