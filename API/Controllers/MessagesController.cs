using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class MessagesController : BaseApiController
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _uow;
        
        public MessagesController(IMapper mapper, IUnitOfWork uow)
        {
          this._mapper = mapper;
          this._uow = uow;
        }

        [HttpPost]
        public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto){

            var username = User.GetUsername();

            if(username == createMessageDto.RecipientUsername.ToLower())
                return BadRequest("You can't send message to yourself");

             var sender = await _uow.userRepository.GetUserByUsernameAsync(username);
             var recipient = await _uow.userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

             if(recipient == null) return NotFound();

             var message = new Message { 
                Sender = sender,
                Recipient = recipient,
                SenderUsername = sender.UserName,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content
             };

             _uow.messageRepository.AddMessage(message);


             if(await _uow.Complete()) return Ok(_mapper.Map<MessageDto>(message));
             
             return BadRequest("Failed to send a message");
        }


        [HttpGet]
        public async Task<ActionResult<PagedList<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams){

            messageParams.Username = User.GetUsername();

            var messages = await _uow.messageRepository.GetMessagesForUser(messageParams);

            Response.AddPaginationHeader(new PagingationHeader(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalPages));

            return messages;
        }

        [HttpGet("thread/{username}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username){

            var currentUsername = User.GetUsername();

            return Ok(await _uow.messageRepository.GetMessageThread(currentUsername,username));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMessage(int id){

            var username = User.GetUsername();

            var message = await _uow.messageRepository.GetMessage(id);

            if(message.SenderUsername != username && message.RecipientUsername != username){
                return Unauthorized();
            }

            if(message.SenderUsername == username) message.SenderDeleted = true;
            if(message.RecipientUsername == username) message.RecepientDeleted = true;

            if(message.SenderDeleted && message.RecepientDeleted){
                _uow.messageRepository.DeleteMessage(message);
            }

            if(await _uow.Complete()) return Ok();
            return BadRequest("Problem deleting the message");
        }
    }
}