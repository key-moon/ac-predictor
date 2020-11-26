declare interface TaskResult {
    Count: number;
    Failure: number;
    Penalty: number;
    Score: number;
    Elapsed: number;
    Status: number;
    Pending: boolean;
    Frozen: boolean;
}

declare interface TotalResult {
    Count: number;
    Accepted: number;
    Penalty: number;
    Score: number;
    Elapsed: number;
    Frozen: number;
}

declare interface StandingData {
    Rank: number;
    Additional: string;
    UserName: string;
    UserScreenName: string;
    UserIsDeleted: boolean;
    Affiliation: string;
    Country: string;
    Rating: number;
    OldRating: number;
    IsRated: boolean;
    Competitions: number;
    TaskResults: { [key: string]: TaskResult };
    TotalResult: TotalResult;
}

declare interface TaskInfo {
    Assignment: string;
    TaskName: string;
    TaskScreenName: string;
}

declare interface Standings {
    Fixed: boolean;
    AdditionalColumns: string;
    TaskInfo: TaskInfo[];
    StandingsData: StandingData[];
}
