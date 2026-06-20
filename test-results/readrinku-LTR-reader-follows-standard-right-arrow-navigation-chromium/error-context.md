# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: readrinku.spec.ts >> LTR reader follows standard right-arrow navigation
- Location: tests\readrinku.spec.ts:67:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:3100/read/rooftop-season/chapter-12-june-wind", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic:
      - generic:
        - generic:
          - link "Back":
            - /url: /manga/rooftop-season
            - img
            - text: Back
          - generic:
            - paragraph: Rooftop Season
            - paragraph: "Chapter 12: June Wind"
        - generic:
          - generic: 17%
          - combobox:
            - img
          - combobox
          - combobox:
            - img
          - combobox
    - main [ref=e5]:
      - generic [ref=e6]:
        - article [ref=e7]:
          - img "Rooftop Season sample page 1" [ref=e8]
        - article [ref=e9]:
          - img "Rooftop Season sample page 2" [ref=e10]
        - article [ref=e11]:
          - img "Rooftop Season sample page 3" [ref=e12]
        - article [ref=e13]:
          - img "Rooftop Season sample page 4" [ref=e14]
        - article [ref=e15]:
          - img "Rooftop Season sample page 5" [ref=e16]
        - article [ref=e17]:
          - img "Rooftop Season sample page 6" [ref=e18]
    - generic [ref=e19]:
      - generic [ref=e21]:
        - generic [ref=e22]: Use title default
        - generic [ref=e23]: Page 1 / 6
      - generic [ref=e24]:
        - generic [ref=e25]:
          - button "Prev zone" [disabled]:
            - img
            - text: Prev zone
          - button "Next zone" [ref=e26]:
            - img
            - text: Next zone
        - link "Chapter list" [ref=e28] [cursor=pointer]:
          - /url: /manga/rooftop-season
          - img
          - text: Chapter list
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
  39 |   await page.getByLabel("Display name").fill("Aster Reader")
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
> 68 |   await page.goto("/read/rooftop-season/chapter-12-june-wind")
     |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
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