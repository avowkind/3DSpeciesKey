'use strict';

var path = require('path');
var gulp = require('gulp');
var uglify = require("gulp-uglify");
var concat = require('gulp-concat');
var browserify = require('gulp-browserify');
var highlight = require('highlight.js');
var marked = require('marked');
var markdown = require('gulp-markdown');
var refresh = require('gulp-livereload');
var sass = require('gulp-sass');
var express = require("express");
var embedlr = require("gulp-embedlr");
var lr = require('tiny-lr');

var server = lr();
marked.setOptions({
    highlight: function (code) {
        return highlight.highlightAuto(code).value;
    }
});

gulp.task('sass', function () {
    gulp.src('./scss/*.scss')
        .pipe(sass({includePaths: ['scss/includes']}))
        .pipe(gulp.dest('./css'))
        .pipe(refresh(server));
});

gulp.task('generate-steps', function () {
    gulp.src('./steps/*.md')
        .pipe(markdown())
        .pipe(gulp.dest('./steps'))
});

gulp.task('scripts', function () {
    gulp.src('./js/main.js')
        .pipe(browserify({
            shim: {
                'jquery': {
                    path: './bower_components/jquery/jquery.min.js',
                    exports: '$'
                },
                'handlebars': {
                    path: './bower_components/handlebars/handlebars.js',
                    exports: 'Handlebars'
                },
                'impress': {
                    path: './bower_components/impress.js/js/impress.js',
                    exports: 'impress'
                }
            }
        }))
        .pipe(concat('presentation-bundle.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./js'));
});

gulp.task('livereload', function () {
    server.listen(35729, function (err) {
        if (err) return console.log(err);
    });
    gulp.src("**/*.html")
        .pipe(embedlr())
        .pipe(gulp.dest("./"));
});

gulp.task("connect", function () {
    var app = express();
    app.use(express.query())
        .use(express.bodyParser())
        .use(express.static(path.resolve('./')))
        .use(express.directory(path.resolve('./')))
        .use(lr.middleware({ app: app }))
        .listen(9000);
});

gulp.task('watch', function () {
    gulp.watch('./scss/**/*.scss', function () {
        gulp.run('sass');
    });
    gulp.watch('./steps/*.md', function () {
        gulp.run('generate-steps');
    });
    gulp.watch('/js/**/*.js', function () {
        gulp.run('scripts');
    })
});

gulp.task('default', function () {
    gulp.run('livereload', 'connect', 'sass', 'scripts', 'generate-steps', 'watch');
});


