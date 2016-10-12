//import 
import { Component, EventEmitter, Output } from "@angular/core";

//import models
import { CrustTypes } from "../Models/PizzaBuilder/CrustTypes";
import { PizzaSizes } from "../Models/PizzaBuilder/PizzaSizes";

//import react items
import { Observable } from "rxjs/Observable";

@Component({
    selector: "select-crust",
    templateUrl: "app/Templates/PizzaBuilder/select-crust.htm"
})
export class SelectCrust {
    @Output() stepChange = new EventEmitter();

    SelectedCrustType: CrustTypes = CrustTypes.HandTossed;
    SelectedSize: PizzaSizes = PizzaSizes.Small;
    
    private setSelectedCrustTypeAndSize (crust: CrustTypes, size: PizzaSizes) {
        this.SelectedCrustType = crust;
        this.SelectedSize = size;
    }

}   