var exec = require('../lib/exec')
var assert = require('assert')

function checkVersion (done, err, stdout, stderr) {
  if (err) {
    assert.fail('Cant retreive version. (' + err.code + ' / ' + err.signal + '): \n' + stderr.toString())
  }

  assert.strictEqual(stdout.toString(), exec.binName + '@' + exec.pkg.version.toString() + '\n')
  return done()
}

describe('`version` should', function () {
  it('be equal to the package.json', function (done) {
    exec.async(['version'], checkVersion.bind(null, done))
  })
  it('work via -v', function (done) {
    exec.async(['-v'], checkVersion.bind(null, done))
  })
  it('work via --version', function (done) {
    exec.async(['--version'], checkVersion.bind(null, done))
  })
  it('work via v', function (done) {
    exec.async(['v'], checkVersion.bind(null, done))
  })
})
