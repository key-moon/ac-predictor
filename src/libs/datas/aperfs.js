import { JsonData } from './data';

export class APerfsData extends JsonData {
    constructor(contestScreenName) {
        super(
            `https://ac-predictor.azurewebsites.net/api/aperfs/${contestScreenName}`
        );
    }
}
