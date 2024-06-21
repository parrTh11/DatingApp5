import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { TabDirective, TabsModule, TabsetComponent } from 'ngx-bootstrap/tabs';
import { TimeagoModule } from 'ngx-timeago';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';
import { MemberMessagesComponent } from 'src/app/messages/member-messages/member-messages.component';

@Component({
  selector: 'app-member-detail',
  standalone : true,
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
  imports : [CommonModule, TabsModule, GalleryModule, TimeagoModule, MemberMessagesComponent, DatePipe]
})
export class MemberDetailComponent implements OnInit, OnDestroy{
  @ViewChild('memberTabs', {static : true}) memberTabs? : TabsetComponent
  member : Member = {} as Member;
  images : GalleryItem[] = [];
  activeTab? : TabDirective;
  messages : Message[] = [];
  user? : User
  
  constructor(private memberService : MembersService, private route : ActivatedRoute, private toastr : ToastrService,
    private messageService : MessageService, public presenceService : PresenceService, private accountService : AccountService
  ){
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if(user) this.user = user
      }
    })
  }
  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }
  
  ngOnInit(): void {
    this.route.data.subscribe({
      next : data => this.member = data['member']
    })

    this.route.queryParams.subscribe({
      next : params => {
        params['tab'] && this.selectTab(params['tab'])
      }
    })

    this.getImages()
  }

  onTabActived(data : TabDirective){
    this.activeTab = data;
    if(this.activeTab.heading === 'Messages' && this.user){
      this.messageService.createHubConnection(this.user, this.member.userName)
    }
    else{
      this.messageService.stopHubConnection();
    }
  }

  selectTab(heading : string){
    if(this.memberTabs){
      this.memberTabs.tabs.find(x => x.heading === heading)!.active = true
    }
  }


  loadMessages(){
    if(this.member){
      this.messageService.getMessageThread(this.member.userName).subscribe({
        next: messages => this.messages = messages
      })
    }
  }

  
  // loadMember(){
  //   var username = this.route.snapshot.paramMap.get('username')
  //   if(!username) return ;
  //   this.memberService.getMember(username).subscribe({
  //     next : member => {
  //       this.member = member
  //     }
  //   })
  // }

  getImages(){
    if(!this.member) return;
    for(const photo of this.member.photos){
      this.images.push(new ImageItem({src: photo.url, thumb : photo.url})); 
    }
  }

  addLike(member : Member){
    this.memberService.addLike(member.userName).subscribe({
      next: () => this.toastr.success("You have liked " + member.knownAs)
    })
  }

}
