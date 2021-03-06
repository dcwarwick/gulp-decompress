'use strict';
const fs = require('fs');
const archiveType = require('archive-type');
const decompress = require('decompress');
const gutil = require('gulp-util');
const path = require('path');
const Transform = require('readable-stream/transform');

module.exports = opts => new Transform({
	objectMode: true,
	transform(file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-decompress', 'Streaming is not supported'));
			return;
		}

		if (!archiveType(file.contents)) {
			cb(null, file);
			return;
		}

//      console.log(file.path);
//      console.dir(file);

		decompress(file.contents, opts)
			.then(files => {
				files.forEach(x => {

					const stat = new fs.Stats();

					stat.mode = x.mode;
					stat.mtime = x.mtime;

					let y = new gutil.File({
						stat: stat,
						contents: stat.isDirectory() ? null : x.data,
						path: path.join(path.relative(file.base, path.dirname(file.path)), path.basename(file.path, path.extname(file.path)), x.path)
					});

                  this.push(y);
				});

				cb();
			})
			.catch(err => {
				cb(new gutil.PluginError('gulp-decompress:', err, {fileName: file.path}));
			});
	}
});
