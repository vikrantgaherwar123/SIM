import { Pipe, PipeTransform } from '@angular/core';
import { CONSTANTS } from './constants';


@Pipe({name: 'CurrencyPipe',
pure: true})
export class CurrencyPipe implements PipeTransform {
  public settings: any
  mysymbols

  transform(value: string): string {
    return this.currencyPattern(value);
  }
  constructor(private CONST: CONSTANTS){}
  
  currencyPattern(value){
    if(value){
    this.settings = JSON.parse(localStorage.getItem('user')).setting

    if (this.settings.currencyText) {
        this.mysymbols = this.CONST.COUNTRIES.filter(symbole => symbole.countryName == this.settings.country)[0].currencyName;
    }
    else {
        this.mysymbols = this.CONST.COUNTRIES.filter(symbole => symbole.countryName == this.settings.country)[0].currencyCode;
    }
    if(this.settings.numberFormat == '###.###.###,00'){

      var formatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      });
      
      value = formatter.format(value);
      value = value.replace(/\€/g,"")
      console.log(value);
      
    }else if(this.settings.numberFormat == '##.##.##.###,00'){
      
      var formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      });
      
      value = formatter.format(value);
      value = value.replace(/\₹/g,"")
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
      value = value.replace(/\€/g,"")
      
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
      value = value.replace(/\₹/g,"")
    }
    return value
  }

}

}