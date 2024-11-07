using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskListsController : ControllerBase
    {
        private readonly TaskLinkDBContext context;

        public TaskListsController(TaskLinkDBContext _context)
        {
            this.context = _context;
        }

        // GET: get task lists
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // get list
            var taskLists = await context.TaskLists.ToListAsync();

            return Ok(taskLists);
        }

        // GET: get list by user id
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetListByUserId(int userId)
        {
            // get list by user id
            var taskLists = await context.TaskLists
                .Where(l => l.UserId == userId)
                .ToListAsync();

            return Ok(taskLists);
        }

        // POST: create new task list
        [HttpPost("{userId}")]
        public async Task<IActionResult> CreateNew(int userId, string listName)
        {
            // get user by user id
            var user = await context.Users.FindAsync(userId);
            // check if user not existing
            if (user == null)
            {
                return BadRequest("User not exist.");
            }

            // get task list by user id and list name
            var taskList = await context.TaskLists
                .FirstOrDefaultAsync(l => l.UserId == user.UserId &&
                                     l.ListName.Equals(listName));
            // check if task list already exists
            if (taskList != null)
            {
                return BadRequest("Task list already exists.");
            }

            // create new task list
            var newTaskList = new TaskList
            {
                UserId = user.UserId,
                ListName = listName,
                CreatedAt = DateTime.Now
            };

            // save new task list
            context.TaskLists.Add(newTaskList);
            await context.SaveChangesAsync();

            return Ok(newTaskList);
        }

        // PUT: update list name
        [HttpPut("{userId}/{listId}")]
        public async Task<IActionResult> UpdateListName(int userId, int listId, string listName)
        {
            // get user by user id
            var user = await context.Users.FindAsync(userId);
            // check if user not existing
            if (user == null)
            {
                return BadRequest("User not exist.");
            }

            // get task list by list id
            var taskListById = await context.TaskLists.FindAsync(listId);
            // check if task list already exists
            if (taskListById == null)
            {
                return BadRequest("Task list not exist.");
            }

            // get task list by user id and list name
            var taskListByName = await context.TaskLists
                .FirstOrDefaultAsync(l => l.UserId == user.UserId &&
                                     l.ListName.Equals(listName));
            // check if task list already exists
            if (taskListByName != null)
            {
                return BadRequest("Task list name already exists.");
            }

            // update list name
            taskListById.ListName = listName;
            await context.SaveChangesAsync();

            return Ok(taskListById);
        }

        // DELETE: delete by id
        [HttpDelete("{userId}/{listId}")]
        public async Task<IActionResult> DeleteById(int userId, int listId)
        {
            // get task list by user id and list name
            var taskList = await context.TaskLists.FindAsync(listId);
            // check if task list already exists
            if (taskList == null)
            {
                return BadRequest("Task list not exist.");
            }
            // check if task list is default or not
            if (taskList.ListName.Equals("My Task"))
            {
                return BadRequest("Cannot delete this Task list.");
            }

            // get task list default by name
            var taskListDefault = await context.TaskLists
                .FirstOrDefaultAsync(l => l.UserId == userId &&
                                          l.ListName.Equals("My Task"));

            // get task by list id
            var tasks = await context.Tasks.Where(t => t.ListId == listId).ToListAsync();
            // move all tasks to default list
            foreach (var task in tasks)
            {
                task.ListId = taskListDefault.ListId;
                await context.SaveChangesAsync();
            }

            // remove list
            context.Remove(taskList);
            await context.SaveChangesAsync();

            return Ok("Delete task list successfully!");
        }
    }
}
