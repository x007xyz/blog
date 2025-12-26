import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

/**
 * 获取文章内容的 API 路由
 * 使用查询参数获取 slug
 * 路径格式: /api/admin/get-post?slug=xxx
 * 
 * 根据 Astro 官方文档，在 API 路由中应该使用 request.url.searchParams 获取查询参数
 * 设置 prerender = false 确保此路由在服务器端渲染，可以获取查询参数
 */
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
  }

  // 根据 Astro 官方文档，使用 request.url.searchParams 获取查询参数
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    return new Response(JSON.stringify({ 
      error: "Missing slug"
    }), { status: 400 });
  }

  try {
    // 确保 slug 不带重复的 .md 后缀
    const cleanSlug = slug.replace(/\.md$/, '');
    const filePath = path.join(process.cwd(), 'src/content/blog', `${cleanSlug}.md`);
    
    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ 
        error: `Post not found: ${cleanSlug}.md`
      }), { status: 404 });
    }

    const file = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(file);

    // 格式化日期，确保在前端能正确处理
    const formattedData = { ...data };
    if (formattedData.created_at) {
      formattedData.created_at = new Date(formattedData.created_at).toISOString();
    }
    if (formattedData.updated_at) {
      formattedData.updated_at = new Date(formattedData.updated_at).toISOString();
    }

    return new Response(JSON.stringify({
      content,
      data: formattedData
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    console.error('[API get-post] 发生错误:', e);
    return new Response(JSON.stringify({ 
      error: e.message
    }), { status: 500 });
  }
};

