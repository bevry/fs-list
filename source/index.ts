// builtin
import { Stats, Dirent, readdir as _readdir, stat as _stat } from 'fs'
import { join } from 'path'

// versions
import { versions } from 'process'
import versionCompare from 'version-compare'
const nodeVersion = String(versions.node || '0')

// external
import accessible, { R_OK } from '@bevry/fs-accessible'
import Errlop from 'errlop'

export type Paths = Array<string>

/**
 * List the entire contents of a directory, for Node.js versions 18.7.0 and up. 110-120ms.
 * @returns the subpaths of the directory, sorted alphabetically.
 * @experimental used internally, however external use is for your curiosity
 */
export async function readdirRecursive(directory: string): Promise<Paths> {
	return new Promise(function (resolve, reject) {
		_readdir(
			directory,
			{ encoding: null, recursive: true },
			function (err, files) {
				if (err) reject(err)
				else resolve(files.sort())
			}
		)
	})
}

/** Helper for {@link readdirStat} to fetch {@link Stats} */
async function statHelper(path: string): Promise<Stats> {
	return new Promise(function (resolve, reject) {
		_stat(path, function (err, stats) {
			if (err) reject(err)
			else resolve(stats)
		})
	})
}

/** Helper for {@link readdirStat} to fetch {@link Paths} */
async function readdirHelper(directory: string): Promise<Paths> {
	return new Promise(function (resolve, reject) {
		_readdir(directory, function (err, files) {
			if (err) reject(err)
			else resolve(files)
		})
	})
}

/**
 * List the entire contents of a directory, for all Node.js versions. 70-80ms.
 * @returns the subpaths of the directory, sorted alphabetically.
 * @experimental used internally, however external use is for your curiosity
 */
async function readdirStat(directory: string): Promise<Paths> {
	// prepare
	const pending: Paths = [directory]
	const results: Paths = []
	const trim = directory === '.' ? 0 : directory.length + 1

	// add subsequent
	while (pending.length) {
		await Promise.all(
			pending.splice(0, pending.length).map(async function (subdirectory) {
				const files = await readdirHelper(subdirectory)
				for (const file of files) {
					const path = join(subdirectory, file)
					const stat = await statHelper(path)
					results.push(trim ? path.substring(trim) : path)
					if (stat.isDirectory()) pending.push(path)
				}
			})
		)
	}

	// return sorted results
	return results.sort()
}

/** Helper for {@link readdirFileTypes} to fetch {@link Dirent} */
async function readdirFileTypesHelper(
	directory: string
): Promise<Array<Dirent>> {
	return new Promise(function (resolve, reject) {
		_readdir(directory, { withFileTypes: true }, function (err, files) {
			if (err) reject(err)
			else resolve(files)
		})
	})
}

/**
 * List the entire contents of a directory, for Node.js versions 10 and up. 70-80ms.
 * @returns the subpaths of the directory, sorted alphabetically.
 * @experimental used internally, however external use is for your curiosity
 */
export async function readdirFileTypes(directory: string): Promise<Paths> {
	// prepare
	const pending: Paths = [directory]
	const results: Paths = []
	const trim = directory === '.' ? 0 : directory.length + 1

	// add subsequent
	while (pending.length) {
		await Promise.all(
			pending.splice(0, pending.length).map(async function (subdirectory) {
				const files = await readdirFileTypesHelper(subdirectory)
				for (const file of files) {
					const path = join(subdirectory, file.name)
					results.push(trim ? path.substring(trim) : path)
					if (file.isDirectory()) pending.push(path)
				}
			})
		)
	}

	// return sorted results
	return results.sort()
}

/**
 * List the entire contents of a directory, selecting the appropriate technique for the Node.js version.
 * @returns the subpaths of the directory, sorted alphabetically.
 */
export default async function list(directory: string): Promise<Paths> {
	// check accessible
	try {
		await accessible(directory)
	} catch (err: any) {
		throw new Errlop(
			`unable to list contents of the non-accessible directory: ${directory}`,
			err
		)
	}

	// check readable
	try {
		await accessible(directory, R_OK)
	} catch (err: any) {
		throw new Errlop(
			`unable to list contents of the non-readable directory: ${directory}`,
			err
		)
	}

	// fatest method
	try {
		return versionCompare(nodeVersion, '18.7.0') >= 0
			? await readdirRecursive(directory)
			: versionCompare(nodeVersion, '10') >= 0
				? await readdirFileTypes(directory)
				: await readdirStat(directory)
	} catch (err: any) {
		throw new Errlop(
			`unable to list contents of the directory: ${directory}`,
			err
		)
	}
}

// 100-110ms, macOS only
// import { exec } from 'child_process'
// async function readdirFind(directory: string): Promise<Paths> {
// 	return new Promise(function (resolve, reject) {
// 		exec('find .', { cwd: directory }, function (err, stdout: string) {
// 			if (err) return reject(err)
// 			return resolve(
// 				stdout
// 					.split('\n')
// 					.map((p) => p.replace(/^[./\\]+/, '')) // trim . and ./
// 					.filter(Boolean)
// 					.sort()
// 			)
// 		})
// 	})
// }
