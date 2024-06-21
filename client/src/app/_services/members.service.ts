import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { UserParams } from '../_models/UserParams';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { map, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members : Member[] = [];
  memberCache = new Map();
  // paginatedResult : PaginatedResult<Member []> = new PaginatedResult<Member[]>;


  constructor(private http : HttpClient) { }

  getMembers(userParams : UserParams){
    // if(this.members.length > 0) return of(this.members);
    const responce = this.memberCache.get(Object.values(userParams).join('-'));

    if(responce) return of(responce);


    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy',userParams.orderBy);


    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.http).pipe(
      map(responce => {
        this.memberCache.set(Object.values(userParams).join('-'), responce);
        return responce;
      })
    )
  }

  

  getMember(username : string){
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

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
