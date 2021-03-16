import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { Storage } from '@ionic/storage';
import { Chart } from 'chart.js';
import { LoadingController } from 'ionic-angular';
import { SearchPage } from '../search/search';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  detailToggle = [];
  objectKeys = Object.keys;
  coins: [];
  details: Object;
  likedCoins = [];
  chart = [];

  constructor(public navCtrl: NavController, private _data: DataProvider, private storage: Storage, public loading: LoadingController) {
    this.storage.remove('likedCoins');
  }

  ionViewDidLoad() {

  }

  ionViewWillEnter() {
    this._data.allCoinsRefresh().subscribe(()=>{console.log('Fetched all coins')});

    this.refreshCoins();
  }

  refreshCoins() {

    let loader = this.loading.create({
      content: 'Refreshing..',
      spinner: 'bubbles'
    });

    loader.present().then(() => {

      this.storage.get('likedCoins').then((val) => {

        // If the value is not set, then:
        if (!val) {

          console.log('Coins aren`t set');

          this.likedCoins.push('BTC', 'ETH');
          this.storage.set('likedCoins', this.likedCoins);

          this._data.getCoins(this.likedCoins)
            .subscribe(res => {
              this.coins = res;
              this.getCharts();
              loader.dismiss().catch(() => { });
            })
        }
        // It's set
        else {
          this.likedCoins = val;
          console.log('Coins are set');
          this._data.getCoins(this.likedCoins)
            .subscribe(res => {
              this.coins = res;
              this.getCharts();
              loader.dismiss().catch(() => { });
            })
        }

      });

    });

  }

  private getCharts() {
    this.objectKeys(this.coins).forEach(coin => {
      this._data.refreshChart(coin)
        .subscribe(() => { console.log(coin + ' done'); });
    });
  }

  coinDetails(coin, index) {

    if (this.detailToggle[index])
      this.detailToggle[index] = false;
    else {
      this.detailToggle.fill(false);
      this._data.getCoin(coin)
        .subscribe(res => {
          this.details = res['DISPLAY'][coin]['ZAR'];
          this.detailToggle[index] = true;
        }, (error) => { }, () => {
          console.log('Done!')
          console.log(coin);
          this._data.getChart(coin)
            .subscribe(res => {

              console.log(res);

              let coinHistory = res['Data'].map((a) => (a.close));

              setTimeout(() => {
                this.chart[index] = new Chart('canvas' + index, {
                  type: 'line',
                  data: {
                    labels: coinHistory,
                    datasets: [{
                      data: coinHistory,
                      borderColor: "#3cba9f",
                      fill: false
                    }
                    ]
                  },
                  options: {
                    tooltips: {
                      callbacks: {
                        label: function (tooltipItems, data) {
                          return "ZAR" + tooltipItems.yLabel.toString();
                        }
                      }
                    },
                    responsive: true,
                    legend: {
                      display: false
                    },
                    scales: {
                      xAxes: [{
                        display: false
                      }],
                      yAxes: [{
                        display: false
                      }],
                    }
                  }
                });
              }, 150);

            });

        });


    }

  }

  swiped(index) {
    this.detailToggle[index] = false;
  }

  removeCoin(coin) {
    this.detailToggle.fill(false);

    this.likedCoins = this.likedCoins.filter(function (item) {
      return item !== coin
    });

    this.storage.set('likedCoins', this.likedCoins);

    setTimeout(() => {
      this.refreshCoins();
    }, 300);
  }

  showSearch() {
    this.navCtrl.push(SearchPage);
  }

}
