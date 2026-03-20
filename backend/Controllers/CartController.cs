using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private const string CurrentUserId = "default-user";

    private readonly MarketplaceContext _context;

    public CartController(MarketplaceContext context)
    {
        _context = context;
    }

    // GET /api/cart
    [HttpGet]
    [ProducesResponseType(typeof(CartResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CartResponse>> GetCart()
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart is null)
        {
            return NotFound();
        }

        var response = new CartResponse
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = cart.Items.Select(i => new CartItemResponse
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                Price = i.Product.Price,
                Quantity = i.Quantity,
                LineTotal = i.Product.Price * i.Quantity
            }).ToList(),
            TotalItems = cart.Items.Sum(i => i.Quantity),
            Subtotal = cart.Items.Sum(i => i.Product.Price * i.Quantity),
            Total = cart.Items.Sum(i => i.Product.Price * i.Quantity),
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt
        };

        return Ok(response);
    }

    // POST /api/cart
    [HttpPost]
    [ProducesResponseType(typeof(CartItemResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CartItemResponse>> AddToCart([FromBody] AddToCartRequest request)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId);
        if (product is null)
        {
            return NotFound();
        }

        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart is null)
        {
            cart = new Cart
            {
                UserId = CurrentUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Items = new List<CartItem>()
            };

            _context.Carts.Add(cart);
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

        if (existingItem is not null)
        {
            existingItem.Quantity += request.Quantity;
        }
        else
        {
            var newItem = new CartItem
            {
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                Product = product
            };

            cart.Items.Add(newItem);
        }

        cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Reload the item with product to ensure navigation is populated
        var savedItem = await _context.CartItems
            .Include(i => i.Product)
            .Where(i => i.CartId == cart.Id && i.ProductId == request.ProductId)
            .OrderByDescending(i => i.Id)
            .FirstAsync();

        var itemResponse = MapCartItemToResponse(savedItem);

        return CreatedAtAction(nameof(GetCart), new { }, itemResponse);
    }

    // PUT /api/cart/{cartItemId}
    [HttpPut("{cartItemId}")]
    [ProducesResponseType(typeof(CartItemResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CartItemResponse>> UpdateCartItem(int cartItemId, [FromBody] UpdateCartItemRequest request)
    {
        var cartItem = await _context.CartItems
            .Include(i => i.Cart)
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == cartItemId);

        if (cartItem is null)
        {
            return NotFound();
        }

        if (cartItem.Cart.UserId != CurrentUserId)
        {
            return NotFound();
        }

        cartItem.Quantity = request.Quantity;
        cartItem.Cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = MapCartItemToResponse(cartItem);
        return Ok(response);
    }

    // DELETE /api/cart/{cartItemId}
    [HttpDelete("{cartItemId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveCartItem(int cartItemId)
    {
        var cartItem = await _context.CartItems
            .Include(i => i.Cart)
            .FirstOrDefaultAsync(i => i.Id == cartItemId);

        if (cartItem is null)
        {
            return NotFound();
        }

        if (cartItem.Cart.UserId != CurrentUserId)
        {
            return NotFound();
        }

        cartItem.Cart.UpdatedAt = DateTime.UtcNow;

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE /api/cart/clear
    [HttpDelete("clear")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ClearCart()
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart is null)
        {
            return NotFound();
        }

        if (cart.Items.Any())
        {
            _context.CartItems.RemoveRange(cart.Items);
        }

        cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static CartItemResponse MapCartItemToResponse(CartItem item)
    {
        var price = item.Product.Price;
        var lineTotal = price * item.Quantity;

        return new CartItemResponse
        {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductName = item.Product.Name,
            Price = price,
            ImageUrl = item.Product.ImageUrl,
            Quantity = item.Quantity,
            LineTotal = lineTotal
        };
    }
}
