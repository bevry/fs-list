// builtin
import { argv, stdout, exit } from 'process'

// local
import list from './index.js'

// for each path, readdir
for (const path of argv.slice(2)) {
	list(path)
		.then((paths) => {
			if (paths.length) {
				stdout.write(paths.join('\n') + '\n')
			}
		})
		.catch((error) => {
			console.error(error)
			exit(1)
		})
}
