import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { HttpStoreVariables } from '../data/http-store-variables';
import { Observer } from 'rxjs/Observer';


export enum HttpStoreOptions {
    LocalStore_ThenRefreshFromServer,
    LocalStore_ServerRefreshIfMissing,
    Server_NoLocalStorePersist,
    _Refresh,
    _RefreshIfMissing
} 

@Injectable()
export class HttpStore {

    private onErrorCallbackMethod: any;

    constructor(private http: Http, private storage: Storage, private httpStoreVariables: HttpStoreVariables) {
    }

    public onError(callback: any): void {
        this.onErrorCallbackMethod = callback;
    }

    optionUsesLocalStore(options: HttpStoreOptions): boolean {
        switch (options) {
            case HttpStoreOptions._RefreshIfMissing:
            case HttpStoreOptions.LocalStore_ServerRefreshIfMissing:
            case HttpStoreOptions.LocalStore_ThenRefreshFromServer:
                return true;
            case HttpStoreOptions.Server_NoLocalStorePersist:
            case HttpStoreOptions._Refresh:
                return false;
        }
    }

    public getErrorMessageFromResponse(response : any) : string {
        if (!response) return "";
        if (response.ExceptionMessage) return response.ExceptionMessage;
        if (response.statusText) return response.statusText;
        return response;
    }

    public remove(controllerAndParameters: string){
            this.storage.remove(controllerAndParameters);
    };

    public get(controllerAndParameters: string, options: HttpStoreOptions = HttpStoreOptions.LocalStore_ThenRefreshFromServer): Observable<any> {
        var optionUsesLocalStore = this.optionUsesLocalStore(options);
        
        return Observable.create((observer : Observer<any>) => {
            if (optionUsesLocalStore) {
                this.storage.get(controllerAndParameters).then((data) => {
                    if (data) {
                        if (options === HttpStoreOptions._RefreshIfMissing) {
                            observer.complete();
                            return;
                        } else {
                            observer.next(data);
                            if (options === HttpStoreOptions.LocalStore_ServerRefreshIfMissing) {
                                observer.complete();
                                return;
                            }
                        }
                    }
                    if (!data || options === HttpStoreOptions.LocalStore_ThenRefreshFromServer) {
                        this.fetchFromServer(controllerAndParameters).then(data => {
                            if (data) observer.next(data);
                            observer.complete();
                            return;
                        }, error => {
                            observer.complete();
                            return;
                        });
                    }
                }, onLocalStorageRejected => {
                    this.handleError(controllerAndParameters, 'Unexpected local storage error?');
                }).catch(() => {
                    this.handleError(controllerAndParameters, 'Unexpected local storage error?');
                });
            } else if (!optionUsesLocalStore) {
                this.fetchFromServer(controllerAndParameters).then(data => {
                    if (data) observer.next(data);
                    observer.complete();
                    return;
                }, (error) => {
                    this.handleError(controllerAndParameters, error);
                    observer.complete();
                    return;
                });
            }
        });
    }

    private fetchFromServer(controllerAndParameters: string, authAndRetryOn401: boolean = true): Promise<any> {
        var url = this.httpStoreVariables.baseUrl + controllerAndParameters;
        return new Promise((resolve, reject) => {
            this.http.get(url)
                .map((response: Response) => response.json())
                .subscribe(data => {
                    this.storage.set(controllerAndParameters, data);
                    resolve(data);
                }, (error: HttpErrorResponse) => {
                    this.dealWithGetErrorResponse(error, authAndRetryOn401, controllerAndParameters, resolve, reject);
                });
        });
    }

    private dealWithGetErrorResponse(error: HttpErrorResponse, authAndRetryOn401: boolean, controllerAndParameters: string, resolve: (value?: any) => void, reject: (reason?: any) => void) {
        if ((error.status === 401 || error.status === 403) && authAndRetryOn401) {
                this.fetchFromServer(controllerAndParameters, false).then((data) => resolve(data));
        }
        else {
            reject(error);
        }
    }

    private handleError(controllerAndParameters: string, error: any) {
        console.error('this.http-store.handleError: ' + error);
        if (this.onErrorCallbackMethod) this.onErrorCallbackMethod(controllerAndParameters, error);
    }
}