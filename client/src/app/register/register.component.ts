import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { map } from 'rxjs';
import { User } from '../_models/user';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  @Input() usersFromHomeComponent : any;
  @Output() cancelRegister = new EventEmitter();
  model : any = {}
  
  
  constructor(private accountServices : AccountService, private toastr : ToastrService){}

  ngOnInit(): void {
    
  }

  register(){
    //console.log(this.model);
    this.accountServices.register(this.model).subscribe({
      next: () => {
        //console.log(response);
        this.cancel();
      },
      error : error => this.toastr.error(error.error)
      
    })
  }

  cancel(){
    this.cancelRegister.emit(false);
    //console.log("cancelled")
  }

}
