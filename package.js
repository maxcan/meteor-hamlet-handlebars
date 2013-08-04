Package.describe({
  summary: "Jade like HTML templates with closer to HTML syntax",
});

// Npm.depends( {"hamlet": "0.2.0"});

Package.on_use(function (api) {
  api.use(['underscore', 'spark', 'handlebars', 'startup'], 'client');
});

var hamlet_handler = function(bundle, source_path, serve_path, where) {
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  // var hamlet = Npm.require('hamlet').hamlet;
  var html_scanner = Npm.require(path.join(process.env.PACKAGE_DIRS, 'hamlet-handlebars', 'html_scanner'));
  // console.log(path.join(process.env.PACKAGE_DIRS, 'hamlet-handlebars', 'hamlet.js/lib/hamlet.js'));
  var hamlet = Npm.require(path.join(process.env.PACKAGE_DIRS, 'hamlet-handlebars', 'hamlet.js/lib/hamlet.js')).hamlet;
  serve_path = serve_path + '.html';

  // hamlet.templateSettings.interpolate = /\x12\x13\x14\x11foofoo\x11\x11/;
  
  var hamletContents = fs.readFileSync(source_path);
  var html = null;
  try {
    escapedHamlet = hamletContents.toString('utf8').replace(/{{ *#([^}]*)}}/g, "__HAMLET_ESC_START$1__HAMLET_ESC_END__");
    html = hamlet.toHtml(escapedHamlet);
  } catch (e) {
    return bundle.error(
      source_path + ':' +
      (e.location ? (e.location.first_line + ': ') : ' ') +
      e.message
    );
  }
  html = html.replace(/__HAMLET_ESC_START/g,"{{#");
  html = html.replace(/__HAMLET_ESC_END__/g, "}}");
  
  var results = html_scanner.scan(html, source_path);

  if (results.head)
    bundle.add_resource({
      type: "head",
      data: results.head,
      where: where
    });

  if (results.body)
    // console.log("--------- body -------- \n" + results.body.toString());
    bundle.add_resource({
      type: "body",
      data: results.body,
      where: where
    });

  // console.log("wohere:  " + where);
  if (results.js) {
    // console.log("--------- js -------- \n" + results.js.toString());
    var path_part = path.dirname(serve_path);
    if (path_part === '.')
      path_part = '';
    if (path_part.length && path_part !== path.sep)
      path_part = path_part + path.sep;
    var ext = path.extname(source_path);
    var basename = path.basename(serve_path, ext).replace(/\.hamlet.html/g, "");
    serve_path = path_part + "template." + basename + ".js";

    bundle.add_resource({
      type: "js",
      path: serve_path,
      data: results.js, //new Buffer(results.js),
      source_file: source_path,
      where: where
    });
  }
}

Package.register_extension("hamlet", hamlet_handler);

// Package.on_test(function (api) {
//   api.add_files([
//     'coffeescript_tests.coffee',
//     'coffeescript_strict_tests.coffee',
//     'litcoffeescript_tests.litcoffee',
//     'coffeescript_tests.js'
//   ], ['client', 'server']);
// });
