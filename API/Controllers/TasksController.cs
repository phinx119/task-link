using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly TaskLinkDBContext context;

        public TasksController(TaskLinkDBContext _context)
        {
            this.context = _context;
        }

        // GET: get task list
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // get list order by priority
            var tasks = await context.Tasks
                .OrderBy(t => t.Priority == "High" ? 1 :
                              t.Priority == "Medium" ? 2 :
                              t.Priority == "Low" ? 3 : 4
                              ).ToListAsync();

            return Ok(tasks);
        }

        // GET: get task by id
        [HttpGet("TaskId/{taskId}")]
        public async Task<IActionResult> GetById(int taskId)
        {
            // get task by id
            var task = await context.Tasks.FindAsync(taskId);

            return Ok(task);
        }

        // GET: get task list by time unit (day, week, month, all)
        [HttpGet("{userId}/{timeUnit}")]
        public async Task<IActionResult> GetListByTimeUnit(int userId, string timeUnit)
        {
            var currentDate = DateTime.Now;

            // create query get by id
            IQueryable<Models.Task> query = context.Tasks.Where(t => t.List.UserId == userId && !t.Status.Equals("Completed"));

            // add get by time unit (day, week, month, all) to query
            switch (timeUnit.ToLower())
            {
                case "day":
                    query = query.Where(t => t.DueDate.Date == currentDate.Date);
                    break;
                case "week":
                    var startOfWeek = currentDate.Date.AddDays(-(int)currentDate.DayOfWeek);
                    var endOfWeek = startOfWeek.AddDays(7).AddTicks(-1);
                    query = query.Where(t => t.DueDate >= startOfWeek && t.DueDate <= endOfWeek);
                    break;
                case "month":
                    query = query.Where(t => t.DueDate.Month == currentDate.Month && t.DueDate.Year == currentDate.Year);
                    break;
                case "all":
                    // No additional filter for all tasks.
                    break;
                default:
                    return BadRequest("Invalid time unit.");
            }

            // add order by priority to query
            query = query.OrderBy(t => t.Priority == "High" ? 1 :
                                       t.Priority == "Medium" ? 2 :
                                       t.Priority == "Low" ? 3 : 4);

            // get list with query
            var tasks = await query.ToListAsync();

            return Ok(tasks);
        }

        // GET: get list by task list id
        [HttpGet("ListId/{listId}")]
        public async Task<IActionResult> GetListByTaskList(int listId)
        {
            // get task list by list id
            var taskList = await context.TaskLists.FindAsync(listId);
            // check if task list not existing
            if (taskList == null)
            {
                return BadRequest("Task list not exist.");
            }

            // get list by list id
            var tasks = await context.Tasks.Where(t => t.ListId == taskList.ListId && !t.Status.Equals("Completed")).ToListAsync();

            return Ok(tasks);
        }

        // POST: create new task
        [HttpPost]
        public async Task<IActionResult> CreateNew([FromBody] TaskRequest taskRequest)
        {
            // get task list by list id
            var taskList = await context.TaskLists.FindAsync(taskRequest.ListId);
            // check if task list not exist
            if (taskList == null)
            {
                return BadRequest("Task list not exist.");
            }

            // get repeat by id
            var repeat = await context.Repeats.FindAsync(taskRequest.RepeatId);
            // check if repeat not exist
            if (repeat == null)
            {
                return BadRequest("Repeat not exist.");
            }

            // create new task
            var newTask = new Models.Task
            {
                ListId = taskRequest.ListId,
                Title = taskRequest.Title,
                Note = taskRequest.Note,
                DueDate = taskRequest.DueDate,
                RepeatId = taskRequest.RepeatId,
                Priority = taskRequest.Priority,
                Status = taskRequest.Status,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            // save new task
            context.Tasks.Add(newTask);
            await context.SaveChangesAsync();

            return Ok(taskList);
        }

        // PUT: update task detail by task id
        [HttpPut("{taskId}")]
        public async Task<IActionResult> Update(int taskId, [FromBody] TaskRequest taskRequest)
        {
            // get by task id
            var task = await context.Tasks.FindAsync(taskId);
            // check if task not exist
            if (task == null)
            {
                return BadRequest("Task not exist.");
            }

            // get task list by list id
            var taskList = await context.TaskLists.FindAsync(taskRequest.ListId);
            // check if task list not exist
            if (taskList == null)
            {
                return BadRequest("Task list not exist.");
            }

            // get repeat by id
            var repeat = await context.Repeats.FindAsync(taskRequest.RepeatId);
            // check if repeat not exist
            if (repeat == null)
            {
                return BadRequest("Repeat not exist.");
            }

            // update task
            task.ListId = taskRequest.ListId;
            task.Title = taskRequest.Title;
            task.Note = taskRequest.Note;
            task.DueDate = taskRequest.DueDate;
            task.RepeatId = taskRequest.RepeatId;
            task.Priority = taskRequest.Priority;
            task.Status = taskRequest.Status;
            task.UpdatedAt = DateTime.Now;

            // save change
            await context.SaveChangesAsync();

            return Ok(task);
        }

        // PUT: update task due date by task id
        [HttpPut("DueDate/{taskId}")]
        public async Task<IActionResult> UpdateDueDate(int taskId, string newDueDate)
        {
            // get by task id
            var task = await context.Tasks.FindAsync(taskId);
            // check if task not exist
            if (task == null)
            {
                return BadRequest("Task not exist.");
            }

            // update task            
            task.DueDate = DateTime.Parse(newDueDate);
            task.Status = task.RepeatId == 1 ? "Completed" : "In Progress";
            task.UpdatedAt = DateTime.Now;

            // save change
            await context.SaveChangesAsync();

            return Ok(task);
        }

        // DELETE: delete task
        [HttpDelete("{taskId}")]
        public async Task<IActionResult> Delete(int taskId)
        {
            // get by task id
            var task = await context.Tasks.FindAsync(taskId);
            // check if task not exist
            if (task == null)
            {
                return BadRequest("Task not exist.");
            }

            // remove task
            context.Remove(task);
            await context.SaveChangesAsync();

            return Ok(task);
        }
    }
}
