// external
import { deepEqual } from 'assert-helpers'
import kava from 'kava'
import promiseErrback from 'promise-errback'

// local
import list from './index.js'

kava.suite('@bevry/fs-list', function (suite, test) {
	test('works as expected', function (done) {
		promiseErrback(
			Promise.resolve().then(async function () {
				deepEqual(
					await list('.github'),
					[
						'dependabot.yml',
						'FUNDING.yml',
						'workflows',
						'workflows/bevry.yml',
					].sort(),
					'reading worked fine'
				)
			}),
			done
		)
	})
})
