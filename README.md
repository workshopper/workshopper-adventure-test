# workshopper-adventure-test
`workshopper-adventure-test` is test system specifically for nodeschool [workshopper-adventures](https://github.com/workshopper/workshopper-adventure). However: It should work also for [workshoppers](https://github.com/workshopper/workshopper) and [adventures](https://github.com/substack/adventure).

## Concept
NodeSchool tutorials can be executed through the CLI. As such the lowest common denominator should be the CLI access. Basically: This test executes the tutorial with command line arguments and sees if the result matches basic rules.

## Usage
You can install `workshopper-adventure-test` globally or use it as part of the tutorials `package.json`:

```
$ npm i workshopper-adventure-test
```

Then add this to your `package.json`:

```
"scripts": {
    "test": "workshopper-adventure-test"
}
```

Then you should be able to run it in your workshopper/adventure using `npm test`

## Workshopper specific tests
This test system will lookup the `./test` folder of your workshopper/adventure for files to test your exercises. The folder structure has to look like this:

```
<tutorial>
 |
 \--- test
    |---- hello_world
    |   |---- valid_01.js
    |   \---- invalid_01.js
    |
    \---- baby_steps
        |---- valid_01.js
        \---- invalid_01.js

```

In this example-structure two exercises will be tested: `hello_world` and `baby_steps`. The names are simplified version of the names returned by `$ <tutorial> list`. Any "valid" test has to pass, any "invalid" test has to fail.

## Status-QUO
At the moment it works better than not but there are quite a few things that could and should be improved. Looking forward to help.

