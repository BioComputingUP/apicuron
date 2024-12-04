// const { ConcatSource } = require('webpack-sources'); // Import webpack-sources
const { Compilation } = require('webpack');

class ConcatFilesPlugin {
  constructor (result_bundle_name) {
    this.result_bundle_name = result_bundle_name;
  }
  apply(compiler) {
    // Hook into the 'compilation' phase
    compiler.hooks.thisCompilation.tap('ConcatFilesPlugin', (compilation) => {

      // Hook into the processAssets stage
      compilation.hooks.processAssets.tap(
        {
          name: 'ConcatFilesPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS, // The stage where you can add assets
        },
        (assets) => {
          let concatenatedContent = '';
          const fileNames = Object.keys(assets);
          const bundles = ['runtime', 'polyfills', 'main'];

          // Loop through all the assets and find JavaScript files
          bundles.forEach((fileName) => {
            const fileNameFound = fileNames.find((name) => name.startsWith(fileName) && name.endsWith('.js'));
            if(!fileName){
              console.warn(`file: ${filename} not found`)
              return
            }
            const asset = assets[fileNameFound];
            const fileContent = asset.source();

            // Concatenate the file contents
            concatenatedContent += fileContent + '\n';
          });



          // Add the new concatenated file to the assets
          compilation.emitAsset(
            this.result_bundle_name, // The name of the new file
            new compiler.webpack.sources.RawSource(concatenatedContent) // Content of the new file
          );
        }
      );
    });
  }
}

module.exports = {
  plugins: [
    new ConcatFilesPlugin('../../src/assets/widgets/apicuron-leaderboard.js'),  // Use the custom plugin to merge all JS chunks
  ],
  // optimization: {
  //   splitChunks: false,  // Disable code splitting to avoid multiple chunks
  //   runtimeChunk: false, // Avoid separating runtime chunks
  // },
  // output: {
  //   // Allow Webpack to generate default filenames (e.g., main.js, runtime.js)
  //   filename: '[name].[contenthash].js',  // Ensure unique filenames for chunks
  // },
};
