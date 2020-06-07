class Standings {
    Fixed: boolean;
    AdditionalColumns: null;
    TaskInfo: TaskInfo[];
    StandingsData: StandingData[];
}

class TaskInfo {
    Assignment: string;
    TaskName: string;
    TaskScreenName: string;
}

class StandingData {
    Rank: number;
    Additional: null;
    UserName: string;
    UserScreenName: string;
    UserIsDeleted: boolean;
    Affiliation: string;
    Country: string;
    Rating: number;
    OldRating: number;
    IsRated: boolean;
    Competitions: number;
    TaskResults: StandingResult[];
    TotalResult: StandingResult;
}

class StandingResult {
    Count: number;
    Failure: number;
    Penalty: number;
    Score: number;
    Elapsed: number;
    Status: number;
    Pending: boolean;
    Frozen: boolean;
    Additional: null;
}
