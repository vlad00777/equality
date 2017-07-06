'use strict';
// Объявление Gulp модлей
var gulp = require('gulp'); // сборщик gulp
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var rimraf = require('rimraf');
var argv = require('yargs').argv;
var fs = require('fs');
var path = require('path');
var vinylFtp = require( 'vinyl-ftp' );
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var combineMq = require('gulp-combine-mq');
var replace = require('gulp-replace');
var clean = require('gulp-clean');
// Проверка флага запуска --prod
var PRODUCTION = !!(argv.prod);

// ОСНОВНОЙ КОНФИГ
// Конфиг шаблона
var TEMPLATE = {
    version: '4.0.0', //Версия шаблона
    notifier:false
};
//Конфиг для текущего проекта
var PROJECT = {
    name: 'equality', //Название проекта.
    bs_port: 4000, //Порт для Browser-sync
    responsive: true, //Тип - верстки, true - адаптивная
    cms: false //true - если подключен к CMS_PATHS(Пока поддержка только WezomCMS)
};
//Конфиг для Browser-sync(BS)
var BS = {
    use: true, // Флаг включения BS
    static: false, // Использовать встроенные или работать через прокси
    proxy: 'http://ibif/' + PROJECT.name + '/' //Ссылка, которую перехватит BS
};
//Конфиг для FTP
var FTP = {
    host: '91.206.30.13', //Хост или IP Адрес
    user: 'inkubator', //Имя пользователя
    pass: '9H9w4Z4a', //Пароль
    remotePath: 'www/inkubator.ks.ua/html/' + PROJECT.name + '/' //Путь к папке (по умолчанию совпадает с названием проекта)
};
//Наборы расширений файлов
var EXT = {
    styles: '*.{css,scss,sass}', // раширения файлов стилей
    jade: '*.jade', // раширения файлов jade
    js: '*.js',  // раширения файлов скриптов
    minjs: '*.min.js', // расширения файлов минифицированных скрпитов
    jsons: '*.{json,jsonp}',  // раширения файлов json'ов
    // php : '*.php', // раширения файлов php
    img: '**/*.{png,gif,jpg,jpeg,svg}', // раширения файлов изображений
    fonts: '**/*.{ttf,eot,woff,woff2,svg}'  // раширения файлов шрифтов
};

//	КОНФИГ ПУТЕЙ
// точка относительного пути от gulpfile.js
var ROOT = './';

// Конфиг путей
var SRC_DIR = ROOT + 'src/';
var TMP_DIR = ROOT + 'tmp/';
var SRC_PATHS = {
    styles: {
        root: SRC_DIR + 'Styles/'
    },
    jade: {
        root: SRC_DIR + 'Jade/',
        views: SRC_DIR + 'Jade/Views/',
        inlineFiles: SRC_DIR + 'Jade/inlineFiles/'
    },
    scripts: {
        root: SRC_DIR + 'Scripts/',
        inline: SRC_DIR + 'Scripts/inline/'
    },
    hidden: SRC_DIR + '/Hidden/',

    media: {
        root: SRC_DIR + 'MediaFiles/',
        images: SRC_DIR + 'MediaFiles/{Images,Pic}/',
        fonts: SRC_DIR + 'MediaFiles/Fonts/',
        sprite: SRC_DIR + 'MediaFiles/SvgSprite/',
        favicons: SRC_DIR + 'MediaFiles/Favicons/'

    }


};
var DEV_DIR = 'dist/';
var TEMP_STYLES = 'temp/css';
var DEV_PATHS = {
    styles: DEV_DIR + 'css/',
    scripts: DEV_DIR + 'js/',
    jsons: DEV_DIR + 'jsons/',
    hidden: DEV_DIR + 'hidden/',
    fonts: DEV_DIR + 'fonts/',
    favicons: DEV_DIR + 'favicons/'
};
var CMS_PATHS = {
    root:'../',
    css:'../Media/css/',
    js:'../Media/js/',
    jsons:'../Media/js/jsons/',
    mediaroot: '../Media/',
    favicons:'../Media/favicons/',
    fonts:'../Media/fonts/'
};


var LOCALS = {
    version: TEMPLATE.version,
    project: PROJECT.name,
    responsive:PROJECT.responsive,
    // передача глобальных путей в JADE шаблоны
    base: SRC_DIR,
    paths: SRC_PATHS,
    production: PRODUCTION
};

//Параметры плагинов
var PLUGIN_PARAMS = {
    Plumber: {
        errorHandler: $.notify.onError("Error: <%= error.message %>")
    },
    CssNano: {
        zindex: false,
        autoprefixer: false
    },
    Jade: {
        locals: LOCALS,
        pretty: '\t'
    },
    Autoprefixer: {
        browsers: [
            'ie >= 9',
            'ie_mob >= 10',
            'ff >= 30',
            'chrome >= 34',
            'safari >= 7',
            'opera >= 23',
            'ios >= 7',
            'android >= 4.4',
            'bb >= 10'
        ],
        cascade: false
    },
    ValidHTML: {
        suffs: {},
        format: 'html'
    },
    renameMin: {
        suffix: '.min'
    },
    Sass: {

    }
    // configValidCSS : {
    // 	'lang': 'ru',
    // 	'filename': '_csslint-report.html',
    // 	'directory': _valid.css
    // },
};
var WATCH_PATHS = {
    Styles: path.join(SRC_PATHS.styles.root, '**', EXT.styles),
    ScriptsInline: [SRC_PATHS.scripts.inline + EXT.js],
    Scripts: [path.join(SRC_PATHS.scripts.root, '/**/', EXT.js), '!' + SRC_PATHS.scripts.inline + EXT.js],
    JadeViews: path.join(SRC_PATHS.jade.views, '**', EXT.jade),
    JadeAll: [path.join(SRC_PATHS.jade.root, '**/*.jade'),'!'+path.join(SRC_PATHS.jade.views, '**', EXT.jade)],
    Hidden: path.join(SRC_PATHS.hidden, '**'),
    Sprite: path.join(SRC_PATHS.media.sprite, EXT.jsons),
    Images: path.join(SRC_PATHS.media.images , EXT.img),
    Fonts: path.join(SRC_PATHS.media.fonts, EXT.fonts),
    Favicons_transfer: path.join(SRC_PATHS.media.favicons, EXT.img)

};
var STAGE_POINTS = {
  favicons:false,
    inline_scripts:false
};
var compiled = function () {
    return "<%= file.relative %>\nwas complied";
};
/*--------------------------- Задачи сборщика ---------------------------*/


gulp.task(combineMq1);
gulp.task(Clean);
gulp.task(Styles);
gulp.task(Fonts);
gulp.task(Favicons);
gulp.task(Favicons_transfer);
gulp.task(ScriptsInline);
gulp.task(Scripts);
gulp.task(JadeViews);
gulp.task(JadeAll);
gulp.task(Images);
gulp.task(Sprite);
gulp.task(BrowserSync);
gulp.task('Build', gulp.series(
    Clean,
    gulp.parallel(
        Styles,
        Scripts,
        Sprite,
        Images,
        Favicons_transfer,
        gulp.series(
            gulp.parallel(
                ScriptsInline
            ),
            JadeViews
        )
    ),
    combineMq1,
            changeSRC,
            changeSRCHTML,
            removeCSS,
            cookies,
            removeTemplate
));
gulp.task('Watch', function () {
    $.autowatch(gulp, WATCH_PATHS);
});


gulp.task('Finish',function(){
    gulp.series(
        combineMq1,
        changeSRC,
        changeSRCHTML,
        removeCSS,
        cookies,
        removeTemplate
    );
});

gulp.task('default', gulp.parallel(['Watch'], BrowserSync));
/** Deleting the project build folder */
function Clean(done) {
    rimraf(DEV_DIR, done);
}


function combineMq1(done) {
    return gulp.src('dist/css/style.css')
        .pipe($.combineMq({
            beautify: true
        }))
        .pipe(gulp.dest('dist/'));
    done();
}

function changeSRC(){
    return gulp.src('dist/*.html')
        .pipe(replace('css/style.css', 'style.css'))
        .pipe(gulp.dest('dist/'));
}

function changeSRCHTML(done){
    return gulp.src('dist/style.css')
        .pipe(replace('../', ''))
        .pipe(gulp.dest('dist/'));
    done();
}

function cookies(done){
    return gulp.src('src/polityka_cookies.pdf')
        .pipe(gulp.dest('dist/'));
    done();
}

function removeCSS(done){
    return gulp.src('dist/css/style.css', {read: false})
    .pipe(clean());
    done();
}

function removeTemplate(done){
    return gulp.src('dist/partner_template.html', {read: false})
    .pipe(clean());
    done();
}



// gulp.task(Styles)
function Styles(done) {
    var folders = getFolders(SRC_PATHS.styles.root);
    folders.map(function (folder) {
        return gulp.src(path.join(SRC_PATHS.styles.root, folder, EXT.styles))
           // .pipe($.sourcemaps.init()) //Начало записи sourcemaps
            .pipe($.wrap('/*<%= file.relative %>*/\n<%= contents %>'))
            .pipe($.sass(PLUGIN_PARAMS.Sass).on('error', $.sass.logError)) //Построение CSS из SASS/SCSS
            .pipe($.concat(folder + '.css'))//конкатенация всех файлов, содержащихся в папке
            .pipe($.autoprefixer(PLUGIN_PARAMS.Autoprefixer)) //Автопрефиксер
            .pipe($.csscomb()) //Автопрефиксер
            .pipe($.changed(DEV_PATHS.styles))
            //.pipe($.sourcemaps.write('maps')) // Запись sourcemaps
            .pipe(gulp.dest(DEV_PATHS.styles)) // Сохранение минифицированного файла
            .pipe($.if(PROJECT.cms,gulp.dest(CMS_PATHS.css)))
            .pipe($.if(BS.use, browserSync.stream({match: "**/*.css"})))
            .pipe($.if(TEMPLATE.notifier,$.notify({title: "SASS", message: compiled()})))
    });
    done()
}
function ScriptsInline(done) {
    gulp.src([SRC_PATHS.scripts.inline + EXT.js], {since: gulp.lastRun(ScriptsInline)})
        .pipe($.plumber(PLUGIN_PARAMS.Plumber))
        .pipe($.rename(PLUGIN_PARAMS.renameMin))
        .pipe($.uglify())
        .pipe(gulp.dest(SRC_PATHS.jade.inlineFiles))
        .pipe($.if(BS.use, browserSync.stream()))
        .pipe($.if(TEMPLATE.notifier,$.notify({
            title: "Inline Scripts",
            message: compiled()
        })));
    STAGE_POINTS.inline_scripts = true;
    done();
}
function Scripts(done) {
    var folders = getFolders(SRC_PATHS.scripts.root);
    folders.map(function (folder) {
        return gulp.src([path.join(SRC_PATHS.scripts.root, folder, '/**/', EXT.js), '!' + SRC_PATHS.scripts.inline + EXT.js])
            //.pipe($.sourcemaps.init()) //Начало записи sourcemaps
            .pipe($.wrap('/*<%= file.relative %>*/\n<%= contents %>'))
            .pipe($.concat(folder + '.js'))
            .pipe($.changed(DEV_PATHS.scripts))
            //.pipe($.sourcemaps.write('maps'))
            .pipe(gulp.dest(DEV_PATHS.scripts))
            .pipe($.if(PROJECT.cms,gulp.dest(CMS_PATHS.js)))
            .pipe($.if(BS.use, browserSync.stream()))
            .pipe($.if(TEMPLATE.notifier,$.notify({title: "SCRIPTS", message: compiled()})))
    });
    done();
}
/**
 * Common Jade2HTML function
 * @param {string} src - Source path of jade files.
 * @param {string} dest - Destination folder of compiled files
 * @param {string} param - Additional parameter 'allViews' or 'Views'
 */
function Jade2HTML(src, dest, param) {
    return gulp.src(src)
        .pipe($.if(param !== "allViews", $.cached(param)))
        .pipe($.jade(PLUGIN_PARAMS.Jade))
        .pipe($.rename(function (path) {
            path.basename = path.basename.toLowerCase();
        }))
        .pipe(gulp.dest(dest))
        .pipe($.if(BS.use, browserSync.stream({once: true})))
        .pipe($.if(TEMPLATE.notifier,$.notify({
            title: "jade",
            message: compiled()
        })));
}

function JadeViews() {
    return Jade2HTML( path.join(SRC_PATHS.jade.views, '**', EXT.jade), DEV_DIR, 'Views');

}
function JadeAll() {
    return Jade2HTML(path.join(SRC_PATHS.jade.views, '**', EXT.jade), DEV_DIR, 'allViews');

}

function Hidden() {
    return gulp.src(path.join(SRC_PATHS.hidden,'*.*'))
        .pipe($.if('*.jade',$.jade(PLUGIN_PARAMS.Jade)))
        .pipe($.rename(function(path){
            if (path.extname == '.html') {
                path.extname = '.php'
            }
        }))
        .pipe(gulp.dest(DEV_PATHS.hidden));
}

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}
function Images() {
    return gulp.src([SRC_PATHS.media.images + EXT.img])
        .pipe($.changed(DEV_DIR),{hasChanged: $.changed.compareSha1Digest})
        .pipe($.imagemin({optimizationLevel: 5}))
        .pipe($.rename(function (path) {
            path.dirname = path.dirname.toLowerCase();
            path.basename = path.basename.toLowerCase();
        }))
        .pipe(gulp.dest(DEV_DIR))
        .pipe($.if(PROJECT.cms,gulp.dest(CMS_PATHS.mediaroot)))
        .pipe($.if(BS.use, browserSync.stream()))
        .pipe($.if(TEMPLATE.notifier,$.notify({title: "Images", message: compiled()})));
}
/**
 * @param {string} src - Source path of transferred files.
 * @param {string} dest - Destination folder of transferred files
 * @param {string} media_dest - Destination folder of transferred files in CMS structure
 */
function Transfer(src, dest, media_dest) {
    media_dest = media_dest || '';
    return gulp.src(src)
        .pipe($.changed(dest))
        .pipe(gulp.dest(dest))
        .pipe($.if(PROJECT.cms  && media_dest !== '',gulp.dest(media_dest)))
        .pipe($.if(TEMPLATE.notifier,$.notify({
            title: "transfer",
            message: compiled()
        })));
}
function Fonts() {
    return Transfer(SRC_PATHS.media.fonts + EXT.fonts, DEV_PATHS.fonts,CMS_PATHS.fonts)
}

function Sprite() {
    return SVGSprite(path.join(SRC_PATHS.media.sprite,EXT.jsons), DEV_PATHS.jsons,CMS_PATHS.jsons)
}
function SVGSprite(src, dest, media_dest) {
    return gulp.src(src)
        .pipe($.jsonConcat('svgsprite' + '.json', function (data) {
            var stringData = '{';
            var enter = '\n\t';
            var enterDouble = enter + '\t';
            var enterTriple = enterDouble + '\t';
            for (var key in data) {
                var namerId = '"' + key + '": {';
                var params = data[key];
                stringData += enter + namerId;
                for (var param in params) {
                    var values = params[param];
                    stringData += enterDouble + '"' + param + '": ';
                    if (param == 'viewBox') {
                        stringData += '"' + values + '",';
                    } else {
                        var paramString = '[' + enterTriple + '%sss%' + enterDouble + '],';
                        var arr = [];
                        for (var i = 0; i < values.length; i++) {
                            var val = JSON.stringify(values[i]);
                            arr.push(val);
                        }
                        stringData += paramString.replace(/%sss%/g, arr.join(',' + enterTriple))
                    }
                }
                stringData = stringData.slice(0, -1);
                stringData += enter + '},';
            }
            stringData = stringData.slice(0, -1);
            stringData += '\n}';
            return new Buffer(stringData);
        }))
        .pipe(gulp.dest(dest))
        .pipe($.if(PROJECT.cms,gulp.dest(media_dest)))
        .pipe($.if(TEMPLATE.notifier,$.notify({
            title: 'SVGSprite',
            message: compiled()
        })));
}


// File where the favicon markups are stored
var FAVICON_DATA_FILE = SRC_PATHS.media.favicons + 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
function Favicons(done) {
    $.realFavicon.generateFavicon({
        masterPicture: SRC_PATHS.media.favicons + 'favicon_master.png',
        dest: SRC_PATHS.media.favicons,
        iconsPath: 'favicons/',
        design: {
            ios: {
                pictureAspect: 'noChange',
                master_picture: {}
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#da532c',
                onConflict: 'override'
            },
            androidChrome: {
                pictureAspect: 'noChange',
                themeColor: '#ffffff',
                manifest: {
                    name: PROJECT.name,
                    display: 'browser',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                }
            },
            safariPinnedTab: {
                pictureAspect: 'silhouette',
                themeColor: '#5bbad5'
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function () {
        STAGE_POINTS.favicons=true;
        done();
    });

}
function Favicons_transfer(done) {
    Transfer(path.join(SRC_PATHS.media.favicons,'favicon.ico'),DEV_DIR,CMS_PATHS.root);
    done();
}
/*------------------------------  browserSync  -----------------------------*/
function BrowserSync(done) {
    if (BS.use) {
        if (BS.static) {
            browserSync.init({
                server: {
                    baseDir: DEV_DIR
                },
                open: false,
                port: PROJECT.bs_port
            });
        } else {
            browserSync.init({
                proxy: BS.proxy, // URL по которому можно открыть сайт.
                open: false, // Не открывать новую вкладку при запуске задачи.
                port: PROJECT.bs_port


            });
        }
    } else {
        console.log('Browser is disabled');
    }
    done()
}
/*-------------------------------  gulp-zip  ------------------------------*/
gulp.task('Zip', function () {
    return gulp.src(DEV_DIR)
        .pipe($.zip(PROJECT.name + '.zip'))
        .pipe(gulp.dest(ROOT));
});

gulp.task('bases', function() {
    return gulp.src('src/bases/**/*')
        .pipe(gulp.dest('dist/bases'))
});

var fontName = "myfont";
gulp.task('iconfont', function(){
    gulp.src(['icons/*.svg'])
        .pipe(iconfontCss({
            fontName: fontName,
            path: '_icons.scss',
            targetPath: 'icons.scss',
            fontPath: 'fonts/'
        }))
        .pipe(iconfont({
            fontName: fontName,
            prependUnicode: true,
            formats: ['ttf', 'eot', 'woff','woff2'],
            normalize:true,
            fontHeight: 1001
        }))
        .pipe(gulp.dest('src/MediaFiles/Fonts'));
});


gulp.task("changeSRC2", function(){
    return gulp.src('dist/*.html')
        .pipe(replace('css/style.css', 'style.css'))
        .pipe(gulp.dest('dist/'));
});



/*-------------------------------  gulp-ftp  ------------------------------*/
gulp.task('Upload', function () {
    var conn = vinylFtp.create( {
        host: FTP.host,
        user: FTP.user,
        password: FTP.pass,
        parallel: 10
    } );
    return gulp.src(DEV_DIR + '/**/*')
        .pipe( conn.newer(FTP.remotePath) ) // only upload newer files
        .pipe( conn.dest(FTP.remotePath) )
        .pipe($.if(TEMPLATE.notifier,$.notify({
            title: 'Upload complete',
            message: compiled()
        })));
});
