var exec = require('../lib/exec')
var assert = require('assert')
var _ = require('lodash')

function empty (exercise) {
	return /^\s*$/.test(line)
}

function checkVersion(done, err, stdout, stderr) {
	if (err)
		assert.fail('Cant retreive version. (' + err.code + ' / ' + err.signal + '): \n' + stderr.toString())
		
	assert.equal(stdout.toString(), exec.binName + '@' + exec.pkg.version.toString() + '\n')
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