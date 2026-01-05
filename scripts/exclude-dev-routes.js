import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const devApiRoutes = [
  'src/pages/api/admin/save.ts',
  'src/pages/api/admin/get-post.ts'
];

const tempDir = path.join(rootDir, '.temp-dev-routes');

try {
  // 创建临时目录
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // 移动开发专用的 API 路由到临时目录
  devApiRoutes.forEach(route => {
    const sourcePath = path.join(rootDir, route);
    const fileName = path.basename(route);
    const destPath = path.join(tempDir, fileName);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      fs.unlinkSync(sourcePath);
      console.log(`已移动开发路由: ${route} -> .temp-dev-routes/${fileName}`);
    }
  });

  console.log('开发路由已排除，可以开始构建');
} catch (error) {
  console.error('排除开发路由时出错:', error);
  process.exit(1);
}

