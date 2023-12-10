### Starting database cluster

```
k apply -f operator.yaml
k apply -f db_cluster.yaml
```

### Add database schemas and vshcema

```
vtctldclient ApplySchema --sql-file="marketplace.sql" car-listing-marketplace

```

### Port-forward vtgate

```
sh pf.sh
```

### User credentials
```
-- password1 = "P@ssw0rd1"
-- password2 = "S3cr3tP@ssw0rd"
-- password3 = "SuperAdmin123"
-- password4 = "Admin123"
-- password5 = "User12345"
-- password6 = "User54321"
-- password7 = "AnotherUser"
-- password8 = "RandomUser1"
-- password9 = "YetAnotherUser"
-- password10 = "FinalUser"
```
