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
    gulp.src('src/css/**/*').pipe(gulp.dest('dist/css'));
    gulp.src('src/font/**/*').pipe(gulp.dest('dist/font'));
    gulp.src('src/js/**/*').pipe(gulp.dest('dist/js'));
    gulp.src('src/img/**/*').pipe(gulp.dest('dist/img'));
})

gulp.task('updateContent', () => {
    fs.readdir('src/elements/', (err, files) => {
      files.forEach(file => {
        var fileContent = fs.readFileSync('src/elements/'+file, "utf8");

        const doc = parse5.parse(fileContent);

        var body = []
        var headers = ""
        var styledef = ""

        doc.childNodes[1].childNodes.forEach(function(element) {
          if (element.tagName === "head") {
            //search for title
            headers = parse5.serialize(element)
          }
          //we need the style tag from body
          if (element.tagName === "body") {
            body = parse5.serialize(element);
            element.attrs.forEach(function (attr) {
              if (attr.name === "style") {
                styledef = attr.value
              }
            });
          }
        })


        gulp.src('src/template.html')
          .pipe(template(
            {content: body,
             style : styledef,
             header : headers,
           }
          ))
          .pipe(rename(file))
          .pipe(gulp.dest('dist/'))
      });
    })
})

var watcher = gulp.watch('src/**/*');

watcher.on('change', function(path, stats) {
    gulp.start('updateContent');
    gulp.start('updateEssentials');
});
