Package.describe({
  summary: "Jade like HTML templates with closer to HTML syntax"
  environments: ['server']
});

Npm.depends({"hamlet": "0.2.0"});

var coffeescript_handler = function(bundle, source_path, serve_path, where) {
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var Hamlet = Npm.require('hamlet');
  serve_path = serve_path + '.html';

  var contents = fs.readFileSync(source_path);
  try {
    contents = Hamlet.toHtml(contents.toString('utf8'));
  } catch (e) {
    return bundle.error(
      source_path + ':' +
      (e.location ? (e.location.first_line + ': ') : ' ') +
      e.message
    );
  }

  contents = new Buffer(contents);
  bundle.add_resource({
    type: "js",
    path: serve_path,
    data: contents,
    where: where
  });
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
