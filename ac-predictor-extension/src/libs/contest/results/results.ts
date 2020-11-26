import { Result } from "./result";

export abstract class Results {
    abstract getUserResult(userScreenName: string): Result;
}
