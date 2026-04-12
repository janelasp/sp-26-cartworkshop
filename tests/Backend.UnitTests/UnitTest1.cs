using System.Text.Json;
using backend.DTOs;
using backend.Middleware;
using backend.Validators;
using FluentValidation.TestHelper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;

namespace Backend.UnitTests;

public class ValidatorTests
{
    [Fact]
    public void AddToCartRequestValidator_ProductIdIsZero_HasExpectedErrorMessage()
    {
        var validator = new AddToCartRequestValidator();
        var model = new AddToCartRequest { ProductId = 0, Quantity = 1 };

        var result = validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.ProductId)
            .WithErrorMessage("ProductId must be greater than 0.");
        result.ShouldNotHaveValidationErrorFor(x => x.Quantity);
    }

    [Fact]
    public void AddToCartRequestValidator_QuantityIsTooHigh_HasExpectedErrorMessage()
    {
        var validator = new AddToCartRequestValidator();
        var model = new AddToCartRequest { ProductId = 1, Quantity = 100 };

        var result = validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Quantity)
            .WithErrorMessage("Quantity must be between 1 and 99.");
        result.ShouldNotHaveValidationErrorFor(x => x.ProductId);
    }

    [Fact]
    public void UpdateCartItemRequestValidator_QuantityIsZero_HasExpectedErrorMessage()
    {
        var validator = new UpdateCartItemRequestValidator();
        var model = new UpdateCartItemRequest { Quantity = 0 };

        var result = validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Quantity)
            .WithErrorMessage("Quantity must be between 1 and 99.");
    }
}

public class GlobalExceptionHandlerTests
{
    [Fact]
    public async Task TryHandleAsync_KeyNotFoundException_Writes404ProblemDetails()
    {
        var logger = NullLogger<GlobalExceptionHandler>.Instance;
        var handler = new GlobalExceptionHandler(logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Response.Body = new MemoryStream();

        var exception = new KeyNotFoundException("Missing cart.");

        var handled = await handler.TryHandleAsync(httpContext, exception, CancellationToken.None);

        Assert.True(handled);
        Assert.Equal(StatusCodes.Status404NotFound, httpContext.Response.StatusCode);

        httpContext.Response.Body.Position = 0;
        var payload = await JsonSerializer.DeserializeAsync<ProblemDetails>(
            httpContext.Response.Body,
            new JsonSerializerOptions(JsonSerializerDefaults.Web));

        Assert.NotNull(payload);
        Assert.Equal(StatusCodes.Status404NotFound, payload!.Status);
        Assert.Equal("Resource not found", payload.Title);
        Assert.Equal("Missing cart.", payload.Detail);
    }

    [Fact]
    public async Task TryHandleAsync_ArgumentException_Writes400ProblemDetails()
    {
        var logger = NullLogger<GlobalExceptionHandler>.Instance;
        var handler = new GlobalExceptionHandler(logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Response.Body = new MemoryStream();

        var exception = new ArgumentException("Bad input.");

        var handled = await handler.TryHandleAsync(httpContext, exception, CancellationToken.None);

        Assert.True(handled);
        Assert.Equal(StatusCodes.Status400BadRequest, httpContext.Response.StatusCode);

        httpContext.Response.Body.Position = 0;
        var payload = await JsonSerializer.DeserializeAsync<ProblemDetails>(
            httpContext.Response.Body,
            new JsonSerializerOptions(JsonSerializerDefaults.Web));

        Assert.NotNull(payload);
        Assert.Equal(StatusCodes.Status400BadRequest, payload!.Status);
        Assert.Equal("Invalid request", payload.Title);
        Assert.Equal("Bad input.", payload.Detail);
    }
}
