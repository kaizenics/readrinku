# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: readrinku.spec.ts >> register, persist dark theme, logout, and login again
- Location: tests\readrinku.spec.ts:35:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('Display name')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]: Register
      - paragraph [ref=e7]: Create a local-only demo profile. No OAuth and no passwords stored.
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - group [ref=e11]:
            - generic [ref=e12]: Display name
            - group [ref=e14]:
              - textbox "Display name" [ref=e15]:
                - /placeholder: How should we address you?
          - group [ref=e16]:
            - generic [ref=e17]: Email
            - group [ref=e19]:
              - textbox "Email" [ref=e20]:
                - /placeholder: reader@example.com
          - group [ref=e21]:
            - generic [ref=e22]: Password
            - generic [ref=e23]:
              - group [ref=e24]:
                - textbox "Password" [ref=e25]:
                  - /placeholder: Enter your password
                - group [ref=e26]:
                  - button "Show password" [ref=e27]:
                    - img
              - paragraph [ref=e28]: Passwords are not stored. They only unlock a local demo session.
        - generic [ref=e29]:
          - button "Register" [ref=e30]
          - paragraph [ref=e31]:
            - text: Already have an account?
            - link "Login" [ref=e32] [cursor=pointer]:
              - /url: /login
      - paragraph [ref=e33]:
        - link "Return home" [ref=e34] [cursor=pointer]:
          - /url: /
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test"
  2  | 
  3  | test("browse, save, read RTL chapter, and persist progress", async ({ page }) => {
  4  |   await page.goto("/browse")
  5  | 
  6  |   await expect(
  7  |     page.getByRole("heading", { name: "Browse manga" })
  8  |   ).toBeVisible()
  9  | 
  10 |   await page.getByPlaceholder("Search title, mood, or genre").fill("Letters")
  11 |   await expect(page).toHaveURL(/q=Letters/)
  12 | 
  13 |   await page.getByRole("link", { name: /Letters After Rain/ }).click()
  14 |   await expect(page).toHaveURL("/manga/letters-after-rain")
  15 | 
  16 |   await page.getByRole("combobox").first().click()
  17 |   await page.getByRole("option", { name: "Reading" }).click()
  18 | 
  19 |   await page.getByRole("link", { name: /Read chapter 1/i }).click()
  20 |   await expect(page).toHaveURL(/\/read\/letters-after-rain\/chapter-1-rain-route/)
  21 | 
  22 |   await page.getByRole("button", { name: "Next zone" }).click()
  23 |   await expect(page.getByText("Page 2 / 8")).toBeVisible()
  24 | 
  25 |   await page.reload()
  26 |   await expect(page.getByText("Page 2 / 8")).toBeVisible()
  27 | 
  28 |   await page.goto("/library")
  29 |   await expect(page.getByText("Letters After Rain")).toBeVisible()
  30 | 
  31 |   await page.goto("/history")
  32 |   await expect(page.getByText("Letters After Rain")).toBeVisible()
  33 | })
  34 | 
  35 | test("register, persist dark theme, logout, and login again", async ({ page }) => {
  36 |   const email = `reader-${Date.now()}@example.com`
  37 | 
  38 |   await page.goto("/register")
> 39 |   await page.getByLabel("Display name").fill("Aster Reader")
     |                                         ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  40 |   await page.getByLabel("Email").fill(email)
  41 |   await page.getByLabel("Password").fill("placeholder-pass")
  42 |   await page.getByRole("button", { name: "Register" }).click()
  43 | 
  44 |   await expect(page).toHaveURL("/")
  45 |   await expect(page.getByText("Aster Reader")).toBeVisible()
  46 | 
  47 |   await page.goto("/settings")
  48 |   await page.locator("#theme").click()
  49 |   await page.getByRole("option", { name: "Dark" }).click()
  50 |   await expect(page.locator("html")).toHaveClass(/dark/)
  51 | 
  52 |   await page.reload()
  53 |   await expect(page.locator("html")).toHaveClass(/dark/)
  54 | 
  55 |   await page.getByRole("button", { name: /Logout/i }).click()
  56 |   await expect(page.getByRole("button", { name: /Light|Dark/i })).toBeVisible()
  57 | 
  58 |   await page.goto("/login")
  59 |   await page.getByLabel("Email").fill(email)
  60 |   await page.getByLabel("Password").fill("placeholder-pass")
  61 |   await page.getByRole("button", { name: "Login" }).click()
  62 | 
  63 |   await expect(page).toHaveURL("/")
  64 |   await expect(page.getByText("Aster Reader")).toBeVisible()
  65 | })
  66 | 
  67 | test("LTR reader follows standard right-arrow navigation", async ({ page }) => {
  68 |   await page.goto("/read/rooftop-season/chapter-12-june-wind")
  69 | 
  70 |   await expect(page.getByText("Page 1 / 6")).toBeVisible()
  71 | 
  72 |   await page.keyboard.press("ArrowRight")
  73 |   await expect(page.getByText("Page 2 / 6")).toBeVisible()
  74 | 
  75 |   await page.keyboard.press("ArrowLeft")
  76 |   await expect(page.getByText("Page 1 / 6")).toBeVisible()
  77 | })
  78 | 
```