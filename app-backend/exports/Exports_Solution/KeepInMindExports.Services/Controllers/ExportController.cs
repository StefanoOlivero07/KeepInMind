using Microsoft.AspNetCore.Mvc;
using KeepInMindExports.Core.OfficeAutomation;

namespace KeepInMindExports.Services.Controllers
{
    [ApiController]
    [Route("/api/exports")]
    public class ExportController : ControllerBase
    {
        [HttpPost("completedTasks")]
        [Produces("application/vnd.openxmlformats-officedocument.wordprocessingml.document")]
        public IActionResult ExportCompletedTasks([FromBody] List<Core.Models.Task> tasks)
        {
            if (tasks == null || tasks.Count == 0)
                return BadRequest("The tasks' list is null");

            string templatePath = Path.Combine(AppContext.BaseDirectory, "Templates", "CompletedTasks.docx");

            Byte[] fileBytes = WordAutomation.GetTasksDocxBytes(tasks, templatePath , true);

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                $"{tasks[0].UserName}_CompletedTasks.docx"
            );
        }

        [HttpPost("notCompletedTasks")]
        [Produces("application/vnd.openxmlformats-officedocument.wordprocessingml.document")]
        public IActionResult ExportNotCompletedTasks([FromBody] List<Core.Models.Task> tasks)
        {
            if (tasks == null || tasks.Count == 0)
                return BadRequest("The tasks' list is null");

            string templatePath = Path.Combine(AppContext.BaseDirectory, "Templates", "NotCompletedTasks.docx");

            Byte[] fileBytes = WordAutomation.GetTasksDocxBytes(tasks, templatePath, false);

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                $"{tasks[0].UserName}_NotCompletedTasks.docx"
            );
        }
    }
}
