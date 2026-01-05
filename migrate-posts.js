import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 源目录和目标目录
const sourceDir = '/Users/zhangxiangchen/Code/blog/source/_posts';
const targetDir = '/Users/zhangxiangchen/Code/demo/blog/src/content/blog';

// 读取所有 markdown 文件
const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.md'));

// 解析 frontmatter
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  
  const frontmatterText = match[1];
  const body = match[2];
  
  // 简单的 YAML 解析（处理基本格式）
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  
  let currentKey = null;
  let currentArray = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // 处理数组项
    if (trimmed.startsWith('-')) {
      const value = trimmed.substring(1).trim().replace(/^["']|["']$/g, '');
      if (currentArray !== null) {
        currentArray.push(value);
      }
      continue;
    }
    
    // 处理键值对
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      
      // 检查是否是数组开始
      if (value === '' || value === '[]') {
        currentKey = key;
        currentArray = [];
        frontmatter[key] = currentArray;
      } else {
        currentKey = null;
        currentArray = null;
        frontmatter[key] = value;
      }
    }
  }
  
  return { frontmatter, body };
}

// 生成描述（从正文第一段提取）
function generateDescription(body) {
  if (!body || body.trim().length === 0) {
    return '暂无描述';
  }
  
  // 移除标题、代码块、引用标记等
  let text = body
    .replace(/^#+\s.*$/gm, '')
    .replace(/^>\s*/gm, '') // 移除引用标记
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/\n+/g, ' ') // 将换行符替换为空格
    .trim();
  
  // 获取前150个字符
  const description = text.substring(0, 150).trim();
  
  // 如果截断后还有内容，添加省略号
  const finalDescription = text.length > 150 ? description + '...' : description;
  
  return finalDescription || '暂无描述';
}

// 转换日期格式
function convertDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  // Hexo 日期格式: 2021-08-31 13:44:23
  const dateMatch = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1];
  }
  
  return new Date().toISOString().split('T')[0];
}

// 转换文章
function convertPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  
  const title = frontmatter.title || path.basename(filePath, '.md');
  const date = frontmatter.date || '';
  const tags = frontmatter.tags || [];
  const categories = frontmatter.categories || [];
  
  // 合并 tags 和 categories
  const allTags = [...new Set([...tags, ...categories])];
  
  // 生成新的 frontmatter
  const newFrontmatter = {
    title: title,
    description: generateDescription(body),
    created_at: convertDate(date),
    tags: allTags.length > 0 ? allTags : []
  };
  
  // 如果有日期，也设置 updated_at
  if (date) {
    newFrontmatter.updated_at = convertDate(date);
  }
  
  // 手动生成 YAML frontmatter
  const description = generateDescription(body);
  const yamlLines = [];
  yamlLines.push(`title: "${title.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
  yamlLines.push(`description: "${description.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
  yamlLines.push(`created_at: ${newFrontmatter.created_at}`);
  if (newFrontmatter.updated_at) {
    yamlLines.push(`updated_at: ${newFrontmatter.updated_at}`);
  }
  if (newFrontmatter.tags.length > 0) {
    yamlLines.push(`tags:`);
    newFrontmatter.tags.forEach(tag => {
      yamlLines.push(`  - "${tag.replace(/"/g, '\\"')}"`);
    });
  } else {
    yamlLines.push(`tags: []`);
  }
  
  const newContent = `---\n${yamlLines.join('\n')}\n---\n\n${body}`;
  
  return {
    filename: path.basename(filePath),
    content: newContent
  };
}

// 执行迁移
console.log(`开始迁移 ${files.length} 篇文章...`);

files.forEach((file, index) => {
  const sourcePath = path.join(sourceDir, file);
  const converted = convertPost(sourcePath);
  const targetPath = path.join(targetDir, converted.filename);
  
  // 如果目标文件已存在，跳过（避免覆盖）
  if (fs.existsSync(targetPath)) {
    console.log(`跳过已存在的文件: ${converted.filename}`);
    return;
  }
  
  fs.writeFileSync(targetPath, converted.content, 'utf-8');
  console.log(`✓ 已迁移: ${converted.filename} (${index + 1}/${files.length})`);
});

console.log('\n迁移完成！');

