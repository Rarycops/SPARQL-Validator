# SPARQL-Validator

`SPARQL-Validator` is a Github Action that checks if one or multiple `.sparql` files with a SPARQL querry inside are well formed. To check taht the action will make a query to [dbpedia](https://dbpedia.org/sparql), if the status of this query is `400`, meaning that the file is not well formed the action will fail. Independently of the result of the execution the action will put a comment in the pull request with the results of the execution.

## Usage
Create a `.github.workflows/[name].yaml` file in the repository.

Example workflow:
```
name: [name]
on:   
  pull_request:
    branches: [master]

jobs:    
  validate:
    runs-on: ubuntu-latest
    name: SPARQL-Validator
    steps:

      - run: npm i follow-redirects
      
      - run: npm i fs
      
      - name: Checkout
        uses: actions/checkout@v2
      
      - name: sparql-validator
        uses: Rarycops/Sparql-Validator@v1.0.0
        id: 'sparql-validator'
        with:
          owner: ${{ github.repository_owner }}
          repo: ${{ github.event.repository.name }}
          pr_number: ${{ github.event.number }}
          token: ${{ secrets.GITHUB_TOKEN }}
          actor: ${{ github.actor }}
          graph_uri: 'http://dbpedia.org'
          format: 'application/json'
          path: 'SPARQL-Validator'
```
## Inputs
### `owner`
The owner of the repository, it is taken from `${{ github.repository_owner }}`. 
### `repo`
The repository name, it is taken from `${{ github.event.repository.name }}`. 
### `pr_number`
The pull request number, it is taken from `${{ github.event.number }}`. 
### `token`
The account acces token, it is taken from `${{ secrets.GITHUB_TOKEN }}`. 
### `actor`
The account that created the pull request, it is taken from `${{ github.actor }}`. 
### `graph_uri`(optional)
The graph_uri for the [dbpedia](https://dbpedia.org) query. 
### `format`(optional)
The format of the output of the query.

| Option | Format |
| :----------- | :----------- |
| default | `html` |
| `application/json` | `json` |
| `application/javascript` | `javascript` |
| `application/turtle` | `turtle` |
| `text/plain` | `N-Triplets` |
### `path`(optional)
The path to store the outputs of the querys, `[path]/actor/[files]`.
The default path is `SPARQL-Validator`