import { Injectable } from '@angular/core';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  busyRequestCount = 0;

  constructor(private spinnerService : NgxSpinnerService) { }

  busy(){
    this.busyRequestCount++;
    this.spinnerService.show(undefined, {
      type : 'line-scale',
      bdColor : 'rgba(0,0,50,0.8)',
      color : '#ff0000'
    })
  }

  idle(){
    this.busyRequestCount--;
    if(this.busyRequestCount <= 0){
      this.busyRequestCount = 0;
      this.spinnerService.hide();
    }
  }
}
