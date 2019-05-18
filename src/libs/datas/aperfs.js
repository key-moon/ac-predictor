import { WebData } from './data';

export class APerfsData extends WebData {
    constructor(contestScreenName) {
        super(
            `https://ac-predictor.azurewebsites.net/api/aperfs/${contestScreenName}`
        );
    }
}
