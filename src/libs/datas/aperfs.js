import JsonData from './data';

export class APerfsData extends JsonData {
    constructor(contestScreenName, onUpdate) {
        super(
            `https://ac-predictor.azurewebsites.net/api/aperfs/${contestScreenName}`,
            `predictor-aperfs-${contestScreenName}`,
            onUpdate
        );
    }
}
