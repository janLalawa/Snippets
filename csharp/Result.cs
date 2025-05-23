using System;

namespace NAMESPACEHERE.Models
{
    public class Result<T>
    {
        public T Data { get; private set; }
        public bool Success { get; private set; }
        public string Message { get; private set; }
        public Exception Exception { get; private set; }

        public static Result<T> Ok(T data, string message = null)
        {
            return new Result<T>
            {
                Data = data,
                Success = true,
                Message = message
            };
        }

        public static Result<T> Fail(string message, Exception exception = null)
        {
            return new Result<T>
            {
                Success = false,
                Message = message,
                Exception = exception
            };
        }

        public static Result<T> PartialFail(T data, string message, Exception exception = null)
        {
            return new Result<T>
            {
                Data = data,
                Success = false,
                Message = message,
                Exception = exception
            };
        }

        public void Deconstruct(out bool success, out T data, out string message)
        {
            success = Success;
            data = Data;
            message = Message;
        }

        public bool IsSuccess()
        {
            return Success;
        }

        public bool IsFailure()
        {
            return !Success;
        }

        public void LogResult(ILoggerService logger, string context = null)
        {
            var prefix = string.IsNullOrEmpty(context) ? "" : $"[{context}] ";

            if (Success)
            {
                logger.Info($"{prefix}Success: {Message ?? "Operation completed successfully"}");
            }
            else
            {
                if (Exception != null)
                    logger.Error($"{prefix}Failed: {Message}", Exception);
                else
                    logger.Error($"{prefix}Failed: {Message}");
            }
        }

        public Result<TOut> Map<TOut>(Func<T, TOut> mapper)
        {
            if (Success) return Result<TOut>.Ok(mapper(Data), Message);

            return Result<TOut>.Fail(Message, Exception);
        }

        public Result<T> OnSuccess(Action<T> action)
        {
            if (Success && action != null) action(Data);
            return this;
        }

        public Result<T> OnFailure(Action<string, Exception> action)
        {
            if (!Success && action != null) action(Message, Exception);
            return this;
        }
    }
}