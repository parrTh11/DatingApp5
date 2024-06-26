import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  registerMode = false
  users : any

  constructor(){}

  ngOnInit(): void {
  //  this.getUsers();
  }

  // getUsers(){
  //   this.http.get("https://localhost:5001/api/users").subscribe({
  //     next : responce => this.users = responce,
  //     error : (error) => {
  //       console.log(error);
  //     },
  //     complete : () => {
  //       console.log("The Request has completed.")
  //     }
  //   })
  // }

  registerToggle(){
    this.registerMode = !this.registerMode;
  }

  cancelRegisterMode(event : boolean){
    this.registerMode = event;
  }

}
