import { HttpClient, HttpHeaderResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members : Member[] = [];  


  constructor(private http : HttpClient) { }

  getMembers(){
    if(this.members.length > 0) return of(this.members);
    return this.http.get<Member[]>(this.baseUrl + 'users'/*, this.getHttpOptions()*/).pipe(
      map( members => {
        this.members = members;
        return members;
      })
    )
  }

  getMember(username : string){
    //const member = this.members.find(x => x.userName === username);
    //if(member) return of(this.members);
    return this.http.get<Member>(this.baseUrl + 'users/' + username/*, this.getHttpOptions()*/);
  }

  // getHttpOptions(){
  //   const userString = localStorage.getItem('user');
  //   if(!userString) return;
  //   const user = JSON.parse(userString);
  //   return {
  //     headers : new HttpHeaders({
  //       Authorization : 'Bearer ' + user.token
  //     })
  //   }
  // }

  updateMember(member : Member){
    return this.http.put(this.baseUrl + 'users', member)
  }

  setMainPhoto(photoId : number){
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {})
  }

  deletePhoto(photoId : number){
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }
}
