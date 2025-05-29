using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using simple_rank_backend.Application.Services;
using simple_rank_backend.DTOs;
using Supabase.Gotrue.Exceptions;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace simple_rank_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {

        private readonly SupabaseService _supabaseService;
        private readonly IMemoryCache _cache;

        public UserController(SupabaseService supabaseService, IMemoryCache memoryCache)
        {
            _supabaseService = supabaseService;
            _cache = memoryCache;
        }

        [HttpPost("SignUpWithEmail")]
        public async Task<IActionResult> SignUpWithEmail([FromBody] SignUpWithEmailDto rq)
        {
            try
            {
                if(ModelState.IsValid)
                {
                    if(string.IsNullOrEmpty(rq.Email))
                    {
                        return BadRequest("Email is required");
                    }

                    if (string.IsNullOrEmpty(rq.Password))
                    {
                        return BadRequest("Password is required");
                    }

                    var session = await _supabaseService.Client.Auth.SignUp(email: rq.Email, password: rq.Password);
                    return StatusCode(201, session);    
                }
                else
                {
                    return BadRequest("Invalid model state");
                }
            }
            catch(GotrueException supaEx)
            {
                return StatusCode(supaEx.StatusCode, supaEx.Content);
            }
            catch (Exception ex)
            {
                
                return BadRequest($"Something went wrong {ex.Message}");
            }
        }


        [HttpPost("SignInWithEmail")]
        public async Task<IActionResult> SignInWithEmail([FromBody] SignUpWithEmailDto rq)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (string.IsNullOrEmpty(rq.Email))
                    {
                        return BadRequest("Email is required");
                    }

                    if (string.IsNullOrEmpty(rq.Password))
                    {
                        return BadRequest("Password is required");
                    }

                    var session = await _supabaseService.Client.Auth.SignIn(email: rq.Email, password: rq.Password);
                    return StatusCode(200, session);
                }
                else
                {
                    return BadRequest("Invalid model state");
                }
            }
            catch (GotrueException supaEx)
            {
                return StatusCode(supaEx.StatusCode, supaEx.Content);
            }
            catch (Exception ex)
            {

                return BadRequest($"Something went wrong {ex.Message}");
            }
        }

        // GET: api/<UserController>
        [HttpGet]
        public async Task<IEnumerable<string>> Get()
        {
            var client = await _supabaseService.GetClientAsync();  
            return new string[] { "value1", "value2" };
        }

        // GET api/<UserController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<UserController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<UserController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<UserController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
