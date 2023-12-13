#!/bin/sh

curl car-listing-marketplace.developerdiary.me:3000/v1/book/place -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiZW1haWwiOiJ1c2VyMUBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwMjQ1ODAzMCwiZXhwIjoxNzAyNTQ0NDMwLCJhdWQiOiJjYXItbGlzdGluZy5jb20iLCJpc3MiOiJjYXItbGlzdGluZy5jb20iLCJzdWIiOiJ1c2VyIn0.QPlY7wNCPuqTZ8b-0Racpq11n8yIae0HDewHbsruXtM" \
    -d '{ "car_id": 8, "start_time": "2023-12-14 14:00:00", "end_time": "2023-12-14 15:00:00" }' \
    -v > 1.txt \
    &
curl car-listing-marketplace.developerdiary.me:3000/v1/book/place -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDI0NTgwNzEsImV4cCI6MTcwMjU0NDQ3MSwiYXVkIjoiY2FyLWxpc3RpbmcuY29tIiwiaXNzIjoiY2FyLWxpc3RpbmcuY29tIiwic3ViIjoidXNlcjIifQ.xfqc9zs_2pvVF8bvEefEZxeTdqRxF9DD9Icv4c74K3k" \
    -d '{ "car_id": 8, "start_time": "2023-12-14 15:00:00", "end_time": "2023-12-14 16:00:00" }' \
    -v > 2.txt \
    & wait
