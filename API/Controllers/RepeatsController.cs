using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RepeatsController : ControllerBase
    {
        private readonly TaskLinkDBContext context;

        public RepeatsController(TaskLinkDBContext _context)
        {
            this.context = _context;
        }

        // GET: get repeat list
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // get list
            var repeats = await context.Repeats.ToListAsync();

            return Ok(repeats);
        }

        // GET: get repeat by id
        [HttpGet("{repeatId}")]
        public async Task<IActionResult> GetById(int repeatId)
        {
            // get repeat by id
            var repeat = await context.Repeats.FindAsync(repeatId);

            return Ok(repeat);
        }
    }
}
