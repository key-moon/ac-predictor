export interface Client {
    fetchTextDataAsync(url: string): Promise<string>;
    fetchJsonDataAsync<T>(url: string): Promise<T>;
}
