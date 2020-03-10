# last-artifact-action
> inspired by https://github.com/actions/download-artifact/issues/3#issuecomment-579289919

Get the content from a file of the last uploaded artifact on some GitHub repository.

## Inputs

### `repository`
The target GitHub owner and repository name  
default: `${{ github.repository }}`

You should set `GITHUB_TOKEN` on either [`with:`](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstepswith) or [`env:`](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#env) field (not both at same time) to prevent rate limiting.  
If `repository` is another private repo, you must define a [PAT with repo scope](https://github.com/settings/tokens/new?scopes=repo) and put this token on your secrets to be used as `GITHUB_TOKEN` value.

## Outputs

### `content`
A serialized JSON where each key is the filename and the value its value as string  
PS: maybe this won't work with non-text files; and every directory is ignored.

### `loaded`
The string `'true'` if an artifact was found and loaded, `'false'` otherwise.

## Usage

Minimal example:

```yml
Name: Foo
on: push
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: micalevisk/last-artifact-action@v2
        id: result
      - if: steps.result.outputs.loaded == 'true'
        run: echo "${{ steps.result.outputs.content }}"
```

Example using the action [`gr2m/get-json-paths-action`](https://github.com/gr2m/get-json-paths-action) to parses the JSON `content`:

```yml
Name: Bar
on: push
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Get 'world.txt' file content from last uploaded artifact
      - uses: micalevisk/last-artifact-action@v2
        id: result
        with:
          repository: owner/repo ## using another repo
          GITHUB_TOKEN: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
      - uses: gr2m/get-json-paths-action@v1.x
        id: files
        with:
          json: "${{ steps.result.outputs.content }}"
          world_file: "world.txt"
      - if: steps.result.outputs.loaded == 'true'
        run: echo "${{ steps.files.outputs.word_file }}"
```
