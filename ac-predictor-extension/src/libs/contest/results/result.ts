export class Result {
    IsRated: boolean;
    IsSubmitted: boolean;
    UserScreenName: string;
    Place: number;
    RatedRank: number;
    OldRating: number;
    NewRating: number;
    Competitions: number;
    Performance: number;
    InnerPerformance: number;
    constructor(
        isRated: boolean,
        isSubmitted: boolean,
        userScreenName: string,
        place: number,
        ratedRank: number,
        oldRating: number,
        newRating: number,
        competitions: number,
        performance: number,
        innerPerformance: number
    ) {
        this.IsRated = isRated;
        this.IsSubmitted = isSubmitted;
        this.UserScreenName = userScreenName;
        this.Place = place;
        this.RatedRank = ratedRank;
        this.OldRating = oldRating;
        this.NewRating = newRating;
        this.Competitions = competitions;
        this.Performance = performance;
        this.InnerPerformance = innerPerformance;
    }
}
