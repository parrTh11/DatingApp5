export interface Message{
    id: number;
    senderId : string;
    senderUserName : string;
    senderPhotoUrl : string;
    recipientId : string;
    recipientUserName : string;
    recipientPhotoUrl : string;
    content: string;
    dateRead?: Date;
    messageSent : Date;
}