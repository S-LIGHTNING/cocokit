#! /usr/bin/env node
const prompts = require('@clack/prompts')
const shell = require('shelljs')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')


// 项目配置文件模板
const packageJson = {
    name: "cocokit-project",
    version: "0.1.0",
    scripts: {
        "build": "cocokit build",
        "watch": "cocokit watch",
        "start": "cocokit serve"
    },
    dependencies: {
        "cocokit": ""
    },
    devDependencies: {
        "@babel/core": "^7.26.10",
        "@babel/preset-env": "^7.26.9",
        "@babel/preset-react": "^7.26.3",
        "babel-loader": "^10.0.0",
        "terser-webpack-plugin": "^5.3.14",
        "webpack": "^5.99.7",
        "webpack-cli": "^6.0.1",
        "webpack-dev-server": "^5.2.2"
    },
    build_config: {
        "前缀标签": "",
        "加版本号": true,
    }
}


// 获取最新版本号
async function getLatestVersion(packageName) {
    return new Promise((resolve) => {
        shell.exec(`npm view ${packageName} version --silent`, { silent: true }, (code, stdout) => {
            resolve(code === 0 ? `^${stdout.trim()}` : null)
        })
    })
}


// 初始化项目
async function init() {
    console.log()
    prompts.intro(chalk.blue.bold('创建 CoCoKit 项目'))

    // 获取最新的 CoCoKit 版本
    const cocokitVersion = await getLatestVersion('cocokit')
    if (!cocokitVersion) {
        prompts.cancel("无法获取最新的 CoCoKit 版本号")
        return process.exit(0)
    }
    packageJson.dependencies['cocokit'] = cocokitVersion


    // 1. 设置项目名称
    const projectName = await prompts.text({
        message: '项目名称：',
        placeholder: '我的控件库',
        validate: (value) => {
            if (!value.trim()) return '请输入项目名称'
            if (shell.test('-d', value)) return '文件夹已存在'
        }
    })
    if (prompts.isCancel(projectName)) {
        prompts.cancel("已取消创建项目")
        return process.exit(0)
    }


    // 2. 设置控件前缀标签
    const addPrefixText = await prompts.confirm({
        message: '添加控件前缀标签？',
        initialValue: true,
    })
    if (prompts.isCancel(addPrefixText)) {
        prompts.cancel("已取消创建项目")
        return process.exit(0)
    }
    if (addPrefixText) {
        const prefixText = await prompts.text({
            message: '设置你的自定义前缀标签：',
            placeholder: 'Qii',
        })
        if (prompts.isCancel(prefixText)) {
            prompts.cancel("已取消创建项目")
            return process.exit(0)
        } else {
            packageJson.build_config["前缀标签"] = prefixText
        }
    }


    // 3. 设置是否添加版本号
    const addVersion = await prompts.confirm({
        message: '打包时添加版本后缀？',
        initialValue: true,
    })
    if (prompts.isCancel(addVersion)) {
        prompts.cancel("已取消创建项目")
        return process.exit(0)
    } else {
        packageJson.build_config["加版本号"] = addVersion
    }


    // 4. 复制模板文件

    // 创建项目文件夹
    shell.mkdir(projectName)
    // 复制文件
    const sourceDir = path.join(__dirname, '../template')
    const files = shell.ls('-A', sourceDir)
    files.forEach(file => {
        const sourcePath = `${sourceDir}/${file}`
        const targetPath = `${projectName}/${file}`
        if (shell.test('-d', sourcePath)) {
            shell.cp('-R', sourcePath, targetPath)
        } else {
            shell.cp(sourcePath, targetPath)
        }
    })

    // 保存配置文件
    const jsonData = JSON.stringify(packageJson, null, 4)
    fs.writeFileSync(`${projectName}/package.json`, jsonData)


    // 输出信息
    let doneMessage = ''
    doneMessage += chalk.green('创建完成 (≧∀≦)ゞ') + ' 现在你可以运行：\n\n'
    doneMessage += `  cd ${projectName}\n`
    doneMessage += `  npm install\n`
    doneMessage += `  code .`

    prompts.outro(doneMessage)
}
init()