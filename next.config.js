module.exports = {
  target: 'serverless',
  webpack: (cfg) => {
    cfg.module.rules.push(
      {
        test: /\.md$/,
        use: 'raw-loader'
      }
    )
    return cfg;
  }
}