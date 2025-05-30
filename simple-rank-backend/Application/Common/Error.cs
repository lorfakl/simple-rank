﻿namespace simple_rank_backend.Application.Common
{
    public record Error(string Code, string Message)
    {
        public int HttpStatusCode { get; init; } = 400; // Default to Bad Request
        public Exception? SourceException { get; init; } = null!; // Optional exception for more context
        public Exception? InnerException { get; init; } = null!; // Optional inner exception for more context

        public static readonly Error None = new(string.Empty, string.Empty);
        public static readonly Error NullValue = new("Error.NullValue", "A null value was provided unexpectedly.");
        public static readonly Error NotFound = new("Error.NotFound", "The requested resource was not found.");
        public static readonly Error ValidationFailed = new("Error.Validation", "One or more validation errors occurred.");
        public static readonly Error InvalidModelState = new("Request body is not valid", "One or more properties is null or otherwise invalid.");
        public static Error Custom(string code, string message) => new(code, message);

        public Error(string code, string message, int httpStatusCode, Exception? sourceException = null, Exception? innerException = null)
            : this(code, message)
        {
            HttpStatusCode = httpStatusCode;
            SourceException = sourceException;
            InnerException = innerException;
        }
    }
}
