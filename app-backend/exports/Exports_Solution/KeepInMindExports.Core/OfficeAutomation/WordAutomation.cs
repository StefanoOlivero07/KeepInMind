using System.Text.RegularExpressions;
using Xceed.Document.NET;
using Xceed.Words.NET;

namespace KeepInMindExports.Core.OfficeAutomation
{
    public static class WordAutomation
    {
        public static byte[] GetTasksDocxBytes(List<Models.Task> tasks, string templatePath, bool completedTasks)
        {
            using var memoryStream = new MemoryStream();
            using (var document = DocX.Load(templatePath))
            {
                /*
                ---------- User and document informations ----------
                */
                ReplaceSimpleTextInDocument(document, "{userName}", tasks[0].UserName);
                ReplaceSimpleTextInDocument(document, "{documentCreation}", DateTime.Now.ToString("dd-MM-yyyy"));

                /*
                ---------- Tasks informations ----------
                */
                Table table = document.Tables[0];
                Row newRow;

                foreach (var task in tasks)
                {
                    newRow = table.InsertRow();
                    newRow.Cells[0].Paragraphs[0].Append(task.Title).Alignment = Alignment.center;
                    newRow.Cells[1].Paragraphs[0].Append(task.Description).Alignment = Alignment.center;
                    newRow.Cells[2].Paragraphs[0].Append(task.Category).Alignment = Alignment.center;
                    newRow.Cells[3].Paragraphs[0].Append(task.Created).Alignment = Alignment.center;
                    if (completedTasks)
                        newRow.Cells[4].Paragraphs[0].Append(task.CompletedAt).Alignment = Alignment.center;
                    else
                        newRow.Cells[4].Paragraphs[0].Append(task.Expiration).Alignment = Alignment.center;
                    newRow.Cells[5].Paragraphs[0].Append(task.Notes).Alignment = Alignment.center;
                    
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
