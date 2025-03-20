// webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const glob = require('glob');
const entries = {};

glob.sync('./src/scripts/**/*.js').forEach((file) => {
  const relativePath = path.relative('./src/scripts', file);
  const name = relativePath.replace('.js', '').replace(/[/\\]/g, '-');
  entries[name] = path.resolve(__dirname, file);
});

module.exports = {
  entry: entries,
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'assets'),
  },
  resolve: {
    alias: {
      '@scripts': path.resolve(__dirname, 'src/scripts'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/fonts'),
          to: path.resolve(__dirname, 'assets'),
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]',
        },
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  mode: 'production',
  stats: 'minimal',
};
