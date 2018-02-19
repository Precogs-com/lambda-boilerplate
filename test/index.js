const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const { expect } = chai;

const fs = require('fs-extra');

const inquirer = require('inquirer');

describe('Lambda boilerplate', () => {
  let stubFsWriteFile;
  let stubFsExists;
  let stubFsStat;
  let stubFsStatIsFile;
  let stubFsStatIsDirectory;
  let stubFsReadFile;
  let stubFsReadDir;
  let stubFsMkdir;
  let stubFsEnsure;
  let stubInquirer;
  let stubEct;
  let stubEctRender;

  let lambda;

  beforeEach(() => {
    stubFsExists = sinon.stub(fs, 'existsSync').returns(true);
    stubFsStatIsFile = sinon.stub().returns(true);
    stubFsStatIsDirectory = sinon.stub().returns(true);
    stubFsStat = sinon.stub(fs, 'statSync').returns({
      isFile: stubFsStatIsFile,
      isDirectory: stubFsStatIsDirectory,
    });
    stubFsWriteFile = sinon.stub(fs, 'writeFileSync').returns();
    stubFsReadFile = sinon.stub(fs, 'readFileSync').returns('toto <% @projectName %> toto');
    stubFsReadDir = sinon.stub(fs, 'readdirSync').returns(['file1', 'dir', 'file2']);
    stubFsMkdir = sinon.stub(fs, 'mkdirSync').returns();
    stubFsEnsure = sinon.stub(fs, 'ensureDirSync').returns();

    stubInquirer = sinon.stub(inquirer, 'prompt').resolves({
      'project-choice': 'template',
      'project-name': 'toto',
      'project-dest': 'a/path',
    });

    stubEctRender = sinon.stub().returns('toto toto toto');
    stubEct = sinon.stub().returns({
      render: stubEctRender,
    });

    lambda = proxyquire('../src/index.js', {
      ect: stubEct,
    });
  });

  afterEach(() => {
    stubFsExists.restore();
    stubFsStat.restore();
    stubFsWriteFile.restore();
    stubFsReadFile.restore();
    stubFsReadDir.restore();
    stubFsMkdir.restore();
    stubFsEnsure.restore();

    stubInquirer.restore();
  });

  describe('createDirectoryContents', () => {
    it('should fail if template path doesn\'t exist or not a directory', () => {
      stubFsStatIsDirectory.returns(false);
      try {
        lambda.createDirectoryContents('not/a/directory', 'not/a/path', 'toto');
      } catch (err) {
        expect(err.message).equal('<not/a/directory> is not a directory.');
      }
    });

    it('should fail if project path doesn\'t exist or not a directory', () => {
      stubFsStatIsDirectory.onCall(1).returns(false);
      try {
        lambda.createDirectoryContents('not/a/directory', 'not/a/path', 'toto');
      } catch (err) {
        expect(err.message).equal('<not/a/path> is not a directory.');
      }
    });

    it('should fail if read template directory doesn\'t work', () => {
      stubFsReadDir.throws(new Error('cannot read dir'));
      try {
        lambda.createDirectoryContents('a/directory', 'a/path', 'toto');
      } catch (err) {
        expect(err.message).equal('cannot read dir');
      }
    });

    it('should fail if cannot get stat of a file', () => {
      stubFsStat.onCall(2).throws(new Error('cannot read stats'));
      try {
        lambda.createDirectoryContents('a/directory', 'a/path', 'toto');
      } catch (err) {
        expect(err.message).equal('cannot read stats');
      }
    });

    it('should fail if ECT doesn\'t work', () => {
      stubEctRender.throws(new Error('cannot write file'));
      try {
        lambda.createDirectoryContents('a/directory', 'a/path', 'toto');
      } catch (err) {
        expect(stubEctRender.callCount).equal(1);
        expect(err.message).equal('cannot write file');
      }
    });

    it('should fail if write file doesn\'t work', () => {
      stubFsWriteFile.throws(new Error('cannot write file'));
      try {
        lambda.createDirectoryContents('a/directory', 'a/path', 'toto');
      } catch (err) {
        expect(stubFsWriteFile.firstCall.args[0]).to.match(/.*a\/path\/file1/);
        expect(stubFsWriteFile.firstCall.args[1]).equal('toto toto toto');
        expect(err.message).equal('cannot write file');
      }
    });

    it('should fail if mkdir doesn\'t work', () => {
      stubFsStatIsFile.onCall(1).returns(false);
      stubFsMkdir.throws(new Error('cannot create dir'));
      try {
        lambda.createDirectoryContents('a/directory', 'a/path', 'toto');
      } catch (err) {
        expect(stubFsMkdir.firstCall.args[0]).to.match(/.*a\/path\/dir/);
        expect(err.message).equal('cannot create dir');
      }
    });

    it('should success with recursive', () => {
      stubFsStatIsFile.onCall(1).returns(false);
      try {
        lambda.createDirectoryContents('a/directory', 'a/path', 'toto');
      } catch (err) {
        expect(stubEctRender.callCount()).equal(2);
        expect(stubFsWriteFile.callCount()).equal(2);
        expect(stubFsMkdir.callCount()).equal(1);
        expect(stubFsWriteFile.getCall(0).args[0]).to.match(/.*\/a\/path\/file1/);
        expect(stubFsWriteFile.getCall(1).args[0]).to.match(/.*\/a\/path\/file2/);
        expect(stubFsMkdir.getCall(0).args[0]).to.match(/.*\/a\/path\/dir/);
      }
    });

    it('should success if template directory is empty', () => {
      stubFsReadDir.returns([]);
      try {
        lambda.createDirectoryContents('a/directory', 'a/path', 'toto');
      } catch (err) {
        expect(stubFsWriteFile.callCount()).equal(0);
        expect(stubFsMkdir.callCount()).equal(0);
      }
    });
  });

  describe('prompt', () => {
    beforeEach(() => {

    });

    afterEach(() => {

    });

    it('should fail if destination path doesn\'t exist', (done) => {
      stubFsExists.returns(false);
      lambda.prompt('not/a/path', 'not/a/template/path', 'toto')
        .then(() => {
          done('should not succeed');
        })
        .catch((err) => {
          try {
            expect(stubFsExists.callCount).equal(1);
            expect(err.message).equal('<not/a/path> doesn\'t exist.');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should fail if read template dir doesn\'t work', (done) => {
      stubFsExists.onCall(1).returns(false);
      lambda.prompt('not/a/path', 'not/a/template/path', 'toto')
        .then(() => {
          done('should not succeed');
        })
        .catch((err) => {
          try {
            expect(stubFsExists.callCount).equal(2);
            expect(err.message).equal('<not/a/template/path> doesn\'t exist.');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should fail if inquirer prompt doesn\'t work', (done) => {
      stubInquirer.rejects(new Error('no prompt'));
      lambda.prompt()
        .then(() => {
          done('should not succeed');
        })
        .catch((err) => {
          try {
            expect(stubFsExists.callCount).equal(2);
            expect(err.message).equal('no prompt');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should fail if ensureDirSync doesn\'t work', (done) => {
      stubFsEnsure.throws(new Error('cannot ensure dir'));
      lambda.prompt('a/path', 'a/template/path', 'toto')
        .then(() => {
          done('should not succeed');
        })
        .catch((err) => {
          try {
            expect(stubFsExists.callCount).equal(2);
            expect(stubFsEnsure.callCount).equal(1);
            expect(stubFsEnsure.getCall(0).args[0]).equal('a/path/toto');
            expect(err.message).equal('cannot ensure dir');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should success with src and dest', (done) => {
      lambda.prompt('a/path', 'a/template/path', 'toto')
        .then(() => {
          expect(stubFsExists.getCall(0).args[0]).equal('a/path');
          expect(stubFsExists.getCall(1).args[0]).equal('a/template/path');
          expect(stubFsEnsure.firstCall.args[0]).equal('a/path/toto');
          done();
        })
        .catch(done);
    });

    it('should success without src, dest and name', (done) => {
      lambda.prompt(undefined, undefined, 'toto')
        .then(() => {
          expect(stubFsExists.getCall(0).args[0]).equal(process.cwd());
          expect(stubFsExists.getCall(1).args[0]).to.match(/.*\/templates/);
          expect(stubFsEnsure.firstCall.args[0]).to.match(/.*\/toto/);
          done();
        })
        .catch(done);
    });
  });
});
