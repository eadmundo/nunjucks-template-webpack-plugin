import path from 'path';
import nunjucks from 'nunjucks';

function TemplateWebpackPlugin (options) {
  this.options = Object.assign({}, {
    assetsRegex: /\.(jpe?g|png|gif|svg)$/
  }, options)
}

TemplateWebpackPlugin.prototype = {

  constructor: TemplateWebpackPlugin,

  apply: function (compiler) {
    var self = this;
    var assets = {};

    var renderedTemplatePath = path.join(compiler.options.output.path, self.options.filename)

    compiler.plugin('compilation', function(compilation, params) {

      compilation.plugin('module-asset', function(module, hashedFile) {
        var file = path.join(path.dirname(hashedFile), path.basename(module.userRequest));
        var renderedAssetPath = path.join(compiler.options.output.path, hashedFile)
        assets[file] = path.relative(path.dirname(renderedTemplatePath), renderedAssetPath);
      })

    })
    compiler.plugin('emit', function(compilation, callback) {
      nunjucks.configure('', { autoescape: true });
      var res = nunjucks.render(self.options.template, { assets: assets });
      compilation.assets[self.options.filename] = {
        source: function() {
          return res;
        },
        size: function() {
          return res.length;
        }
      }
      callback();
    })
  }

}

module.exports = TemplateWebpackPlugin;