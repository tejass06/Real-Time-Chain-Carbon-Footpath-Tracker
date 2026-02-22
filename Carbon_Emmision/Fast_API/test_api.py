import requests

# Test endpoints
base_url = "http://localhost:8000"

# Test get trucks
print("Testing GET /trucks...")
response = requests.get(f"{base_url}/trucks")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}\n")

# Test get specific truck
print("Testing GET /trucks/123...")
response = requests.get(f"{base_url}/trucks/123")
print(f"Status: {response.status_code}")
if response.status_code == 200:
    print(f"Response: {response.json()}\n")
else:
    print(f"Error: {response.text}\n")

# Test start tracking
print("Testing POST /trucks/123/start-tracking...")
response = requests.post(f"{base_url}/trucks/123/start-tracking")
print(f"Status: {response.status_code}")
if response.status_code == 200:
    print(f"Response: {response.json()}\n")
else:
    print(f"Error: {response.text}\n")

print("✅ All tests completed")
