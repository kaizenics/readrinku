import { expect, test } from "@playwright/test"

test("browse, save, read RTL chapter, and persist progress", async ({ page }) => {
  await page.goto("/browse")

  await expect(
    page.getByRole("heading", { name: "Browse manga" })
  ).toBeVisible()

  await page.getByPlaceholder("Search title, mood, or genre").fill("Letters")
  await expect(page).toHaveURL(/q=Letters/)

  await page.getByRole("link", { name: /Letters After Rain/ }).click()
  await expect(page).toHaveURL("/manga/letters-after-rain")

  await page.getByRole("combobox").first().click()
  await page.getByRole("option", { name: "Reading" }).click()

  await page.getByRole("link", { name: /Read chapter 1/i }).click()
  await expect(page).toHaveURL(/\/read\/letters-after-rain\/chapter-1-rain-route/)

  await page.getByRole("button", { name: "Next zone" }).click()
  await expect(page.getByText("Page 2 / 8")).toBeVisible()

  await page.reload()
  await expect(page.getByText("Page 2 / 8")).toBeVisible()

  await page.goto("/library")
  await expect(page.getByText("Letters After Rain")).toBeVisible()

  await page.goto("/history")
  await expect(page.getByText("Letters After Rain")).toBeVisible()
})

test("register, persist dark theme, logout, and login again", async ({ page }) => {
  const email = `reader-${Date.now()}@example.com`

  await page.goto("/register")
  await page.getByLabel("Display name").fill("Aster Reader")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill("placeholder-pass")
  await page.getByRole("button", { name: "Register" }).click()

  await expect(page).toHaveURL("/")
  await expect(page.getByText("Aster Reader")).toBeVisible()

  await page.goto("/settings")
  await page.locator("#theme").click()
  await page.getByRole("option", { name: "Dark" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)

  await page.reload()
  await expect(page.locator("html")).toHaveClass(/dark/)

  await page.getByRole("button", { name: /Logout/i }).click()
  await expect(page.getByRole("button", { name: /Light|Dark/i })).toBeVisible()

  await page.goto("/login")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill("placeholder-pass")
  await page.getByRole("button", { name: "Login" }).click()

  await expect(page).toHaveURL("/")
  await expect(page.getByText("Aster Reader")).toBeVisible()
})

test("LTR reader follows standard right-arrow navigation", async ({ page }) => {
  await page.goto("/read/rooftop-season/chapter-12-june-wind")

  await expect(page.getByText("Page 1 / 6")).toBeVisible()

  await page.keyboard.press("ArrowRight")
  await expect(page.getByText("Page 2 / 6")).toBeVisible()

  await page.keyboard.press("ArrowLeft")
  await expect(page.getByText("Page 1 / 6")).toBeVisible()
})
