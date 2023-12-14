## Architecture

Deployed in `IBM Cloud` in a `Kubernetes` cluster. `Vitess` is used as `MySQL` database clustering solution. `vtgate` act as a database proxy and prevent database overloading with many connections. Our `Node.js` pods are exposed using an `IBM LoadBalancer` instance. 

![alt text](/architecture.png)

## Run postman collection

|   |  |
| ------------- | ------------- |
| Postman collection URL  | https://api.postman.com/collections/3399909-8552301a-0d51-4acc-9b09-cae2a1bf780e?access_key=PMAT-01HHF91WPTK17ZRXP9YKP7EM10  |
| Host  | car-listing-marketplace.developerdiary.me |
| Port  | 3000 |
| Admin cred | { "username": "admin", "email": "admin@car-listing.com", "password": "admin123"} |
| User 1 cred | { "username": "user", "email": "user1@gmail.com", "password": "user1234" } |
| User 2 cred | { "username": "user2", "email": "user2@gmail.com", "password": "user21234"} |

## Notes

After posing a car by an admin, it is available for users to book the next day for one hour sized time slots for 24 hours. This should be actually configurable as per the needs.

## Decision I made

- Authentication / Authorization is handled using JWT bearer tokens.
- Sharded the database to have a higher throughput of transactions and scatter-gather joins for faster car search results.
- Booking cars for a particular time slot is achieved by materialized locks. Essentially 
- Database sharding is done as booking transactions are processed only within a shard.

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
