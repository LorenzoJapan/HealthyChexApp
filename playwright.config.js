const {defineConfig} = require('@playwright/test');
module.exports = defineConfig({testDir:'./tests',testIgnore:'unit/**',use:{launchOptions:{executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome',args:['--no-sandbox']}},reporter:'list'});
