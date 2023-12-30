// builtin
import { join } from 'path'

// external
import { deepEqual } from 'assert-helpers'
import kava from 'kava'
import promiseErrback from 'promise-errback'

// local
import list from './index.js'

// tests
kava.suite('@bevry/fs-list', function (suite, test) {
	test('.github works as expected', function (done) {
		promiseErrback(
			Promise.resolve().then(async function () {
				deepEqual(
					await list('.github'),
					[
						'dependabot.yml',
						'FUNDING.yml',
						'workflows',
						join('workflows', 'bevry.yml'), // windows compat
					].sort(),
					'reading worked fine'
				)
			}),
			done
		)
	})
})
