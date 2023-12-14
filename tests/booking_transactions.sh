#!/bin/sh

# export HOST="car-listing-marketplace.developerdiary.me"
export HOST="localhost"

curl $HOST:3000/v1/book/place -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU0MDA2NWZkLWJmOGMtNDJiZC1hZTM0LTRiMjY2MjRkYTQ4NSIsImVtYWlsIjoidXNlcjhAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDI1NDczMzAsImV4cCI6MTcwMjYzMzczMCwiYXVkIjoiY2FyLWxpc3RpbmcuY29tIiwiaXNzIjoiY2FyLWxpc3RpbmcuY29tIiwic3ViIjoidXNlcjgifQ.1qJy6YsNm9AGgt2ogR-OAVhtp4ge9RyYj4K34CD_HaM" \
    -d '{ "car_id": "10646550-bc0a-48a6-beb1-bb4af9648a89", "start_time": "2023-12-15 08:00:00", "end_time": "2023-12-15 09:00:00" }' \
    -v > tx1.txt \
    &
curl $HOST:3000/v1/book/place -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMxNzM2N2I4LTEyYTgtNDQ0My05OTRhLTM3MTU5NWE4N2NiYiIsImVtYWlsIjoidXNlcjdAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDI1NDY3MjYsImV4cCI6MTcwMjYzMzEyNiwiYXVkIjoiY2FyLWxpc3RpbmcuY29tIiwiaXNzIjoiY2FyLWxpc3RpbmcuY29tIiwic3ViIjoidXNlcjcifQ._kNBRrVRS1EoH606NKwhnxMpZduc6UrLf9h9_rZxMGc" \
    -d '{ "car_id": "10646550-bc0a-48a6-beb1-bb4af9648a89", "start_time": "2023-12-15 08:00:00", "end_time": "2023-12-15 09:00:00" }' \
    -v > tx2.txt \
    & wait
