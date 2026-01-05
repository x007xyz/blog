import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const esaConfigPath = path.join(rootDir, 'esa.jsonc');
const astroAssetsDir = path.join(rootDir, 'dist', 'assets');

try {
  // 查找 dist/assets 目录中的 client.*.js 文件
  if (!fs.existsSync(astroAssetsDir)) {
    console.warn('警告: dist/assets 目录不存在，跳过 ESA 配置更新');
    process.exit(0);
  }

  const files = fs.readdirSync(astroAssetsDir);
  const clientJsFile = files.find(file => file.startsWith('client.') && file.endsWith('.js'));

  if (!clientJsFile) {
    console.warn('警告: 未找到 client.*.js 文件，跳过 ESA 配置更新');
    process.exit(0);
  }

  const functionJsPath = `dist/assets/${clientJsFile}`;

  // 读取现有的 esa.jsonc 文件
  if (!fs.existsSync(esaConfigPath)) {
    console.warn('警告: esa.jsonc 文件不存在，跳过更新');
    process.exit(0);
  }

  let configContent = fs.readFileSync(esaConfigPath, 'utf-8');

  // 更新 functionJsFile 路径
  // 使用正则表达式匹配并替换 functionJsFile 的值
  const functionJsFileRegex = /("functionJsFile"\s*:\s*")[^"]+(")/;
  
  if (functionJsFileRegex.test(configContent)) {
    configContent = configContent.replace(functionJsFileRegex, `$1${functionJsPath}$2`);
    fs.writeFileSync(esaConfigPath, configContent, 'utf-8');
    console.log(`✓ 已更新 ESA 配置: functionJsFile -> ${functionJsPath}`);
  } else {
    console.warn('警告: 未找到 functionJsFile 配置项');
  }
} catch (error) {
  console.error('更新 ESA 配置时出错:', error);
  // 即使出错也继续，不中断构建流程
  process.exit(0);
}

