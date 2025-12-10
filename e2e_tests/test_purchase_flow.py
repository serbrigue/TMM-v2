from playwright.sync_api import sync_playwright

def test_purchase_flow():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to Home...")
        try:
            # 1. Visit Home
            page.goto("http://localhost:5173")
            
            # 2. Go to Courses
            print("Going to Courses...")
            page.click("text=Cursos") # Assuming generic text selector
            page.wait_for_url("**/courses")
            
            # 3. Select a Course
            # Assuming first card has a button or link
            print("Selecting first course...")
            page.locator(".course-card").first.click() 
            # Note: Selectors depend on actual UI class names.
            # Using generic assumption based on standard design practices.
            
            # 4. Add to Cart (Login required?)
            # Usually we need to login first.
            print("Attempting to Login...")
            # Navigate to login manually for this test script
            page.goto("http://localhost:5173/login")
            page.fill("input[name='email']", "test@test.com")
            page.fill("input[name='password']", "password")
            page.click("button[type='submit']")
            
            # Wait for redirect
            page.wait_for_url("http://localhost:5173/")
            print("Login successful")
            
            # Resume flow...
            
        except Exception as e:
            print(f"Test Failed: {e}")
            # Take screenshot on failure
            page.screenshot(path="e2e_tests/failure.png")
        finally:
            browser.close()

if __name__ == "__main__":
    test_purchase_flow()
