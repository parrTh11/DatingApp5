using API.Interfaces;
using AutoMapper;

namespace API.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        public UnitOfWork(DataContext context, IMapper mapper)
        {
            this._mapper = mapper;
            this._context = context;
        }

        public IUserRepository userRepository =>  new UserRepository(_context, _mapper);

        public IMessageRepository messageRepository =>  new MessageRepository(_context, _mapper);

        public ILikesRepository likesRepository =>  new LikesRepository(_context);

        public async Task<bool> Complete()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public bool hasChanges()
        {
            return _context.ChangeTracker.HasChanges();
        }
    }

}