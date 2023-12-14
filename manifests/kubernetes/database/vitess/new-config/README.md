## Sharded workflow

```
vtctldclient ApplyVSchema --vschema-file="sharded_marketplace_vschema.json" car-listing-marketplace
k apply -f sharded_cluster.yaml
# create tables in each shard

# Reshard
vtctlclient Reshard -- --source_shards '-' --target_shards '-80,80-' Create car-listing-marketplace.car2car

# Cut-over
vtctlclient Reshard -- --tablet_types=rdonly,replica SwitchTraffic car-listing-marketplace.car2car
vtctlclient Reshard -- --tablet_types=primary SwitchTraffic car-listing-marketplace.car2car

# Down shard 0
vtctlclient Reshard -- Complete car-listing-marketplace.car2car
kubectl apply -f sharded_cluster_down_shard_0.yaml
```
