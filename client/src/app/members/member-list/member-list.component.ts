import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { UserParams } from 'src/app/_models/UserParams';
import { Member } from 'src/app/_models/member';
import { Pagination } from 'src/app/_models/pagination';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit{
  members : Member[] = [];
  pagination : Pagination | undefined;
  userParams : UserParams | undefined;
  user : User | undefined;
  genderList = [{value : 'male', display : 'Males'}, {value : 'female', display : 'Females'}]
  
  constructor(private memberServices : MembersService, private accountService : AccountService){
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if(user){
          this.userParams = new UserParams(user);
          this.user = user;
        }
      }
    })
  }
  
  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(){ 
    if(!this.userParams) return; 
    this.memberServices.getMembers(this.userParams).subscribe({
      next : response => { 
        if(response.result && response.pagination){
          this.members = response.result;
          this.pagination = response.pagination;
        }
      }
    })
  }

  pageChanged(event : any){
    if(this.userParams && this.userParams?.pageNumber !== event.page){
      this.userParams.pageNumber = event.page;
      this.loadMembers();
    }
  }


  resetFilters(){
    if(this.user){
      this.userParams = new UserParams(this.user);
      this.loadMembers();
    }
  }


}


