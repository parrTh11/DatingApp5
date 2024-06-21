using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize]
    public class MessageHub : Hub
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _uow;
        private readonly IHubContext<PresenceHub> _presenceHub;
        public MessageHub(IMapper mapper, IUnitOfWork uow, IHubContext<PresenceHub> presenceHub)
        {
           this._mapper = mapper;
           this._uow = uow;
           this._presenceHub = presenceHub;
        }
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext.Request.Query["user"];
            var groupName = GetGroupName(Context.User.GetUsername(), otherUser);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await AddToGroup(groupName);

            var message = await _uow.messageRepository
            .GetMessageThread(Context.User.GetUsername(), otherUser);

            await Clients.Group(groupName).SendAsync("ReceivedMessageThread", message);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await RemoveFromMessageGroup();
            await base.OnDisconnectedAsync(exception);
        }

        private string GetGroupName(string caller, string other){
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}": $"{other}-{caller}";
        }

        public async Task SendMessage(CreateMessageDto createMessageDto){
            
            var username = Context.User.GetUsername();

            if(username == createMessageDto.RecipientUsername.ToLower())
                throw new HubException("You can't send message to yourself");

             var sender = await _uow.userRepository.GetUserByUsernameAsync(username);
             var recipient = await _uow.userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

             if(recipient == null) throw new HubException("Not found user!");

             var message = new Message { 
                Sender = sender,
                Recipient = recipient,
                SenderUsername = sender.UserName,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content
             };


            
            var groupName = GetGroupName(sender.UserName, recipient.UserName);
            var group = await _uow.messageRepository.GetMessageGroup(groupName);

            if(group.Connection.Any(x => x.Username == recipient.UserName)){
                message.DateRead = DateTime.UtcNow;
            }
            else{
                var connections = await PresenceTracker.GetConnectionsForUser(recipient.UserName);
                if(connections!=null){
                    await _presenceHub.Clients.Clients(connections).SendAsync("NewMessageReceived",
                    new {username = sender.UserName, knownAs = sender.KnownAs});
                }
            }
             _uow.messageRepository.AddMessage(message);


             if(await _uow.Complete()) {
                await Clients.Group(groupName).SendAsync("NewMessage", _mapper.Map<MessageDto>(message));
             }
        }

        private async Task<bool> AddToGroup(string groupName){

            var group = await _uow.messageRepository.GetMessageGroup(groupName);
            var connection = new Connection(Context.ConnectionId, Context.User.GetUsername());

            if(group == null){
                group = new Group(groupName);
                _uow.messageRepository.AddGroup(group);
            }

            group.Connection.Add(connection);
            
            return await _uow.Complete();
        }

        private async Task RemoveFromMessageGroup(){
            var connection = await _uow.messageRepository.GetConnection(Context.ConnectionId);
            _uow.messageRepository.RemoveConnection(connection);
            await _uow.Complete();
        }
    }
}
