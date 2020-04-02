var exec = require('../lib/exec')
var assert = require('assert')
var path = require('path')
var _ = require('lodash')
var wUtil = require('workshopper-adventure/util')

function getExercises (done) {
  exec.async(['list'], function (err, stdout, stderr) {
    if (err) {
      assert.fail('Can retreive list. (' + err.code + ' / ' + err.signal + '): \n' + stderr.toString())
    }

    return done(stdout.toString().split('\n'))
  })
}

describe('Exercises should be ', function () {
  it('more than 0', function (done) {
    getExercises(function (exercises) {
      if (exercises.length < 2) {
        assert.fail('Not enough elements')
      }
      done()
    })
  })
  it('unique', function (done) {
    getExercises(function (exercises) {
      var uniq = _.uniq(exercises)
      if (uniq.length !== exercises.length) {
        assert.fail('List contains duplicate exercise-names: ' + _.difference(exercises, uniq))
      }
      done()
    })
  })
  it('with an empty last-line', function (done) {
    getExercises(function (exercises) {
      assert.strictEqual(exercises.pop(), '')
      done()
    })
  })
})

describe('Testing exercises', function () {
  var exercises = exec.sync(['list', '--lang=en']).toString().split('\n')
  exercises.pop() // last line break
  exercises.map(function (exercise) {
    return wUtil.idFromName(exercise)
  }).forEach(function (id, nr) {
    var folder = path.join(process.cwd(), 'test', id)
    var allFiles = require('glob').sync('*.*', {
      cwd: folder
    })

    allFiles.filter(function (file) {
      return /^(in)?valid(-|_)?(\d*)?\.\w+/.test(file)
    }).forEach(function (file, fileNr) {
      it('./' + path.relative(process.cwd(), path.join(folder, file)) + ' (' + nr + ':' + fileNr + ')\t ', function (done) {
        exec.async(['select', id], function (err, stdout, stderr) {
          if (err) {
            throw new Error('Select didnt work out: ' + err)
          }
          exec.async(['verify', path.resolve(folder, file)], function (err, stdout2, stdrr) {
            if (/^invalid/.test(file)) {
              if (!err) {
                throw new Error(stdout2)
              }
            } else {
              if (err) {
                throw new Error(stdout2)
              }
            }
            done()
          })
        })
      })
    })
  })
})
