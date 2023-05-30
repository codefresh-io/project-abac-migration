# Project abac migration

Should be used before enabling `abacProject` feature flag to add abac rules with project permissions for default team.

## ENV variables
```
MONGO_URI (required) - mongo URI
ACCOUNT_NAME (optional) - name of target account. Migration will be performed for all accounts if not passed.
```

## Examples

1. Codefresh pipeline (repo clone) - see [codefresh-clone.yaml](./codefresh-clone.yaml)
2. Codefresh pipeline (with image) - see [codefresh-image.yaml](./codefresh-image.yaml)
3. Run locally
```
yarn install
MONGO_URI={value} ACCOUNT_NAME={value} node index.js
```

