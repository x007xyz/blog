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
  // 恢复开发专用的 API 路由
  devApiRoutes.forEach(route => {
    const destPath = path.join(rootDir, route);
    const fileName = path.basename(route);
    const sourcePath = path.join(tempDir, fileName);
    
    if (fs.existsSync(sourcePath)) {
      // 确保目标目录存在
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.copyFileSync(sourcePath, destPath);
      fs.unlinkSync(sourcePath);
      console.log(`已恢复开发路由: .temp-dev-routes/${fileName} -> ${route}`);
    }
  });

  // 删除临时目录（如果为空）
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    if (files.length === 0) {
      fs.rmdirSync(tempDir);
    }
  }

  console.log('开发路由已恢复');
} catch (error) {
  console.error('恢复开发路由时出错:', error);
  // 即使出错也继续，不中断流程
  process.exit(0);
}

