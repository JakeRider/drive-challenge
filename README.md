# Drive Coding Challenge

## Requirements

- Node v20.10.0 (LTS)

## Installation & Usage

1. Ensure you are using the correct version of Node. If you use `nvm` (recommended), you can run `nvm use` in the root of this repo to automatically switch to the correct version.
2. Install the project's dependencies by running `npm i` in the root of this repo.
3. The tool accepts input via STDIN. If you have a file named `./input.txt` you can run `cat input.txt | npx ts-node ./src/index.ts` to process it.
4. Test can be run via the command `npm test`.

## Notes

- The program checks for invalid commands and contact types, but it will not handle invalid an _order_ for commands, e.g. an attempt to create an employee at a company that doesn't exist, or incorrectly spelled references to a valid company/partner/employee. Given that the instructions specified I would not have malformed data, I interpeted that as meaning I would not have to worry about those edge case in this exercise.
- If you're curious why some of the template string are prefaced with `/* sql */`, it's because I have an extension for my editor that applies syntax highlighting to strings prefaced with that comment. I was going to list it here, but I realized I don't remember which extension is doing it. 😅
