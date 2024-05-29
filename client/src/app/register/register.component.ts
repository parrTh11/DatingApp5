import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { map } from 'rxjs';
import { User } from '../_models/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  @Input() usersFromHomeComponent : any;
  @Output() cancelRegister = new EventEmitter();
  model : any = {}
  
  
  constructor(private accountServices : AccountService){}

  ngOnInit(): void {
    
  }

  register(){
    //console.log(this.model);
    this.accountServices.register(this.model).subscribe({
      next: () => {
        //console.log(response);
        this.cancel();
      },
      error : error => console.log(error)
      
    })
  }

  cancel(){
    this.cancelRegister.emit(false);
    //console.log("cancelled")
  }

}
