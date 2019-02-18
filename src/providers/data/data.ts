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
    return this.httpStore.get("pricemulti?fsyms="+coinlist+"&tsyms=ZAR" + "&api_key=1f9eae12e84f830ff2550b3c85ff7620b88f4bf3e46cad5e691347887ab16eea", HttpStoreOptions.LocalStore_ThenRefreshFromServer);
  }

  getCoin(coin) : Observable<any>{
    return this.httpStore.get("pricemultifull?fsyms="+coin+"&tsyms=ZAR" + "&api_key=1f9eae12e84f830ff2550b3c85ff7620b88f4bf3e46cad5e691347887ab16eea", HttpStoreOptions.LocalStore_ThenRefreshFromServer);
  }

  getChart(coin) : Observable<any>{
    return this.httpStore.get("histoday?fsym="+coin+"&tsym=ZAR&limit=30&aggregate=1" + "&api_key=1f9eae12e84f830ff2550b3c85ff7620b88f4bf3e46cad5e691347887ab16eea", HttpStoreOptions._Refresh);
  }

  allCoins() : Observable<any>{
    return this.httpStore.get('all/coinlist', HttpStoreOptions.LocalStore_ThenRefreshFromServer);  
  }

}
