import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'signedNumber'
})
export class SignedNumberPipe implements PipeTransform {

  transform(value: number): string {
    return value >= 0 ? '+'+value : ''+value;
  }

}
