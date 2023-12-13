## Run postman collection

| property  | value |
| ------------- | ------------- |
| Postman collection URL  | https://api.postman.com/collections/3399909-8552301a-0d51-4acc-9b09-cae2a1bf780e?access_key=PMAT-01HHF91WPTK17ZRXP9YKP7EM10  |
| Host  | car-listing-marketplace.developerdiary.me |
| Port  | 3000 |
| Admin cred | { "email": "admin@car-listing.com", "password": "admin123"} |
| User 1 cred | { "username": "user", "email": "user1@gmail.com", "password": "user1234" } |
| User 2 cred | { "username": "user2", "email": "user2@gmail.com", "password": "user21234"} |

## Notes

- Authentication / Authorization is handled using JWT bearer tokens

### Build server

```
docker build . -t amila15/car-listing-marketplace:v1.0.0
```

### Load image (Optional)

```
kind load docker-image amila15/car-listing-marketplace:v1.0.0
```

### Run application

```
k apply -f manifests/kubernetes
k port-forward svc/car-listing-deployment 3000
```
