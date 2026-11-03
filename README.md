# AIGC 数字营销平台 Demo

面向仪器设备企业的 AIGC 数字营销平台演示项目，覆盖产品资料管理、产品问答、平面物料、宣传视频、项目协作、团队空间、素材库、知识库及平台管理等场景。

## 本地启动

1. 安装 Node.js 22.13 或更高版本。
2. 双击 `启动Demo.bat`；首次运行会自动安装依赖。
3. 等待浏览器自动打开 `http://localhost:3000/`。
4. 使用期间不要关闭启动命令窗口。

也可以在 PowerShell 中运行：

```powershell
npm.cmd install
$env:CLOUDFLARE_CF_FETCH_ENABLED='false'
npm.cmd run dev -- --host localhost
```

## 验证

```powershell
npm.cmd run build
```

> 当前仓库为产品交互 Demo。部分 AI 问答与生成能力使用本地演示数据和规则模拟，真实大模型、RAG、企业数据库及权限体系需要在企业环境中另行接入。
