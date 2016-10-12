import { PizzaSizes } from "./PizzaSizes";
import { CrustTypes } from "./CrustTypes";

interface IPizza {
    Id: string;
    Size: PizzaSizes;
    Crust: CrustTypes;
}

export class Pizza implements IPizza {
    Id: string;
    Size: PizzaSizes;
    Crust: CrustTypes;

    constructor(size: PizzaSizes, crust: CrustTypes) {
        this.Size = size;
        this.Crust = crust;
    }

    get Name(): string {
        return this.convertSizeEnumToString(this.Size) + " " + this.convertCrustTypeEnumToString(this.Crust);
    }

    private convertSizeEnumToString(size: PizzaSizes): string {
        /// <summary>Convert the pizza size enum to a string</summary>
        /// <param name="size" type="PizzaSizes">The pizza size enum to convert</param>
        /// <returns type="string"></returns>
        switch (size) {
            case PizzaSizes.Large:
                return "14 \"";
            case PizzaSizes.Medium:
                return "12 \"";
            case PizzaSizes.Small:
                return "10 \"";
        }
    }

    private convertCrustTypeEnumToString(crustType: CrustTypes): string {
        /// <summary>Convert the pizza crust type to a string</summary>
        /// <param name="crustType" type="CrustTypes">The crust type to convert</param>
        /// <returns type="string"></returns>
        if (crustType === CrustTypes.HandTossed) return "Hand Tossed";
        return "Pan";
    }

    public AddTopping () {
        
    }

    public RemoveTopping () {
        
    }

    public GetName () {
        
    }
}