import { Client } from "./client";

export class HttpClient implements Client {
    public async fetchJsonDataAsync<T>(url: string): Promise<T> {
        const response = await fetch(url);
        if (response.ok) return response.json();
        throw new Error(`request to ${url} returns ${response.status}`);
    }

    public async fetchTextDataAsync(url: string): Promise<string> {
        const response = await fetch(url);
        if (response.ok) return response.text();
        throw new Error(`request to ${url} returns ${response.status}`);
    }
}
