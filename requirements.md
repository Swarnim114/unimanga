- User 
- login/register 


for testing 
# 1. Register a new user (creates 5 default categories automatically)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Save the token from above response, then:
export TOKEN="YOUR_TOKEN_HERE"

# 2. Login (if needed)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Get all categories (should show 5 default ones)
curl -X GET http://localhost:3000/api/categories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjhlYzQxZTg4MTc4N2VhMThiYWUzYyIsImlhdCI6MTc2ODQ4MzkyOCwiZXhwIjoxNzY4NTcwMzI4fQ.Muku3nn0kSV5T8x-RagG8TKDKI4TllGJ1KZIL_RO6zQ"

# 4. Create a custom category
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjhlYzQxZTg4MTc4N2VhMThiYWUzYyIsImlhdCI6MTc2ODQ4MzkyOCwiZXhwIjoxNzY4NTcwMzI4fQ.Muku3nn0kSV5T8x-RagG8TKDKI4TllGJ1KZIL_RO6zQ" \
  -H "Content-Type: application/json" \
  -d '{"name":"Favorites","color":"#FFD700","icon":"⭐"}'

# 5. Create a website
curl -X POST http://localhost:3000/api/websites \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjhlYzQxZTg4MTc4N2VhMThiYWUzYyIsImlhdCI6MTc2ODQ4MzkyOCwiZXhwIjoxNzY4NTcwMzI4fQ.Muku3nn0kSV5T8x-RagG8TKDKI4TllGJ1KZIL_RO6zQ" \
  -H "Content-Type: application/json" \
  -d '{"name":"MangaDex","url":"https://mangadex.org","language":"Multi","color":"#FF6740"}'

# 6. Create a manga (replace PASTE_WEBSITE_ID with actual ID from step 5)
curl -X POST http://localhost:3000/api/manga \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjhlYzQxZTg4MTc4N2VhMThiYWUzYyIsImlhdCI6MTc2ODQ4MzkyOCwiZXhwIjoxNzY4NTcwMzI4fQ.Muku3nn0kSV5T8x-RagG8TKDKI4TllGJ1KZIL_RO6zQ" \
  -H "Content-Type: application/json" \
  -d '{"title":"One Piece","description":"Adventure manga","author":"Oda","genres":["Action","Adventure"],"sourceWebsite":"PASTE_WEBSITE_ID","sourceUrl":"https://mangadex.org/title/one-piece","totalChapters":1100,"status":"ongoing"}'

# 7. Add manga to library (replace IDs from steps 3 and 6)
curl -X POST http://localhost:3000/api/library \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjhlYzQxZTg4MTc4N2VhMThiYWUzYyIsImlhdCI6MTc2ODQ4MzkyOCwiZXhwIjoxNzY4NTcwMzI4fQ.Muku3nn0kSV5T8x-RagG8TKDKI4TllGJ1KZIL_RO6zQ" \
  -H "Content-Type: application/json" \
  -d '{"mangaId":"PASTE_MANGA_ID","categoryId":"PASTE_CATEGORY_ID","status":"reading"}'

# 8. Update progress (replace USER_MANGA_ID from step 7)
curl -X PUT http://localhost:3000/api/library/PASTE_USER_MANGA_ID/progress \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Njhl