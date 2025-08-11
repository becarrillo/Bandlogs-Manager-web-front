import { UserRole } from "../enums/user-role";

export interface User {
    userId : number | null,
    firstname : string,
    lastname : string,
    nickname : string,
    phoneNumber : string,
    password : string,
    role : UserRole
}
