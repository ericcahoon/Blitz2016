﻿import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FORM_DIRECTIVES } from "@angular/forms";

//import models
import { Pizza } from "../Models/PizzaBuilder/Pizza";
import { Contact } from "../Models/Contact"

//import services
import { Crm } from "../Services/Crm.WebApi";

@Component({
    selector: "place-order-dialog",
    templateUrl: "app/Templates/PizzaBuilder/place-order-dialog.htm",
    directives: [FORM_DIRECTIVES]
})
export class PlaceOrderDialog {
    @Input("Pizzas") _pizzas: Pizza[];
    @Output() onCloseDialogClicked = new EventEmitter();

    constructor(private _client: Crm.WebApi) { }

    private _firstName: string;
    private _lastName: string;
    private _phone: string;
    private _comments: string;
    private _isSaving = false;
    private _isSubmitted = false;

    OnClose = new EventEmitter();
    Pizzas: Pizza[];

    private handleException(ex: any): void {
        /// <summary></summary>
        /// <param name="ex" type="any"></param>
        console.log(`Exception:  ${ex}`);
        this.OnClose.emit("event");
    }

    private submitOrder() {
        
        alert("You clicked the submit order button");
    }

    private closeDialog() {
        /// <summary>Close the dialog</summary>
        this.onCloseDialogClicked.emit();
    }

} 