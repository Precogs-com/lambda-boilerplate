const inquirer = require('inquirer');
const { PathPrompt } = require('inquirer-path');
const fs = require('fs-extra');
const path = require('path');
const ECT = require('ect');

inquirer.prompt.registerPrompt('path', PathPrompt);

const validateDir = (dir) => {
  if (!fs.existsSync(dir)) {
    throw (new Error(`<${dir}> doesn't exist.`));
  }

  const pathStats = fs.statSync(dir);
  if (!pathStats.isDirectory()) {
    throw (new Error(`<${dir}> is not a directory.`));
  }

  return (true);
};

const createDirectoryContents = (templatePath, newProjectPath, projectName) => {
  validateDir(templatePath);
  validateDir(newProjectPath);

  const filesToCreate = fs.readdirSync(templatePath);

  for (let i = 0; i < filesToCreate.length; i += 1) {
    const file = filesToCreate[i];
    const origFilePath = path.join(templatePath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      const replace = { projectName };
      const contents = ECT().render(origFilePath, replace);
      const writePath = path.join(newProjectPath, file);
      fs.writeFileSync(writePath, contents, 'utf8');
    } else if (stats.isDirectory()) {
      fs.mkdirSync(path.join(newProjectPath, file));

      // recursive call
      const nextTemplateFilePath = path.join(templatePath, file);
      const nextFilePath = path.join(newProjectPath, file);
      createDirectoryContents(nextTemplateFilePath, nextFilePath, projectName);
    }
  }
};

const prompt = (lambdaPath, templateDir, name) => new Promise((resolve, reject) => {
  try {
    // Make sure destination folder exists and is a directory
    const dest = lambdaPath || process.cwd(); // Use current directory as default
    validateDir(dest);

    // Make sure template folder exists and is a directory
    // Use boilerplate template directory as default
    const src = templateDir || path.join(__dirname, '..', 'templates');
    validateDir(src);

    // Read template directory
    const choices = fs.readdirSync(src);

    const questions = [
      {
        type: 'path',
        name: 'project-dest',
        message: 'Where would you like generate project?',
        default: dest || '',
        validate: (input) => {
          if (fs.existsSync(input)) {
            const pathStats = fs.statSync(input);
            if (pathStats.isDirectory()) return true;

            return (`<${input}> is not a directory`);
          }
          return (`<${input}> doesn't exist.`);
        },
      },
      {
        name: 'project-choice',
        type: 'list',
        message: 'What project template would you like to generate?',
        choices,
      },
      {
        name: 'project-name',
        type: 'input',
        message: 'Project name:',
        default: name || '',
        validate: (input) => {
          if (/^([A-Za-z\-_\d])+$/.test(input)) return true;

          return 'Project name may only include letters, numbers, underscores and hashes.';
        },
      },
    ];

    inquirer.prompt(questions)
      .then((answers) => {
        const projectChoice = answers['project-choice'];
        const projectName = answers['project-name'];
        const projectDest = answers['project-dest'];
        const templatePath = path.join(src, projectChoice);
        const projectPath = path.join(projectDest, projectName);

        fs.ensureDirSync(projectPath);

        createDirectoryContents(templatePath, projectPath, projectName);
        resolve(projectPath);
      })
      .catch(reject);
  } catch (err) {
    reject(err);
  }
});

module.exports = {
  createDirectoryContents,
  prompt,
};
