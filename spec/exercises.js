var exec = require('../lib/exec')
var assert = require('assert')
var path = require('path')
var fs = require('fs')
var _ = require('lodash')
var wUtil = require('workshopper-adventure/util')
var config = {
  validRegex: /^(in)?valid(-|_)?(\d*)?\.\w+/,
  invalidRegex: /^invalid/,
  exercisesFolder: 'test',
  files: '*.*',
  spaceChar: '_'
}
var configPath = `${process.cwd()}/.workshopper-test.config.js`
if (fs.existsSync(configPath)) {
  try {
    Object.assign(config, require(configPath))
  } catch (err) {
    console.error('Configuration file at "' + configPath + '" could not be read!')
    console.error(err.stack)
    process.exit(1)
  }
}

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
      assert.equal(exercises.pop(), '')
      done()
    })
  })
})

describe('Testing exercises', function () {
  var exercises = exec.sync(['list', '--lang=en']).toString().split('\n')
  exercises.pop() // last line break
  exercises.map(function (exercise) {
    return {
      name: exercise,
      id: wUtil.idFromName(exercise, config.spaceChar)
    }
  }).forEach(function ({ name, id }, nr) {
    var folder = path.join(process.cwd(), config.exercisesFolder, id)
    var allFiles = require('glob').sync(config.files, {
      cwd: folder
    })

    allFiles.filter(function (file) {
      var validRe = new RegExp(config.validRegex)
      return validRe.test(file)
    }).forEach(function (file, fileNr) {
      it('./' + path.relative(process.cwd(), path.join(folder, file)) + ' (' + nr + ':' + fileNr + ')\t ', function (done) {
        exec.async(['select', name, '--lang=en'], function (err, stdout, stderr) {
          if (err) {
            throw new Error('Select didnt work out: ' + err)
          }
          exec.async(['verify', path.resolve(folder, file)], function (err, stdout2, stdrr) {
            var invalidRe = new RegExp(config.invalidRegex)
            if (invalidRe.test(file)) {
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
