#!/bin/bash

# Test menu validation - should fail without auth
echo "=== Testing menu creation (should return 401 unauthorized) ==="
curl -X POST http://localhost:4000/api/v1/admin/menus \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Menu", "position": "header"}'
echo -e "\n"

echo "=== Testing menu creation with invalid data (should return 400 validation error) ==="
curl -X POST http://localhost:4000/api/v1/admin/menus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{"invalidField": "value"}'
echo -e "\n"

echo "=== Testing public menu list (should work without auth) ==="
curl -X GET http://localhost:4000/api/v1/menus
echo -e "\n"

echo "=== Testing page builder creation (should fail without auth) ==="
curl -X POST http://localhost:4000/api/v1/admin/pages \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Page", "slug": "test-page"}'
echo -e "\n"

echo "=== Testing public page list (should work without auth) ==="
curl -X GET http://localhost:4000/api/v1/pages
echo -e "\n"
