const gulp = require('gulp');
const template = require('gulp-template');
const rename = require('gulp-rename');
const fs = require('fs')
const cleanCSS = require('gulp-clean-css');
const minify = require('gulp-minify');
const parse5 = require('parse5');
const imagemin = require('gulp-imagemin');

gulp.task('default', () => {
    gulp.start('updateContent');
    gulp.start('updateEssentials');

    var watcher = gulp.watch('src/**/*');

    watcher.on('change', function(path, stats) {
        gulp.start('updateContent');
        gulp.start('updateEssentials');
    });

});

gulp.task('deploy', () => {
    gulp.start('updateContent');
    gulp.start('updateEssentialsNOMINIFY');
});

gulp.task('updateEssentialsNOMINIFY', () => {
   gulp.src('src/css/**/*').pipe(gulp.dest('dist/css'));
    gulp.src('src/font/**/*').pipe(gulp.dest('dist/font'));
    gulp.src('src/js/**/*').pipe(gulp.dest('dist/js'));
    gulp.src('src/assets/**/*').pipe(gulp.dest('dist/assets'));
    gulp.src('src/img/**/*').pipe(gulp.dest('dist/img'));
})

gulp.task('updateEssentials', () => {
    gulp.src('src/css/**/*')
      .pipe(cleanCSS())
      .pipe(gulp.dest('dist/css'));
    gulp.src('src/font/**/*').pipe(gulp.dest('dist/font'));
    gulp.src('src/js/**/*')
      .pipe(minify({
        mangle : false,
        noSource : true,
        ext:{
            min:'.js'
        },
      }))
      .pipe(gulp.dest('dist/js'));
    gulp.src('src/img/**/*')
     // .pipe(imagemin())
      .pipe(gulp.dest('dist/img'));
})

gulp.task('updateContent', () => {

    gulp.src('src/static/*').pipe(gulp.dest('dist'))

    fs.readdir('src/', (err, files) => {
      files.forEach(file => {

        if (file != "template.html" && file.endsWith(".html")) {

          var fileContent = fs.readFileSync('src/'+file, "utf8");

          const doc = parse5.parse(fileContent);

          var body = []
          var headers = ""
          var styledef = ""
          var bodyclass = ""
          var selected_side = file.slice(0, -(".html".length))+"-selected"

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
                element.attrs.forEach(function (attr) {
                    if (attr.name === "class") {
                        bodyclass = attr.value
                    }
                });
            }
          })


          gulp.src('src/template.html')
            .pipe(template(
              {content: body,
               style : styledef,
               header : headers,
               active_class : selected_side,
                  body_class : bodyclass
             }
            ))
            .pipe(rename(file))
            .pipe(gulp.dest('dist/'))
        }
      });
    })
})
