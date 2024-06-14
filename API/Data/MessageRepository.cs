using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context; 
        private readonly IMapper _mapper;

        public MessageRepository(DataContext context, IMapper mapper)
        {
            this._context = context;
            this._mapper = mapper;
        }

        public void AddMessage(Message message)
        {
            _context.Message.Add(message);
        }

        public void DeleteMessage(Message message)
        {
            _context.Message.Remove(message);
        }

        public async Task<Message> GetMessage(int id)
        {
           return await _context.Message.FindAsync(id);
        }

        public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var query = _context.Message
            .OrderByDescending(x => x.MessageSent)
            .AsQueryable();

            query = messageParams.Container switch
            {
                "Inbox" => query.Where(u => u.RecipientUsername == messageParams.Username && u.RecepientDeleted == false),
                "Outbox" => query.Where(u => u.SenderUsername == messageParams.Username && u.SenderDeleted == false),
                _ => query.Where(u => u.RecipientUsername == messageParams.Username && u.RecepientDeleted == false && u.DateRead == null)
            };

            var messages = query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider);

            return await PagedList<MessageDto>
                    .CreateAsync(messages,messageParams.PageNumber, messageParams.PageSize);
        }

        public async Task<IEnumerable<MessageDto>> GetMessageThread(string CurrentUsername, string RecipientUsername)
        {
            var messages = await _context.Message
                .Include(u => u.Sender).ThenInclude(p => p.Photos)
                .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .Where(
                    m => m.RecipientUsername == CurrentUsername && m.RecepientDeleted == false &&
                    m.SenderUsername == RecipientUsername ||
                    m.RecipientUsername == RecipientUsername && m.SenderDeleted == false &&
                    m.SenderUsername == CurrentUsername
                ).OrderBy(m => m.MessageSent).ToListAsync();

            var unreadMessages = messages.Where(m => m.DateRead == null && m.RecipientUsername == CurrentUsername).ToList();

            if(unreadMessages.Any()){

                foreach(var message in unreadMessages){
                    message.DateRead = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
            }    

            return _mapper.Map<IEnumerable<MessageDto>>(messages);
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}