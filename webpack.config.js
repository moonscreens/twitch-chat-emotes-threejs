const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './test/main.js',
	mode: 'development',
	output: {
		path: `${__dirname}/dist`,
		filename: 'bundle.js',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './test/index.html',
			filename: 'index.html',
			hash: true,
		}),
	],
	devServer: {
		static: `${__dirname}/dist`,
		compress: true,
		port: 1234,
	},
	module: {
		rules: [
			{
				test: /\.html$/i,
				use: ['html-loader'],
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.png$/i,
				use: ["file-loader"],
			},
		],
	},
};