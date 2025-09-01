import { ApiListResponse, ApiPostMethods } from '../../types';

export class Api {
    readonly baseUrl: string;
    protected options: RequestInit;

    constructor(baseUrl: string, options: RequestInit = {}) {
        this.baseUrl = baseUrl;
        this.options = {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers as object ?? {})
            }
        };
    }

    protected handleResponse<T>(response: Response): Promise<T> {
        if (response.ok) {
            // Обработка пустых ответов (204 No Content)
            if (response.status === 204) {
                return Promise.resolve({} as T);
            }
            
            // Обработка 304 Not Modified - возвращаем пустой объект или массив
            if (response.status === 304) {
                console.warn('API returned 304 Not Modified, using empty response');
                return Promise.resolve([] as unknown as T);
            }
            
            return response.json();
        } else {
            return response.json()
                .then(data => Promise.reject(data.error ?? response.statusText));
        }
    }

    get<T>(uri: string): Promise<T> {
        return fetch(this.baseUrl + uri, {
            ...this.options,
            method: 'GET',
            headers: {
                ...this.options.headers,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        }).then((response) => this.handleResponse<T>(response));
    }

    post<T>(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<T> {
        return fetch(this.baseUrl + uri, {
            ...this.options,
            method,
            body: JSON.stringify(data)
        }).then((response) => this.handleResponse<T>(response));
    }
}