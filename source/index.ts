// builtin
import { readdir as _readdir } from 'fs'
import { exec } from 'child_process'
import { versions } from 'process'
const nodeVersion = String(versions.node || '0')

// external
import accessible, { R_OK } from '@bevry/fs-accessible'
import Errlop from 'errlop'
import versionCompare from 'version-compare'

/** List the entire contents of a directory. */
export default async function list(path: string): Promise<Array<string>> {
	// check accessible
	try {
		await accessible(path)
	} catch (err: any) {
		throw new Errlop(
			`unable to list contents of the non-accessible directory: ${path}`,
			err
		)
	}

	// check readable
	try {
		await accessible(path, R_OK)
	} catch (err: any) {
		throw new Errlop(
			`unable to list contents of the non-readable directory: ${path}`,
			err
		)
	}

	// attempt read
	return new Promise(function (resolve, reject) {
		if (versionCompare(nodeVersion, '18.17.0') >= 0) {
			_readdir(
				path,
				{ encoding: null, recursive: true, withFileTypes: false },
				function (err, files) {
					if (err) return reject(err)
					return resolve(files.sort())
				}
			)
		} else {
			// find files and dirs, -f doesn't work on ubuntu
			exec('find .', { cwd: path }, function (err, stdout: string) {
				if (err) return reject(err)
				return resolve(
					stdout
						.split('\n')
						.map((p) => p.replace(/^[./\\]+/, '')) // trim . and ./
						.filter(Boolean)
						.sort()
				)
			})
		}
	})
}
