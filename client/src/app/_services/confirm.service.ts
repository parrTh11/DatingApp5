import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { initialState } from 'ngx-bootstrap/timepicker/reducer/timepicker.reducer';
import { ConfimDialogComponent } from '../modals/confim-dialog/confim-dialog.component';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  bsModalRef? : BsModalRef<ConfimDialogComponent>;

  constructor(private modalService : BsModalService) { }

  confirm(
    title = 'Confirmation',
    message = 'Are you sure you want to do this?',
    btnOkText = 'Ok',
    btnCancelText = 'Cancel'
  ){
    const config = {
      initialState : {
        title,
        message,
        btnOkText,
        btnCancelText
      }
    }
    this.bsModalRef = this.modalService.show(ConfimDialogComponent,config)
    return this.bsModalRef.onHidden?.pipe(
      map(() => {
        return this.bsModalRef?.content!.result;
      })
    )
  }
}
