import { Injectable } from '@angular/core';
import { Crm } from "./Crm.WebApi";
import { OptionSet } from '../Models/OptionSet';

@Injectable()
export class PizzaToppingsService {

    constructor(private _client: Crm.WebApi) {}


    GetToppings(): Promise<OptionSet[]> {
        /// <summary></summary>
        /// <returns type=""></returns>
        return new Promise((resolve) => {
            this._client.GetGlobalOptionSetOptions("24b7eb1a-2927-44cb-a92b-d54fee161b60")
                .then((options) => {
                    resolve(options.map(o => new OptionSet(o["Value"], o["UserLocalizedLabel"]["Label"])));
                });
        });
    }

} 