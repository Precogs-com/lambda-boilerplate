# Lambda Boilerplate

[![dependencies Status](https://david-dm.org/Precogs-com/lambda-boilerplate/status.svg)](https://david-dm.org/Precogs-com/lambda-boilerplate) [![Build Status](https://travis-ci.org/Precogs-com/lambda-boilerplate.svg?branch=master)](https://travis-ci.org/Precogs-com/lambda-boilerplate)

## Description

Simple generator of Lambda boilerplate. You can either use predefined boilerplate (see list below), or add your owns.

## Requirements
Nodejs > 6.0.0

## Installation
```
npm install -g lambda-boilerplate
```

## Templates

### Default templates

Default templates are stored in [template](./templates) folder.

| Template | Language | Description |
| ------ | ------ | ------ |
| es2017-lambda-boilerplate | NodeJS | See template page on [Github](https://github.com/irvinlim/es2017-lambda-boilerplate)  |
| hello-world | NodeJS | A simple hello world template with tests and lint |

### Use your own templates
As lambda-boilerplate can be used as a CLI, you can define your own templates directory path. You just have to export your templates directory path `LAMBDA_TEMPLATES_PATH` environment variable.

```
$ export LAMBDA_TEMPLATES_PATH=/absolute/path/to/your/templates/directory
```

You can also add this line to your bash profile to keep it permanent.

### Template variable

For templating, we use ECT library. Following variables are availables:

| Variable | Description |
| ------ | ------ |
| projectName | Lambda name |

## Use as CLI
```
$ lambda-boilerplate --help

  Usage: lambda-boilerplate [options] [lambda_path] [lambda_name]

  Generate a Lambda boilerplate from template

  Options:

    -V, --version  output the version number
    -h, --help     output usage information
```

If it sets, CLI use `LAMBDA_TEMPLATES_PATH` environment variable as templates directory path, otherwise it uses local [templates directory](./templates).

| Arguments | Default | Description |
| ------ | ------ | ------ |
| lambda_path | Current directory | Path where new Lambda folder should be created |
| lambda_name |   | Lambda project name |

## Use as API

```js
const lb = require('lambda-boilerplate');

lb.prompt(destination, srcTemplates, name)
  .then(() => {
    console.log('generated');
  })
  .catch(console.log);
```

| Arguments | Default | Description |
| ------ | ------ | ------ |
| destination | Current directory | Path where new Lambda folder should be created |
| srcTemplates | [../templates](./templates) | Lambda templates directory |
| name |   | Lambda project name |

## Want to contribute ?
**Wow, that's great !**  
Feedback, bug reports and pull requests are more than welcome !

You can test your code with:
```bash
$ git clone git@github.com:Precogs-com/lambda-boilerplate.git
$ cd lambda-boilerplate
$ npm run lint
$ npm run test
```

## TODO
- Add more templates in different languages
- Support ECT variables as parameters


Inspired by [@harrietty](https://medium.com/northcoders/creating-a-project-generator-with-node-29e13b3cd309)