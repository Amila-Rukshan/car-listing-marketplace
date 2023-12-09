# Build Server

```
docker build . -t amila15/car-listing-marketplace:v1.0.0
```

# Load Image (Optional)

```
kind load docker-image amila15/car-listing-marketplace:v1.0.0
```

# Run Application

```
k apply -f manifests/kubernetes
k port-forward svc/car-listing-deployment 3000
```
