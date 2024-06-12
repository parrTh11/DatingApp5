import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { map, of } from 'rxjs';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/UserParams';

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
    let params = this.getPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy',userParams.orderBy);


    return this.getPaginatedResult<Member[]>(this.baseUrl + 'users', params)
  }

  private getPaginatedResult<T>(url: string, params: HttpParams) {
    const paginatedResult : PaginatedResult<T> = new PaginatedResult<T>;

    return this.http.get<T>(url, { observe: 'response', params } /*, this.getHttpOptions()*/).pipe(
      // map( members => {
      //   this.members = members;
      //   return members;
      // })
      map(response => {
        if (response.body) {
          paginatedResult.result = response.body;
        }
        const pagination = response.headers.get('Pagination');
        if (pagination) {
          paginatedResult.pagination = JSON.parse(pagination);
        }
        return paginatedResult;
      })
    );
  }

  private getPaginationHeaders(pageNumber : number, pageSize : number) {
    let params = new HttpParams();

      params = params.append('pageNumber', pageNumber);
      params = params.append('pageSize', pageSize);

      return params;
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
    let params = this.getPaginationHeaders(pageNumber, pageSize);

    params = params.append('predicate', predicate);

    return this.getPaginatedResult<Member[]>(this.baseUrl + 'likes', params);
  }
}
