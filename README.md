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
          default_graph_uri: "http://dbpedia.org"
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
### `default_graph_uri`(optional)
The default_graph_uri for the [dbpedia](https://dbpedia.org) query. 
