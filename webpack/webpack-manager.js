const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack              = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const VueLoaderPlugin      = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin    = require('html-webpack-plugin');
const TerserPlugin         = require("terser-webpack-plugin");
const CssMinimizerPlugin   = require('css-minimizer-webpack-plugin');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const path                 = require('path');
const fs                   = require('fs');
const config               = require('../src/config');

const WEBPACK_HOT_MIDDLEWARE_CLIENT = 'webpack-hot-middleware/client?noInfo=true&reload=true';

class WebpackManager {

    joinPath(...parts) {
        let result = path.normalize(path.join(...parts));
        if (result) {
            result = result.replace(/(\\|\/)/g, path.sep);
        }
        return result;
    }

    joinPathCwd(...parts) {
        return this.joinPath(process.cwd(), ...parts);
    }

    resolveNodeModule(prod, dev = undefined) {
        let path = config.isDev
            ? (dev || prod)
            : prod;
        return path
            ? this.joinPathCwd('node_modules', path)
            : this.joinPathCwd('webpack', 'empty-module');
    }

    getFolderNames(...parts) {
        let folderPath  = this.joinPathCwd(...parts);
        return fs.readdirSync(folderPath)
            .filter((p) => fs.lstatSync(this.joinPath(folderPath, p)).isDirectory())
            .map((p) => path.basename(p));
    }

    getConfig() {
        return {
            mode         : config.nodeEnv,
            target       : 'web',
            devtool      : false,
            entry        : this.getEntry(),
            output       : this.getOutput(),
            resolve      : {
                extensions : ['.ts', '.js', '.vue'],
                alias      : this.getResolveAliases()
            },
            module       : {
                rules : this.getModuleRules()
            },
            plugins      : this.getPlugins(),
            optimization : this.getOptimization(),
            stats        : {
                children: false
            }
        }
    }

    getEntry() {
        let result = {};

        let pages = config.app.pages || [];
        pages.forEach((page) => {
            this.getFolderNames(page.path).forEach((pageName) => {
                let pageEntry = result[pageName] || (result[pageName] = []);
                if (!pageEntry.length && config.isDev) {
                    pageEntry.push(WEBPACK_HOT_MIDDLEWARE_CLIENT);
                }
                let pageEntryPath = this.joinPathCwd(page.path, pageName);
                if (pageEntry.indexOf(pageEntryPath) < 0) {
                    pageEntry.push(pageEntryPath);
                }
            });
        });

        return result;
    }

    getOutput() {
        let suffix     = config.isDev ? '' : '.[chunkhash]';
        let publicPath = config.app.prefix ? `/${config.app.prefix}/` : '/';
        return {
            path          : this.joinPathCwd(`dist/client/${config.nodeEnv}`),
            publicPath    : publicPath,
            filename      : `js/[name]${suffix}.js`,
            chunkFilename : `js/[id]${suffix}.js`,
            clean         : true
        };
    }

    getResolveAliases() {
        return {
            'vuetify/lib'              : this.resolveNodeModule('vuetify/lib',              'vuetify'),
            'vuetify/dist/vuetify.css' : this.resolveNodeModule('',                         'vuetify/dist/vuetify.css'),
            /*'axios'                    : this.resolveNodeModule('axios/dist/axios.min.js',  'axios/dist/axios.js'),
            'moment$'                  : this.resolveNodeModule('moment/min/moment.min.js', 'moment'),*/
        }
    }

    getModuleRules() {
        return [{
            test   : /\.vue$/,
            loader : 'vue-loader'
        },{
            test : /\.css$/i,
            use  : [ MiniCssExtractPlugin.loader, 'css-loader' ],
        },{
            test : /\.less$/,
            use  : [ MiniCssExtractPlugin.loader, 'css-loader', 'less-loader' ],
        },{
            test : /\.sass$/,
            use  : [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader' ],
        },

            this.getAssetResourceRule('fonts', /\.(woff2?|eot|ttf|otf)(\?.*)?$/),

            this.getAssetResourceRule('images', /\.(png|jpg|gif)$/),

            this.getAssetResourceRule('images', /\.svg$/)

         ];
    }

    getAssetResourceRule(folder, test) {
        let suffix = config.isDev ? '' : '.[hash]';
        return {
            test,
            type      : 'asset/resource',
            generator : {
                filename: `${folder}/[name]${suffix}[ext]`
            }
        }
    }

    getPlugins() {
        let cssSuffix = config.isDev ? '' : '.[contenthash]';

        let result = [
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/,
            }),

            new MiniCssExtractPlugin({
                filename      : `css/[name]${cssSuffix}.css`,
                chunkFilename : `css/[id]${cssSuffix}.css`
            }),

            new webpack.ProgressPlugin(),

            new VueLoaderPlugin()
        ];

        let pages = config.app.pages || [];
        pages.forEach((page) => {
            this.getFolderNames(page.path).forEach((pageName) => {
                result.push(new HtmlWebpackPlugin({
                    inject   : 'body',
                    minify   : true,
                    template : this.joinPathCwd(`${page.path}/template.html`),
                    filename : `${pageName}.html`,
                    chunks   : [pageName]
                }));
            });
        });

        if (config.isDev) {
            result.push(
                new webpack.ids.HashedModuleIdsPlugin({
                    hashFunction     : 'md4',
                    hashDigest       : 'hex',
                    hashDigestLength : 16,
                }),
                new webpack.HotModuleReplacementPlugin(),
            );
        } else {
            result.push(new VuetifyLoaderPlugin());
            if (config.webpack.analyze) {
                result.push(new BundleAnalyzerPlugin({ openAnalyzer : true }));
            }
        }
        return result;
    }

    getOptimization() {

        let minimizer = config.isProd ? [
            new TerserPlugin({
                terserOptions : {
                    format : { comments: false },
                },
                exclude : /[\\/]node_modules[\\/]/,
                extractComments: false,
            }),
            new CssMinimizerPlugin({
                minimizerOptions : {
                    preset : ['default', {
                        discardComments : { removeAll: true },
                    }],
                },
            })
        ] : [];

        let result = {
            minimize     : config.isProd,
            minimizer    : minimizer,
            runtimeChunk : {
                name : 'manifest'
            },
            splitChunks: {
                chunks      : 'all',
                minSize     : 1,
                cacheGroups : {
                    vendors : {
                        name     : 'vendors',
                        test     : /[\\/]node_modules[\\/]/,
                        priority : 1
                    },
                    core : {
                        name     : 'core',
                        test     : /[\\/]client[\\/]core[\\/]/,
                        priority : 2
                    },
                    common : {
                        name     : 'common',
                        test     : /[\\/]client[\\/]common[\\/]/,
                        priority : 3
                    },
                    locales : {
                        name     : 'locales',
                        test     : /[\\/]client[\\/]locales[\\/]/,
                        priority : 4
                    }
                }
            }
        };

        return result;
    }
}

module.exports = WebpackManager;