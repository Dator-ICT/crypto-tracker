import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { HttpStore, HttpStoreOptions } from '../data/http-store';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataProvider {
  result:any;
  constructor(private httpStore: HttpStore) {
  }

  getCoins(coins) : Observable<any>{
    let coinlist = '';
    coinlist = coins.join();
    return this.httpStore.get("pricemulti?fsyms="+coinlist+"&tsyms=ZAR", HttpStoreOptions.LocalStore_ThenRefreshFromServer);
  }

  getCoin(coin) : Observable<any>{
    return this.httpStore.get("pricemultifull?fsyms="+coin+"&tsyms=ZAR", HttpStoreOptions.LocalStore_ThenRefreshFromServer);
  }

  getChart(coin) : Observable<any>{
    return this.httpStore.get("histoday?fsym="+coin+"&tsym=ZAR&limit=30&aggregate=1", HttpStoreOptions.LocalStore_ThenRefreshFromServer);
  }

  allCoins() : Observable<any>{
    return this.httpStore.get('all/coinlist', HttpStoreOptions.LocalStore_ThenRefreshFromServer);  
  }

}
