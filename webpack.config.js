const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/Projects.js',
  output: {
    filename: 'OutputProjects.js',
    path: path.resolve(__dirname, 'static/js'),
  },
  module: { rules: [
    {
      test: /\.js$/,
      include: [
        path.resolve(__dirname, 'src')
      ],
      use: ['babel-loader'],
    },
  ]},
};