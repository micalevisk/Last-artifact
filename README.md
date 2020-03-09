# last-artifact-action
> inspired by https://github.com/actions/download-artifact/issues/3#issuecomment-579289919

Get the content from a file of the last uploaded artifact on some GitHub repository.

## Inputs

### `filename`
**Required**  
The entry name of the target file that the content will be read

### `repository`
The target GitHub owner and repository name
default: `${{ github.repository }}`

## Outputs

### `content`
A serialized `filename` file content or empty.

### `found`
The string `'true'` if the file `filename` was found, `'false'` otherwise.

## Usage

Minimal example

```yml
Name: Foo
on: [push]
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Get world.txt content from last artifact
      - uses: micalevisk/last-artifact-action@master
        id: result
        with:
          filename: world.txt
      - name: Display the file content
        if: steps.result.outputs.found == 'true'
        run: "echo ${{ steps.result.outputs.content }}"
```

