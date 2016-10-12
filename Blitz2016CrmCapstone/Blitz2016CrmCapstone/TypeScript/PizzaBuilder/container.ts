//import 
import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

//import sub components
import { MyOrder } from "./myorder"
import { Progress } from "./progress"
import { SelectCheeseAndSauce } from "./select-cheese-and-sauce"
import { SelectCrust } from "./select-crust"
import { SelectToppings } from "./select-toppings"
import { PlaceOrderDialog } from "./place-order";

//import models
import { OrderSteps } from "../Models/PizzaBuilder/OrderSteps"
import { Pizza } from "../Models/PizzaBuilder/Pizza"


//import services
import { Crm } from "../Services/Crm.WebApi";

//import react items
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";


@Component({
    selector: "pizza-builder",
    templateUrl: "app/Templates/PizzaBuilder/container.htm",
    styleUrls: ["app/Templates/PizzaBuilder/default.css"],
    directives: [MyOrder, Progress, SelectCheeseAndSauce, SelectCrust, SelectToppings],
    entryComponents: []
})
export class PizzaBuilder {

    @ViewChild(SelectCheeseAndSauce)
    private _selectCheeseAndSauce: SelectCheeseAndSauce;

    @ViewChild(SelectCrust)
    private _selectCrust: SelectCrust;

    @ViewChild(SelectToppings)
    private _selectToppings: SelectToppings;

    private _activeStep: OrderSteps;
    private _pizzas: Pizza[];

    constructor (private _client: Crm.WebApi) {
        this._activeStep = OrderSteps.SelectCrust;
        this._pizzas = [];
    }

    private gotoPreviousStep() {
        switch (this._activeStep) {
            case OrderSteps.SelectCrust:
                break;
            case OrderSteps.SelectCheeseAndSauce:
                this._activeStep = OrderSteps.SelectCrust;
                break;
            case OrderSteps.SelectToppings:
                this._activeStep = OrderSteps.SelectCheeseAndSauce;
                break;
            default:
                this._activeStep = OrderSteps.SelectCrust;
        }
    }

    private addToOrder() {
        /// <summary>Adds a pizza to the users order</summary>
        const p = new Pizza(this._selectCrust.SelectedSize, this._selectCrust.SelectedCrustType);

        this._pizzas.push(p);

        this._activeStep = OrderSteps.SelectCrust;
    }

    private adjustActiveStep(value) {
        /// <summary>Adjust the active step variable</summary>
        /// <param name="value">Numeric value to increment or decrement the active step value</param>

        if (this._activeStep + value > OrderSteps.SelectToppings) {
            this.addToOrder();
            return;
        }

        this._activeStep = this._activeStep + value;
    }

} 