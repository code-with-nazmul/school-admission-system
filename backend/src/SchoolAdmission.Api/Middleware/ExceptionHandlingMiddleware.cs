using System.Net;
using System.Text.Json;
using SchoolAdmission.Api.Exceptions;

namespace SchoolAdmission.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate _next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        this._next = _next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.BadRequest;
        var errorType = "Bad Request";
        var message = exception.Message;

        switch (exception)
        {
            case ValidationException:
                statusCode = HttpStatusCode.BadRequest;
                errorType = "Validation Error";
                break;

            case NotFoundException:
                statusCode = HttpStatusCode.NotFound;
                errorType = "Not Found";
                break;

            case ConflictException:
                statusCode = HttpStatusCode.Conflict;
                errorType = "Conflict";
                break;

            case ForbiddenException:
                statusCode = HttpStatusCode.Forbidden;
                errorType = "Forbidden";
                break;

            case BadHttpRequestException or JsonException or ArgumentException:
                statusCode = HttpStatusCode.BadRequest;
                errorType = "Invalid Input";
                message = "The request payload or format is invalid.";
                break;

            default:
                _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);
                statusCode = HttpStatusCode.BadRequest;
                errorType = "Invalid Request";
                message = exception.Message;
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            error = errorType,
            message
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}

