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
       value.toLocaleString(
        'de-DE', // leave undefined to use the browser's locale,
        // or use a string like 'en-US' to override it.
        { minimumFractionDigits: 2 }
      );
    }else if(this.settings.numberFormat == '##.##.##.###,00'){
       value.toLocaleString(
        'en-IN', // leave undefined to use the browser's locale,
        // or use a string like 'en-US' to override it.
        { minimumFractionDigits: 2 }
      );
      var map = { ',': '.', '.': ',' };
       value.replace(/[,.]/g, function (k) {
        return map[k];
      });
    }
    else if(this.settings.numberFormat == '### ### ###,00'){
       value = value.toLocaleString(
        'Fr', // leave undefined to use the browser's locale,
        // or use a string like 'en-US' to override it.
        { minimumFractionDigits: 2 }
      );
      console.log(value);
      
    }else if(this.settings.numberFormat == '###,###,###.00'){
       value.toLocaleString(
        'en-US', // leave undefined to use the browser's locale,
        // or use a string like 'en-US' to override it.
        { minimumFractionDigits: 2 }
      );
    }else if(this.settings.numberFormat == '##,##,##,###.00'){
       value.toLocaleString(
        'en-IN', // leave undefined to use the browser's locale,
        // or use a string like 'en-US' to override it.
        { minimumFractionDigits: 2 }
      );
    }
    return this.mysymbols +' ' + value
  }

}

}