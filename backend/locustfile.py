from locust import HttpUser, task, between
import random

class TMMUser(HttpUser):
    wait_time = between(1, 4)
    token = None

    def on_start(self):
        # Login to get token
        response = self.client.post("/api/token/", json={"username": "loadtest", "password": "password"})
        if response.status_code == 200:
            self.token = response.json()["access"]
        
    @task(3)
    def view_catalog(self):
        self.client.get("/api/public/cursos/")
        self.client.get("/api/public/talleres/")

    @task(1)
    def view_workshop_detail(self):
        # Assuming some IDs exist
        taller_id = random.randint(1, 5)
        self.client.get(f"/api/public/talleres/{taller_id}/")

    @task(1)
    def attempt_checkout(self):
        if not self.token: return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        # Add to cart / checkout
        # This is a WRITE operation, putting load on DB
        self.client.post("/api/checkout/", json={
            "items": [{"type": "taller", "id": 1}]
        }, headers=headers)
