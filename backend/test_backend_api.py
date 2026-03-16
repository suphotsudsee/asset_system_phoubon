"""
Test backend API with MySQL
"""

import asyncio
import httpx

async def test_api():
    """Test backend API endpoints"""
    base_url = 'http://localhost:8000/api/v1'
    
    try:
        async with httpx.AsyncClient() as client:
            # Test login
            print("Testing login...")
            print(f"POST {base_url}/auth/login")
            print("Data: username=admin, password=admin123")
            
            response = await client.post(f'{base_url}/auth/login', data={
                'username': 'admin',
                'password': 'admin123'
            })
            
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            
            if response.status_code == 200:
                token = response.json().get('access_token')
                print(f"Login successful! Token: {token[:20]}...")
                
                # Test get assets
                print("\nTesting GET /assets...")
                headers = {'Authorization': f'Bearer {token}'}
                response = await client.get(f'{base_url}/assets', headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"Assets: {len(data.get('items', []))} items")
                    if 'items' in data and len(data['items']) > 0:
                        print(f"First asset: {data['items'][0]['name']}")
                else:
                    print(f"Error: {response.status_code}")
                    print(response.text)
            else:
                print(f"Login failed: {response.status_code}")
                print(response.text)
        
        print("\nAPI test completed!")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(test_api())
