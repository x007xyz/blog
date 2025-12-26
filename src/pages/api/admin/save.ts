import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// 设置为服务器端渲染，确保 API 路由可以处理动态请求
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // 安全拦截：仅在开发模式允许
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ message: "Forbidden in Production" }), { status: 403 });
  }

  try {
    const { slug, content, data: incomingData } = await request.json();

    // 1. 自动提取标签：扫描正文中的 #标签
    const hashTags = content.match(/#(\w+)/g)?.map((tag: string) => tag.slice(1)) || [];
    const initialTags = incomingData.tags || [];
    const combinedTags = Array.from(new Set([...initialTags, ...hashTags]));

    // 2. 准备 Frontmatter 数据
    const data = {
      ...incomingData,
      created_at: incomingData.created_at ? new Date(incomingData.created_at) : new Date(),
      updated_at: new Date(),
      tags: combinedTags
    };

    // 3. 使用 gray-matter 生成带 Frontmatter 的 Markdown 字符串
    const fileContent = matter.stringify(content, data);
    
    // 4. 写入文件到本地 content 目录
    const cleanSlug = slug.replace(/\.md$/, '');
    const filePath = path.join(process.cwd(), 'src/content/blog', `${cleanSlug}.md`);
    fs.writeFileSync(filePath, fileContent, 'utf-8');

    return new Response(JSON.stringify({ 
      message: "保存成功", 
      data: {
        ...data,
        created_at: data.created_at.toISOString(),
        updated_at: data.updated_at.toISOString()
      } 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};

