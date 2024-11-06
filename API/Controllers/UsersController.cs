using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly TaskLinkDBContext context;

        public UsersController(TaskLinkDBContext _context)
        {
            this.context = _context;
        }

        // GET: get user list
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // get list
            var users = await context.Users.ToListAsync();

            return Ok(users);
        }

        // GET: login by username and password
        [HttpGet("Login")]
        public async Task<IActionResult> Login(string username, string password)
        {
            // get user by username and password
            var user = await context.Users.FirstOrDefaultAsync(u => u.Username == username && u.Password == password);
            // check if user not existing
            if (user == null)
            {
                return BadRequest("Login fail.");
            }

            return Ok(user);
        }

        // POST: create account
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] UserRequest userRequest)
        {
            // get user by username
            var userByUsername = await context.Users.FirstOrDefaultAsync(u => u.Username == userRequest.Username);
            // check if user is existing
            if (userByUsername == null)
            {
                return BadRequest("User alreafy exist");
            }

            // create new user
            User newUser = new User
            {
                Username = userRequest.Username,
                Password = userRequest.Password,
                Email = userRequest.Email,
            };

            // add to database
            context.Users.Add(newUser);
            await context.SaveChangesAsync();

            // get user by username
            userByUsername = await context.Users.FirstOrDefaultAsync(u => u.Username == userRequest.Username);
            // check if user is existing
            if (userByUsername == null)
            {
                return BadRequest("User alreafy exist");
            }

            // create a default task list
            TaskList taskList = new TaskList
            {
                UserId = userByUsername.UserId,
                ListName = "My Task",
                CreatedAt = DateTime.Now
            };

            // add to database
            context.TaskLists.Add(taskList);
            await context.SaveChangesAsync();

            return Ok(newUser);
        }

        // PUT: update check time
        [HttpPut("CheckTime")]
        public async Task<IActionResult> UpdateCheckTime(int userId, int checkTime)
        {
            // get user by user id
            var user = await context.Users.FindAsync(userId);
            // check if user not existing
            if (user == null)
            {
                return BadRequest("User not exist.");
            }

            // update check time
            user.CheckTime = checkTime;
            await context.SaveChangesAsync();

            return Ok(user);
        }

        // PUT: update streak
        [HttpPut("Streak")]
        public async Task<IActionResult> UpdateStreak(int userId)
        {
            // get user by user id
            var user = await context.Users.FindAsync(userId);
            // check if user not existing
            if (user == null)
            {
                return BadRequest("User not exist.");
            }

            // get task list today
            var currentDate = DateTime.Now;
            var tasks = await context.Tasks
                .Where(t => t.List.UserId == userId &&
                            t.DueDate.Date == currentDate.Date
                ).ToListAsync();

            // update streak
            if (tasks.Count == 0)
            {
                user.Streak += 1;
                await context.SaveChangesAsync();
            }

            return Ok(user);
        }
    }
}
