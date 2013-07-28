Package.describe({
  summary: "Jade like HTML templates with closer to HTML syntax",
});

Npm.depends(
    {"hamlet": "0.2.0"}
    );

Package.on_use(function (api) { api.use('handlebars', 'client'); });

var hamlet_handler = function(bundle, source_path, serve_path, where) {
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var hamlet = Npm.require('hamlet').hamlet;
  var html_scanner = Npm.require(path.join(process.env.PACKAGE_DIRS, 'hamlet', 'html_scanner'));
  serve_path = serve_path + '.html';

  var hamletContents = fs.readFileSync(source_path);
  var html = null;
  try {
    html = hamlet.toHtml(hamletContents.toString('utf8'));
  } catch (e) {
    return bundle.error(
      source_path + ':' +
      (e.location ? (e.location.first_line + ': ') : ' ') +
      e.message
    );
  }

  console.log("where: " + where + ": serving: " + source_path + " to : " + serve_path + " val: " + html );
  // var contents = new Buffer(html);
  // bundle.add_resource({ type: "body", data: html, where: where });
  //
  // var html_scanner = Package._require('html_scanner.js');
  var results = html_scanner.scan(html, source_path);

  if (results.head)
    bundle.add_resource({
      type: "head",
      data: results.head,
      where: where
    });

  if (results.body)
    bundle.add_resource({
      type: "body",
      data: results.body,
      where: where
    });

  if (results.js) {
    var path_part = path.dirname(serve_path);
    if (path_part === '.')
      path_part = '';
    if (path_part.length && path_part !== path.sep)
      path_part = path_part + path.sep;
    var ext = path.extname(source_path);
    var basename = path.basename(serve_path, ext);
    serve_path = path_part + "template." + basename + ".js";

    bundle.add_resource({
      type: "js",
      path: serve_path,
      data: new Buffer(results.js),
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
