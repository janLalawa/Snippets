using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;

namespace NAMESPACEHERE.Services
{
    public enum LogSeverity
    {
        Debug,
        Info,
        Warning,
        Error,
        Critical
    }

    public class LogEntry
    {
        public DateTime Timestamp { get; set; }
        public LogSeverity Level { get; set; }
        public string Message { get; set; }
        public Exception Exception { get; set; }
        public string SourceFile { get; set; }
        public int LineNumber { get; set; }
        public string MemberName { get; set; }

        public override string ToString()
        {
            var sb = new StringBuilder();
            sb.Append($"[{Timestamp:yyyy-MM-dd HH:mm:ss.fff}] [{Level}] ");

            if (!string.IsNullOrEmpty(SourceFile))
                try
                {
                    var fileName = Path.GetFileName(SourceFile);
                    sb.Append($"[{fileName}:{LineNumber} in {(string.IsNullOrEmpty(MemberName) ? "unknown" : MemberName)}] ");
                }
                catch
                {
                    sb.Append("[unknown source] ");
                }

            sb.Append(Message ?? "null");

            if (Exception == null) return sb.ToString();
            sb.Append($"\nException: {Exception.Message}");
            sb.Append($"\nStackTrace: {Exception.StackTrace}");

            return sb.ToString();
        }
    }

    public interface ILoggerService
    {
        void Log(LogSeverity level, string message,
            string sourceFile = "",
            int lineNumber = 0,
            string memberName = "");

        void Debug(string message,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "");

        void Info(string message,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "");

        void Warning(string message,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "");

        void Error(string message,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "");

        void Error(string message, Exception exception,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "");

        void Critical(string message,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "");

        void SetLogLevel(LogSeverity minimumLevel);
        IReadOnlyList<LogEntry> GetLogs();
        IReadOnlyList<LogEntry> GetLogs(LogSeverity minimumLevel);
        void ClearLogs();
        string GetFormattedLogs(LogSeverity minimumLevel = LogSeverity.Info);
    }

    public class LoggerService : ILoggerService
    {
        private readonly List<LogEntry> _logs = new List<LogEntry>();
        private LogSeverity _minimumLevel = LogSeverity.Info;
        private readonly PluginContext _pluginContext;
        public bool AutoTrace { get; set; } = true;
        
        public LoggerService(PluginContext pluginContext)
        {
            _pluginContext = pluginContext;
        }

        public void SetLogLevel(LogSeverity minimumLevel)
        {
            _minimumLevel = minimumLevel;
        }

        public void Log(LogSeverity level, string message,
            string sourceFile = "",
            int lineNumber = 0,
            string memberName = "")
        {
            if (level < _minimumLevel)
                return;

            var logEntry = new LogEntry
            {
                Timestamp = DateTime.Now,
                Level = level,
                Message = message,
                SourceFile = sourceFile,
                LineNumber = lineNumber,
                MemberName = memberName
            };

            lock (_logs)
            {
                _logs.Add(logEntry);
            }

            if (_pluginContext != null && AutoTrace)
            {
                _pluginContext.Trace(logEntry.ToString()); // For a Dynamics solution. Replace as needed
            }
        }

        public void Debug(string message,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "")
        {
            Log(LogSeverity.Debug, message, sourceFile, lineNumber, memberName);
        }

        public void Info(string message,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "")
        {
            Log(LogSeverity.Info, message, sourceFile, lineNumber, memberName);
        }

        public void Warning(string message,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "")
        {
            Log(LogSeverity.Warning, message, sourceFile, lineNumber, memberName);
        }

        public void Error(string message,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "")
        {
            Log(LogSeverity.Error, message, sourceFile, lineNumber, memberName);
        }

        public void Critical(string message,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "")
        {
            Log(LogSeverity.Critical, message, sourceFile, lineNumber, memberName);
        }

        public void Error(string message, Exception exception,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0,
            [CallerMemberName] string memberName = "")
        {
            if (LogSeverity.Error < _minimumLevel)
                return;

            var logEntry = new LogEntry
            {
                Timestamp = DateTime.Now,
                Level = LogSeverity.Error,
                Message = message,
                Exception = exception,
                SourceFile = sourceFile,
                LineNumber = lineNumber,
                MemberName = memberName
            };

            lock (_logs)
            {
                _logs.Add(logEntry);
            }
        }

        public IReadOnlyList<LogEntry> GetLogs()
        {
            lock (_logs)
            {
                return _logs.ToArray();
            }
        }

        public IReadOnlyList<LogEntry> GetLogs(LogSeverity minimumLevel)
        {
            lock (_logs)
            {
                return _logs.Where(log => log.Level >= minimumLevel).ToArray();
            }
        }
        
        public string GetFormattedLogs(LogSeverity minimumLevel = LogSeverity.Info)
        {
            var logs = GetLogs(minimumLevel);
            if (logs.Count == 0)
            {
                return "No logs recorded.";
            }

            var sb = new StringBuilder();
            sb.AppendLine($"=== Log Summary (Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}) ===");
            sb.AppendLine($"Total log entries: {logs.Count}");
    
            var logGroups = logs.GroupBy(l => l.Level).OrderByDescending(g => g.Key);
    
            foreach (var group in logGroups)
            {
                sb.AppendLine();
                sb.AppendLine($"--- {group.Key} Logs ({group.Count()} entries) ---");
        
                foreach (var entry in group.OrderBy(l => l.Timestamp))
                {
                    sb.AppendLine(entry.ToString());
                }
            }
    
            sb.AppendLine();
            sb.AppendLine("=== End of Log Summary ===");
    
            return sb.ToString();
        }


        public void ClearLogs()
        {
            lock (_logs)
            {
                _logs.Clear();
            }
        }
    }
}