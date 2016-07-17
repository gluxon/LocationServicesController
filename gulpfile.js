var gulp = require('gulp');
var gulpAtom = require('gulp-atom');

gulp.task('default', function() {
    return gulpAtom({
        srcPath: './app',
        releasePath: './build/release',
        cachePath: './build/cache',
        version: 'v1.2.7',
        rebuild: false,
        platforms: ['darwin-x64']
    });
});
