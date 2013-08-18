var path = Npm.require('path');
var hamlet = Npm.require(path.join(process.env.PACKAGE_DIRS, 'hamlet-handlebars', 'hamlet.js/lib/hamlet.js')).hamlet;
var fs = Npm.require('fs');

Plugin.registerSourceHandler("hamlet", function (compileStep) {
  // XXX use archinfo rather than rolling our own
  if (! compileStep.arch.match(/^browser(\.|$)/))
    // XXX might be nice to throw an error here, but then we'd have to
    // make it so that packages.js ignores html files that appear in
    // the server directories in an app tree.. or, it might be nice to
    // make html files actually work on the server (against jsdom or
    // something)
    return;

  // XXX the way we deal with encodings here is sloppy .. should get
  // religion on that
  var hamletRaw = compileStep.read().toString('utf8');
  try {
    var hamletEscaped =
      hamletRaw.toString('utf8').replace(/{{ *#([^}]*)}}/g, "__HAMLET_ESC_START$1__HAMLET_ESC_END__");
    var html = hamlet.toHtml(hamletEscaped);
    html = html.replace(/__HAMLET_ESC_START/g,"{{#");
    html = html.replace(/__HAMLET_ESC_END__/g, "}}");
    var results = html_scanner.scan(html, compileStep.inputPath);
  } catch (e) {
    if (e instanceof html_scanner.ParseError) {
      compileStep.error({
        message: e.message,
        sourcePath: compileStep.inputPath,
        line: e.line
      });
      return;
    } else
      throw e;
  }

  if (results.head)
    compileStep.appendDocument({ section: "head", data: results.head });

  if (results.body)
    compileStep.appendDocument({ section: "body", data: results.body });

  if (results.js) {
    var path_part = path.dirname(compileStep.inputPath);
    if (path_part === '.')
      path_part = '';
    if (path_part.length && path_part !== path.sep)
      path_part = path_part + path.sep;
    var ext = path.extname(compileStep.inputPath);
    var basename = path.basename(compileStep.inputPath, ext);

    // XXX generate a source map

    compileStep.addJavaScript({
      path: path.join(path_part, "template." + basename + ".js"),
      sourcePath: compileStep.inputPath,
      data: results.js
    });
  }
});
