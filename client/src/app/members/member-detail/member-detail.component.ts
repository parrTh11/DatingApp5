import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { TabDirective, TabsModule, TabsetComponent } from 'ngx-bootstrap/tabs';
import { TimeagoModule } from 'ngx-timeago';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { MemberMessagesComponent } from 'src/app/messages/member-messages/member-messages.component';

@Component({
  selector: 'app-member-detail',
  standalone : true,
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
  imports : [CommonModule, TabsModule, GalleryModule, TimeagoModule, MemberMessagesComponent]
})
export class MemberDetailComponent implements OnInit{
  @ViewChild('memberTabs') memberTabs? : TabsetComponent
  member : Member = {} as Member;
  images : GalleryItem[] = [];
  activeTab? : TabDirective;
  messages : Message[] = [];
  
  constructor(private memberService : MembersService, private route : ActivatedRoute, private toastr : ToastrService,
    private messageService : MessageService
  ){}
  
  ngOnInit(): void {
    // this.loadMember();
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
    if(this.activeTab.heading === 'Messages'){
      this.loadMessages();
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
