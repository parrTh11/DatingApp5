import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { UserParams } from '../_models/UserParams';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';


@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members : Member[] = [];
  // paginatedResult : PaginatedResult<Member []> = new PaginatedResult<Member[]>;


  constructor(private http : HttpClient) { }

  getMembers(userParams : UserParams){
    // if(this.members.length > 0) return of(this.members);
    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy',userParams.orderBy);


    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.http)
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

  addLike(username : string){
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(predicate : string, pageNumber : number, pageSize : number){
    let params = getPaginationHeaders(pageNumber, pageSize);

    params = params.append('predicate', predicate);

    return getPaginatedResult<Member[]>(this.baseUrl + 'likes', params, this.http);
  }
}
