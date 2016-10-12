//import 
import { Component, Input, EventEmitter, ViewChild } from "@angular/core";

import { PlaceOrderDialog } from "./place-order";

//import models
import { Pizza } from "../Models/PizzaBuilder/Pizza";

//import react items
import { Observable } from "rxjs/Observable";


@Component({
    selector: "pizza-builder-myorder",
    templateUrl: "app/Templates/PizzaBuilder/myorder.htm",
    directives: [
        PlaceOrderDialog
    ]
    //,entryComponents: [PlaceOrderDialog]
})
export class MyOrder {
    @Input("Pizzas") _pizzas: Pizza[];
    
    private _showPlaceOrderDialog = false;

    private placeOrder() {
        this._showPlaceOrderDialog = true;
    }

    private hidePlaceOrderDialog () {
        this._showPlaceOrderDialog = false;
    }
}     