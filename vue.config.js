module.exports = {
  transpileDependencies: ["luch-request"],
  configureWebpack: {
    module: {
      rules: [{
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      }] 
    }
  },
};