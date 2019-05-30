import { Pipe, PipeTransform } from '@angular/core';
import { CONSTANTS } from './constants';


@Pipe({name: 'CurrencyPipe',
pure: true})
export class CurrencyPipe implements PipeTransform {
  public settings: any
  myCurrencySymbol

  transform(value: string): string {
    return this.currencyPattern(value);
  }
  constructor(private CONST: CONSTANTS){}
  
  currencyPattern(value){
    if(value){
    this.settings = JSON.parse(localStorage.getItem('user')).setting

    if (this.settings.currencyText) {
        this.myCurrencySymbol = this.CONST.COUNTRIES.filter(symbole => symbole.countryName == this.settings.country)[0].currencyName;
    }
    else {
        this.myCurrencySymbol = this.CONST.COUNTRIES.filter(symbole => symbole.countryName == this.settings.country)[0].currencyCode;
    }
    if(this.settings.numberFormat == '###.###.###,00'){

      var formatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      });
      
      value = formatter.format(value);
      value = value.slice(0, -1);
      console.log(value);
      
    }else if(this.settings.numberFormat == '##.##.##.###,00'){
      
      var formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      });
      
      value = formatter.format(value);
      value = value.substr(1);
      var map = { ',': '.', '.': ',' };
      value = value.replace(/[,.]/g, function (k) {
        return map[k];
      });
      console.log(value);
    }
    else if(this.settings.numberFormat == '### ### ###,00'){
      
      var formatter = new Intl.NumberFormat('Fr', {
        style: 'currency',
        currency: 'EUR',
      });
      
      value = formatter.format(value);
      value = value.slice(0, -1);
      
      console.log(value);
      
    }else if(this.settings.numberFormat == '###,###,###.00'){
      
      var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      
      value = formatter.format(value);
      value = value.replace(/\$/g,"")
    }else if(this.settings.numberFormat == '##,##,##,###.00'){
      
      var formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      });
      
      value = formatter.format(value);
      value = value.substr(1);
    }
    return this.myCurrencySymbol +' ' +value
  }

}

}