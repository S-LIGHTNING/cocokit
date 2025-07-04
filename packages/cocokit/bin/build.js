const prompts = require('@clack/prompts')
const chalk = require('chalk')
const cckPackage = require('../package.json')
const build = require('./build-tool')

// 打包控件
module.exports = async (inputPath) => {

    prompts.intro(chalk.blue.bold('CoCoKit') + chalk.gray('  v'+cckPackage.version))

    const load = prompts.spinner()

    try {
        build(inputPath, {
            onBuildStart() {
                load.start('正在打包..')
            },
            onBuildFinish(stats) {
                if (!stats) {
                    return
                }
                if (stats.errors) {
                    load.stop('打包出错啦')
                    // 输出错误信息
                    if (Array.isArray(stats.errors)) {
                        stats.errors.forEach(msg => console.error(msg.message))
                    } else {
                        console.error(stats.errors)
                    }
                }
                if (!stats.outputs) {
                    return
                }
                load.stop('打包完成! (/≧▽≦)/')
                console.log(chalk.gray('│'))
                stats.outputs.forEach(({ path, version, fileSize }) => {
                    console.log(chalk.gray('│  ') + chalk.bold(path.padEnd(stats.maxLength ?? 0)) + chalk.cyan(`\tv${version}\t`) + chalk.gray(`${fileSize} kB`))
                })
                prompts.outro(chalk.green(`共打包 ${stats.outputs.length} 个控件  `) + chalk.gray(`耗时 ${stats.time}s`))
            }
        })
    } catch (error) {
        load.stop('已停止打包')
        prompts.outro(chalk.red(error.message))
        return process.exit(1)
    }
}