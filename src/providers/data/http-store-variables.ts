import { Injectable } from '@angular/core';

@Injectable()
export class HttpStoreVariables {
    constructor() {
        
    }
    public environment: string = 'live';
    public baseUrl = 'https://min-api.cryptocompare.com/data/';
}