// external
import { deepEqual } from 'assert-helpers'
import kava from 'kava'

// local
import list from './index.js'

kava.suite('@bevry/fs-list', function (suite, test) {
	test('works as expected', function (done) {
		Promise.resolve()
			.then(async function () {
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
			})
			.then(() => done())
			.catch((err) => done(err))
		// finally breaks early node support
	})
})