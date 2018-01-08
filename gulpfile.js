const gulp = require('gulp');
const template = require('gulp-template');
const rename = require('gulp-rename');
const fs = require('fs')

const parse5 = require('parse5');

gulp.task('default', () => {
    gulp.start('updateContent');
    gulp.start('updateEssentials');
});

gulp.task('updateEssentials', () => {
    gulp.src('src/css/*').pipe(gulp.dest('dist/css'));
    gulp.src('src/font/*').pipe(gulp.dest('dist/font'));
    gulp.src('src/js/*').pipe(gulp.dest('dist/js'));
    gulp.src('src/img/*').pipe(gulp.dest('dist/img'));
})

gulp.task('updateContent', () => {
    fs.readdir('src/elements/', (err, files) => {
      files.forEach(file => {
        var fileContent = fs.readFileSync('src/elements/'+file, "utf8");

        const doc = parse5.parse(fileContent);

        const body = parse5.serialize(doc.childNodes[1].childNodes[2]);

        gulp.src('src/templates/template.html')
          .pipe(template(
            {content: body}
          ))
          .pipe(rename(file))
          .pipe(gulp.dest('dist/'))
      });
    })
})

var watcher = gulp.watch('src/*/*');

watcher.on('change', function(path, stats) {
    gulp.start('updateContent');
    gulp.start('updateEssentials');
});
