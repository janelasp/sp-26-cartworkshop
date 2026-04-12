import { test, expect } from "@playwright/test";

test("register, add to cart, checkout, confirmation, order history", async ({ page }) => {
  const username = `qa_${Date.now()}`;
  const password = "Password123!";

  // 1) Register (auto-login)
  await page.goto("/register");
  await page.getByLabel("Username").fill(username);
  await page.getByTestId("register-password").fill(password);
  await page.getByTestId("register-confirm-password").fill(password);
  await page.getByRole("button", { name: "Register" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByLabel("Logged in user")).toHaveText(username);

  // 2) Browse products
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

  // 3) Add item to cart
  await page
    .getByRole("button", { name: /Add Wireless Headphones to cart/i })
    .click();
  await page.getByRole("button", { name: "Open shopping cart" }).click();

  const cartSidebar = page.getByRole("complementary", { name: "Shopping cart" });
  await expect(cartSidebar.getByText("Wireless Headphones")).toBeVisible();

  // 4) Checkout and place order
  await cartSidebar.getByRole("link", { name: "Proceed to checkout" }).click();
  await expect(page).toHaveURL("/cart");

  await page.getByLabel(/Full Name/i).fill("QA User");
  await page.getByLabel(/Email/i).fill("qa@example.com");
  await page.getByLabel(/Shipping Address/i).fill("123 Main St");
  await page.getByLabel(/City/i).fill("Columbus");
  await page.getByLabel(/State/i).selectOption("OH");
  await page.getByLabel(/Zip Code/i).fill("43004");

  await page.getByRole("button", { name: /Place order/i }).click();

  // 5) Verify confirmation
  await expect(page.getByRole("heading", { name: "Order Confirmation" })).toBeVisible();
  await expect(page.getByTestId("order-confirmation")).toContainText(
    /Order placed successfully/i
  );

  // 6) Verify order listed in history
  await page.getByRole("link", { name: /Go to order history/i }).click();
  await expect(page.getByRole("heading", { name: "Order History" })).toBeVisible();
  await expect(page.getByTestId("order-history-list")).toBeVisible();
  await expect(page.getByTestId("order-history-item").first()).toContainText(
    "Wireless Headphones"
  );
});
