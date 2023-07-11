# ABAC migration for projects 

To add ABAC rules with project permissions for default teams, migrate existing projects _before_ enabling the `abacProject` feature flag.  
You can either migrate all accounts or a specific account using the environment variables listed below in your pipelines, based on your requirements.

## ENV variables
```
MONGO_URI (required): Mongo URI. Pass the DB name, or use the same URI as for cf-api.
ACCOUNT_NAME (optional): Name of target account to migrate. When omitted, _all accounts_ are migrated.
```

## Examples

1. Run script with codefresh pipeline: See [codefresh-clone.yaml](./codefresh-clone.yaml)
2. Run docker image with codefresh pipeline: See [codefresh-image.yaml](./codefresh-image.yaml)
3. Run locally:
```
yarn install
MONGO_URI={value} ACCOUNT_NAME={value} node index.js
```
4. Run docker image
```
docker run -it --rm -e MONGO_URI={value} --name codefresh-project-abac-migration quay.io/codefresh/project-abac-migration:latest
```

