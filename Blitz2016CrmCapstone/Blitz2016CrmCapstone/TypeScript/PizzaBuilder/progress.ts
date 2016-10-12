//import 
import { Component, Input } from "@angular/core";

//import models
import { OrderSteps } from "../Models/PizzaBuilder/OrderSteps";

//import react items
import { Observable } from "rxjs/Observable";


@Component({
    selector: "pizza-builder-progress",
    templateUrl: "app/Templates/PizzaBuilder/progress.htm"
})
export class Progress {
    @Input("CurrentStep")
    ActiveStep: Observable<OrderSteps>;

}    