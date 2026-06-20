# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: readrinku.spec.ts >> browse, save, read RTL chapter, and persist progress
- Location: tests\readrinku.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:3100/browse", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - link "ReadRinku Quiet manga reading" [ref=e6] [cursor=pointer]:
            - /url: /
            - img [ref=e8]
            - generic [ref=e10]:
              - generic [ref=e11]: ReadRinku
              - generic [ref=e12]: Quiet manga reading
          - navigation [ref=e13]:
            - link "Home" [ref=e14] [cursor=pointer]:
              - /url: /
            - link "Browse" [ref=e15] [cursor=pointer]:
              - /url: /browse
            - link "Library" [ref=e16] [cursor=pointer]:
              - /url: /library
            - link "History" [ref=e17] [cursor=pointer]:
              - /url: /history
        - generic [ref=e18]:
          - button "Switch to dark mode" [ref=e19]:
            - img
            - generic [ref=e20]: Dark
          - generic [ref=e21]:
            - link "Login" [ref=e22] [cursor=pointer]:
              - /url: /login
              - img
              - text: Login
            - link "Register" [ref=e23] [cursor=pointer]:
              - /url: /register
      - generic [ref=e25]:
        - generic [ref=e26]: Minimal UI, saved progress, and placeholder-first reading flow.
        - generic [ref=e27]: 5 core routes
    - main [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]:
          - heading "Browse manga" [level=1] [ref=e31]
          - paragraph [ref=e32]: Search, sort, and filter the placeholder catalog while keeping everything in URL params.
        - generic [ref=e33]:
          - generic [ref=e34]:
            - group [ref=e35]:
              - group [ref=e36]:
                - img [ref=e37]
              - textbox "Search title, mood, or genre" [ref=e39]
            - combobox [ref=e40]:
              - img
            - combobox [ref=e41]
            - combobox [ref=e42]:
              - img
            - combobox [ref=e43]
            - combobox [ref=e44]:
              - img
            - combobox [ref=e45]
            - combobox [ref=e46]:
              - img
            - combobox [ref=e47]
          - paragraph [ref=e48]: Filters stay in the URL for easy sharing.
        - generic [ref=e49]:
          - generic [ref=e50]:
            - heading "8 results" [level=2] [ref=e51]
            - paragraph [ref=e52]: This list is server-rendered from fixture data so the backend can drop in later.
          - generic [ref=e53]:
            - generic [ref=e54]:
              - link "Eleven Points Ongoing Everyone Eleven Points Every match is short, but growing up around the table never is." [ref=e58] [cursor=pointer]:
                - /url: /manga/eleven-points
                - img "Eleven Points" [ref=e61]
                - generic [ref=e62]:
                  - generic [ref=e63]:
                    - generic [ref=e64]: Ongoing
                    - generic [ref=e65]: Everyone
                  - generic [ref=e66]: Eleven Points
                  - paragraph [ref=e67]: Every match is short, but growing up around the table never is.
              - generic [ref=e69]:
                - generic [ref=e70]: Sports
                - generic [ref=e71]: Drama
              - generic [ref=e72]:
                - generic [ref=e73]: Ch. 31 latest
                - link "Open" [ref=e74] [cursor=pointer]:
                  - /url: /manga/eleven-points
                  - img [ref=e75]
                  - text: Open
                  - img [ref=e77]
            - generic [ref=e79]:
              - link "Letters After Rain Ongoing Teen Letters After Rain A courier keeps delivering messages that arrive one season too late." [ref=e83] [cursor=pointer]:
                - /url: /manga/letters-after-rain
                - img "Letters After Rain" [ref=e86]
                - generic [ref=e87]:
                  - generic [ref=e88]:
                    - generic [ref=e89]: Ongoing
                    - generic [ref=e90]: Teen
                  - generic [ref=e91]: Letters After Rain
                  - paragraph [ref=e92]: A courier keeps delivering messages that arrive one season too late.
              - generic [ref=e94]:
                - generic [ref=e95]: Drama
                - generic [ref=e96]: Slice of Life
                - generic [ref=e97]: Mystery
              - generic [ref=e98]:
                - generic [ref=e99]: Ch. 1 latest
                - link "Open" [ref=e100] [cursor=pointer]:
                  - /url: /manga/letters-after-rain
                  - img [ref=e101]
                  - text: Open
                  - img [ref=e103]
            - generic [ref=e105]:
              - link "Rooftop Season Ongoing Everyone Rooftop Season A quiet garden above the city becomes the place where everyone says the hard thing." [ref=e109] [cursor=pointer]:
                - /url: /manga/rooftop-season
                - img "Rooftop Season" [ref=e112]
                - generic [ref=e113]:
                  - generic [ref=e114]:
                    - generic [ref=e115]: Ongoing
                    - generic [ref=e116]: Everyone
                  - generic [ref=e117]: Rooftop Season
                  - paragraph [ref=e118]: A quiet garden above the city becomes the place where everyone says the hard thing.
              - generic [ref=e120]:
                - generic [ref=e121]: Romance
                - generic [ref=e122]: Slice of Life
              - generic [ref=e123]:
                - generic [ref=e124]: Ch. 12 latest
                - link "Open" [ref=e125] [cursor=pointer]:
                  - /url: /manga/rooftop-season
                  - img [ref=e126]
                  - text: Open
                  - img [ref=e128]
            - generic [ref=e130]:
              - link "Saltwater Noodles Ongoing Everyone Saltwater Noodles A seaside ramen counter keeps a family stitched together after sunset." [ref=e134] [cursor=pointer]:
                - /url: /manga/saltwater-noodles
                - img "Saltwater Noodles" [ref=e137]
                - generic [ref=e138]:
                  - generic [ref=e139]:
                    - generic [ref=e140]: Ongoing
                    - generic [ref=e141]: Everyone
                  - generic [ref=e142]: Saltwater Noodles
                  - paragraph [ref=e143]: A seaside ramen counter keeps a family stitched together after sunset.
              - generic [ref=e145]:
                - generic [ref=e146]: Food
                - generic [ref=e147]: Slice of Life
              - generic [ref=e148]:
                - generic [ref=e149]: Ch. 15 latest
                - link "Open" [ref=e150] [cursor=pointer]:
                  - /url: /manga/saltwater-noodles
                  - img [ref=e151]
                  - text: Open
                  - img [ref=e153]
            - generic [ref=e155]:
              - link "The Quiet Observatory Ongoing Everyone The Quiet Observatory A small mountain observatory repairs telescopes and unsettled futures." [ref=e159] [cursor=pointer]:
                - /url: /manga/the-quiet-observatory
                - img "The Quiet Observatory" [ref=e162]
                - generic [ref=e163]:
                  - generic [ref=e164]:
                    - generic [ref=e165]: Ongoing
                    - generic [ref=e166]: Everyone
                  - generic [ref=e167]: The Quiet Observatory
                  - paragraph [ref=e168]: A small mountain observatory repairs telescopes and unsettled futures.
              - generic [ref=e170]:
                - generic [ref=e171]: Drama
                - generic [ref=e172]: Sci-Fi
              - generic [ref=e173]:
                - generic [ref=e174]: Ch. 9 latest
                - link "Open" [ref=e175] [cursor=pointer]:
                  - /url: /manga/the-quiet-observatory
                  - img [ref=e176]
                  - text: Open
                  - img [ref=e178]
            - generic [ref=e180]:
              - link "Atlas of the Drowned Kingdom Hiatus Teen Atlas of the Drowned Kingdom A mapmaker sketches a country that resurfaces one tide at a time." [ref=e184] [cursor=pointer]:
                - /url: /manga/atlas-of-the-drowned-kingdom
                - img "Atlas of the Drowned Kingdom" [ref=e187]
                - generic [ref=e188]:
                  - generic [ref=e189]:
                    - generic [ref=e190]: Hiatus
                    - generic [ref=e191]: Teen
                  - generic [ref=e192]: Atlas of the Drowned Kingdom
                  - paragraph [ref=e193]: A mapmaker sketches a country that resurfaces one tide at a time.
              - generic [ref=e195]:
                - generic [ref=e196]: Adventure
                - generic [ref=e197]: Fantasy
              - generic [ref=e198]:
                - generic [ref=e199]: Ch. 26 latest
                - link "Open" [ref=e200] [cursor=pointer]:
                  - /url: /manga/atlas-of-the-drowned-kingdom
                  - img [ref=e201]
                  - text: Open
                  - img [ref=e203]
            - generic [ref=e205]:
              - link "The Storm Index Completed Teen The Storm Index A librarian classifies weather the way other people classify grief." [ref=e209] [cursor=pointer]:
                - /url: /manga/the-storm-index
                - img "The Storm Index" [ref=e212]
                - generic [ref=e213]:
                  - generic [ref=e214]:
                    - generic [ref=e215]: Completed
                    - generic [ref=e216]: Teen
                  - generic [ref=e217]: The Storm Index
                  - paragraph [ref=e218]: A librarian classifies weather the way other people classify grief.
              - generic [ref=e220]:
                - generic [ref=e221]: Mystery
                - generic [ref=e222]: Drama
              - generic [ref=e223]:
                - generic [ref=e224]: Ch. 18 latest
                - link "Open" [ref=e225] [cursor=pointer]:
                  - /url: /manga/the-storm-index
                  - img [ref=e226]
                  - text: Open
                  - img [ref=e228]
            - generic [ref=e230]:
              - link "A Thousand Paper Wings Completed Everyone A Thousand Paper Wings A child follows a trail of cranes into a forest that listens back." [ref=e234] [cursor=pointer]:
                - /url: /manga/a-thousand-paper-wings
                - img "A Thousand Paper Wings" [ref=e237]
                - generic [ref=e238]:
                  - generic [ref=e239]:
                    - generic [ref=e240]: Completed
                    - generic [ref=e241]: Everyone
                  - generic [ref=e242]: A Thousand Paper Wings
                  - paragraph [ref=e243]: A child follows a trail of cranes into a forest that listens back.
              - generic [ref=e245]:
                - generic [ref=e246]: Fantasy
                - generic [ref=e247]: Coming of Age
              - generic [ref=e248]:
                - generic [ref=e249]: Ch. 10 latest
                - link "Open" [ref=e250] [cursor=pointer]:
                  - /url: /manga/a-thousand-paper-wings
                  - img [ref=e251]
                  - text: Open
                  - img [ref=e253]
    - contentinfo [ref=e255]:
      - generic [ref=e256]:
        - paragraph [ref=e257]: ReadRinku is a frontend-only prototype for manga discovery and reading.
        - paragraph [ref=e258]: Built with the installed Mira preset, dark mode, and placeholder assets.
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test"
  2  | 
  3  | test("browse, save, read RTL chapter, and persist progress", async ({ page }) => {
> 4  |   await page.goto("/browse")
     |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
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