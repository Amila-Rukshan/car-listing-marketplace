#!/bin/sh

curl localhost:3000/book -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiZW1haWwiOiJhbWlsYUBkZXYuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDIyODA3MTgsImV4cCI6MTcwMjM2NzExOCwiYXVkIjoiY2FyLXJlbnRhbC5jb20iLCJpc3MiOiJjYXItcmVudGFsLmNvbSIsInN1YiI6ImFtaWxhIn0.mlUXRHf_vAcsthz-JHW6ueUXbG67CmXCB4rsO5D2NlU" \
    -d '{ "car_id": 11, "start_time": "2023-12-12 15:00:00", "end_time": "2023-12-12 16:00:00" }' \
    -v > 1.txt \
    &
curl localhost:3000/book -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzAsImVtYWlsIjoicnVrQGRldi5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwMjI4MDc2MCwiZXhwIjoxNzAyMzY3MTYwLCJhdWQiOiJjYXItcmVudGFsLmNvbSIsImlzcyI6ImNhci1yZW50YWwuY29tIiwic3ViIjoicnVrIn0.bxmhHD2OVxvbgBAnYsMglyQzCwk1P4qLTsc8bLhuvn4" \
    -d '{ "car_id": 11, "start_time": "2023-12-12 15:00:00", "end_time": "2023-12-12 16:00:00" }' \
    -v > 2.txt \
    & wait
