var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn
var exec = require('child_process').exec
var execSync = require('child_process').execSync
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')

var testRoot = path.join(process.env.HOME || process.env.USERPROFILE, '.workshopper-test')

rimraf.sync(testRoot)

var testDir
var testHome

function clearTestHome () {
	testDir = createTestDirectory(testRoot, 'workspace')
	testHome = createTestDirectory(testRoot, 'storage')
}

clearTestHome()

function createTestDirectory (root, folder) {
	folder = path.resolve(root, folder)
	try {
		rimraf.sync(folder)
	} catch (e) {}

	mkdirp.sync(folder)
	return folder
}

function findWorkshopperBinName (pkg) {
	var bin = pkg.bin
	if (!bin)
		error('package.json does not contain any binary at: ' + pth)

	var binNames = Object.keys(bin)
	if (binNames.length == 0)
		error('package.json does not contain a binary at: ' + pth)

	return binNames[0]
}

function findWorkshopperBin (pkg, binName) {
	return path.resolve(pkg.bin[binName])
}

function findPackageJson () {
	var pth = path.resolve('.', 'package.json')
	if (!fs.existsSync(pth))
		error('Missing the package.json: "' + pth)

	try {
		var pkg = require(pth)
	} catch (e) {
		error('Can\'t read package.json at: ' + pth + '\n' + e.stack)
	}
	return pkg
}

var pkg = findPackageJson()
var binName = findWorkshopperBinName(pkg)
var bin = findWorkshopperBin(pkg, binName)

module.exports = {
	clearTestHome: clearTestHome,
	testDir: testDir,
	testRoot: testRoot,
	testHome: testHome,
	bin: bin,
	binName: binName,
	pkg: pkg,
	useUserProfile: false,
	async: function executeAsync(args, callback) {
		if (!Array.isArray(args))
			args = []
		args.unshift(bin)
		args.unshift(process.argv[0])
		args = '"' + args.join('" "') + '"'
		exec(args, {
			cwd: testDir,
			env: this.useUserProfile ? {
				USERPROFILE: testHome
			} : {
				HOME: testHome
			}
		}, callback)
	},
	sync: function executeSync(args) {
		if (!Array.isArray(args))
			args = []
		args.unshift(bin)
		args.unshift(process.argv[0])
		args = '"' + args.join('" "') + '"'
		return execSync(args)
	}
}