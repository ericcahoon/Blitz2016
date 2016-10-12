interface IContact {
    Id: string,
    FirstName: string;
    LastName: string;
    Telephone1: string;
} 

export class Contact implements IContact {
    Id: string;
    FirstName: string;
    LastName: string;
    Telephone1: string;
}