var exec = require('../lib/exec')
var assert = require('assert')
var fs = require('fs')
var _ = require('lodash')
var path = require('path')
var mkdirp = require('mkdirp')

function checkCurrent(current, done, err, stdout, stderr) {
	if (err)
		assert.fail('Cant retreive current. (' + err.code + ' / ' + err.signal + '): \n' + stdout.toString() + ' ' + stderr.toString())
	
	assert.equal(stdout.toString(), current + '\n')
	return done()
}

function checkCurrentEmpty(done, err, stdout, stderr) {
	assert.equal(err.code, 1)
	assert.equal(stdout.toString(), 'No active exercise. Select one from the menu.\n')
	done()
}

function getEntries(done) {
	exec.async(['list'], function (err, stdout, stderr) {
		if (err)
			assert.fail('Cant retreive the list. (' + err.code + ' / ' + err.signal + '): \n' + stderr.toString())
		var data = stdout.toString().split('\n')
		data.pop()
		done(data)
	})
}

function writeCurrentAsFirst(done) {
	getEntries(function (list) {
		var first = list[0]
		var pth = path.join(exec.testHome, '.config', exec.binName)
		mkdirp.sync(pth)
		fs.writeFileSync(path.join(pth, 'current.json'), JSON.stringify(first))
		done(first)
	});
}

function testCurrent(test) {
	exec.async(['current'], test)
}

describe('`current` should', function () {
	beforeEach(function (done) {
		exec.clearTestHome()
		done()
	})	
	it('work with none selected but show an error', function (done) {
		testCurrent(checkCurrentEmpty.bind(null, done))
	})
	it('should store a selection', function (done) {
		writeCurrentAsFirst(function (first) {
			exec.async(['current'], checkCurrent.bind(null, first, done))
		})
	})
	it('be reset on reset', function (done) {
		writeCurrentAsFirst(function (first) {
			exec.async(['reset'], function (err, stdout, stderr) {
				if (err)
					assert.fail('Cant retreive the list. (' + err.code + ' / ' + err.signal + '): \n' + stderr.toString())

				testCurrent(checkCurrentEmpty.bind(null, done))
			})
		})
	})
})

describe('`select` should', function () {
	var list
      , last
	before(function (done) {
		getEntries(function (_list) {
			list = _list
			last = list.length - 1
			done()
		})
	})

	beforeEach(function (done) {
		exec.clearTestHome()
		done()
	})

	it('allow the selection of the first entry as number', function (done) {
		exec.async(['select', '0'], function (err, stdout) {
			testCurrent(checkCurrent.bind(null, list[0], done))
		})
	})

	it('allow the selection of the last entry as number', function (done) {
		exec.async(['select', last], function (err, stdout) {
			testCurrent(checkCurrent.bind(null, list[last], done))
		})
	})
	
	it('allow the selection of the first entry as text', function (done) {
		exec.async(['select', list[0]], function (err, stdout) {
			testCurrent(checkCurrent.bind(null, list[0], done))
		})
	})
	
	it('allow the selection of the last entry as text', function (done) {
		exec.async(['select', list[last]], function (err, stdout) {
			testCurrent(checkCurrent.bind(null, list[last], done))
		})
	})

	it('allow the selection of text and be okay with spaces before, after', function (done) {
		exec.async(['select', '"   ' + list[0] + '  "'], function (err, stdout) {
			testCurrent(checkCurrent.bind(null, list[0], done))
		})
	})

	it('dont break down with the selection of nothing', function (done) {
		exec.async(['select', ''], function (err, stdout) {
			assert.equal(err.code, 1)
			testCurrent(checkCurrentEmpty.bind(null, done))
		})
	})

	it('allow spaces', function (done) {
		var entriesWithSpace = list.filter(function (entry) {
			return entry.indexOf(' ') !== -1
		})
		if (entriesWithSpace.length > 0) {
			exec.async(['select', '  ' + list[0] + '  '], function (err, stdout) {
				testCurrent(checkCurrent.bind(null, list[0], done))
			})	
		} else {
			done();
		}
	})
})