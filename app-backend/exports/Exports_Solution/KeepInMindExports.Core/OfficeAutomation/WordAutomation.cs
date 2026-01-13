using KeepInMindExports.Core.Models;
using System.Text.RegularExpressions;
using Xceed.Document.NET;
using Xceed.Words.NET;

namespace KeepInMindExports.Core.OfficeAutomation
{
    public static class WordAutomation
    {
        public static byte[] GetTasksDocxBytes(List<Models.Task> tasks, User user, string templatePath, bool completedTasks)
        {
            using var memoryStream = new MemoryStream();
            using (var document = DocX.Load(templatePath))
            {
                /*
                ---------- User and document informations ----------
                */
                ReplaceSimpleTextInDocument(document, "{userName}", user.Name);
                ReplaceSimpleTextInDocument(document, "{userSurname}", user.Surname);
                ReplaceSimpleTextInDocument(document, "{userEmail}", user.Email);
                ReplaceSimpleTextInDocument(document, "{documentCreation}", new DateTime().ToString("dd-mm-yyyy"));

                /*
                ---------- Tasks informations ----------
                */
                Table table = document.Tables[0];
                Row newRow;

                foreach (var task in tasks)
                {
                    newRow = table.InsertRow();
                    newRow.Cells[0].Paragraphs[0].Append(task.Title);
                    newRow.Cells[1].Paragraphs[0].Append(task.Description);
                    newRow.Cells[2].Paragraphs[0].Append(task.Category);
                    newRow.Cells[3].Paragraphs[0].Append(task.Created);
                    if (completedTasks)
                        newRow.Cells[4].Paragraphs[0].Append(task.CompletedAt);
                    else
                        newRow.Cells[4].Paragraphs[0].Append(task.Expiration);
                    newRow.Cells[5].Paragraphs[0].Append(task.Notes);
                }

                document.SaveAs(memoryStream);
            }

            return memoryStream.ToArray();
        }

        private static void ReplaceSimpleTextInDocument(DocX document, string oldText, string? newText)
        {
            var options = new StringReplaceTextOptions
            {
                SearchValue = oldText,
                NewValue = newText ?? string.Empty,
                RegExOptions = RegexOptions.None,
                NewFormatting = new Formatting() { Bold = true, FontColor = Xceed.Drawing.Color.Black }
            };

            document.ReplaceText(options);
        }
    }
}
