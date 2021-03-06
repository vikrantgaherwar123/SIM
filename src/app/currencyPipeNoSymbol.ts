import { Pipe, PipeTransform } from '@angular/core';
import { CONSTANTS } from './constants';


@Pipe({name: 'CurrencyPipeNoSymbol',
pure: true})
export class CurrencyPipeNoSymbol implements PipeTransform {
  public settings: any
  mysymbols

  transform(value: string): string {
    return this.currencyPattern(value);
  }
  constructor(private CONST: CONSTANTS){}
  
  currencyPattern(value){
    if(value){
      this.settings = JSON.parse(localStorage.getItem('user')).setting
  

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