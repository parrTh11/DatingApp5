using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class LikesController : BaseApiController
    {
        private readonly IUnitOfWork _uow;
        public LikesController(IUnitOfWork uow)
        {
            this._uow = uow;
        }

        [HttpPost("{username}")]
        public async Task<ActionResult> AddLike(string username){

            var sourceUserId = User.GetUserId();
            var likedUser = await _uow.userRepository.GetUserByUsernameAsync(username);
            var sourceUser = await _uow.likesRepository.GetUserWithLikes(sourceUserId);

            if(likedUser == null) return NotFound();

            if(sourceUser.UserName == username) return BadRequest("You can't like yourself!");

            var userlike = await _uow.likesRepository.GetUserLike(sourceUserId, likedUser.Id);

            if(userlike != null) return BadRequest("You have already liked this user!");

            userlike = new UserLike{
                SourceUserId = sourceUserId,
                TargetUesrId = likedUser.Id,
            };

            sourceUser.LikedUsers.Add(userlike);

            if(await _uow.Complete()) return Ok();

            return BadRequest("Failed to like user");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes([FromQuery]LikesParams likesParams){

            likesParams.UserId = User.GetUserId();

            var users = await _uow.likesRepository.GetUserLikes(likesParams);

            Response.AddPaginationHeader(new PagingationHeader(users.CurrentPage, users.PageSize,
            users.TotalCount, users.TotalPages));

            return Ok(users);
        }
    }
}