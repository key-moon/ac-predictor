const dataURL = "https://data.ac-predictor.com";
const apiURL = "https://ac-predictor-backend.azurewebsites.net";

export async function getAPerfsAsync(contestScreenName: string): Promise<{ [key: string]: number }> {
    const response = await fetch(dataURL + `/aperfs/${contestScreenName}.json`);
    return await response.json();
}

export async function getStandingsAsync(contestScreenName: string): Promise<Standings> {
    const response = await fetch(apiURL + `/standings/${contestScreenName}.json`);
    return await response.json();
}

export async function getContestsAsync(): Promise<string[]> {
    const response = await fetch(dataURL + `/contests.json`);
    return await response.json();
}
