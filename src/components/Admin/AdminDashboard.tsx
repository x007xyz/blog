import { useState, useEffect } from 'react';
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

interface Post {
  id: string;
  slug: string;
  data: Record<string, any>;
}

interface AdminDashboardProps {
  initialPosts: Post[];
}

export default function AdminDashboard({ initialPosts }: AdminDashboardProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);

  const editor = useCreateBlockNote();

  // 搜索过滤
  const filteredPosts = posts.filter(post => 
    (post.data.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.data.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.data.tags || []).some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 加载文章内容
  useEffect(() => {
    if (!selectedSlug) return;

    async function fetchPost() {
      if (!selectedSlug) return;
      setLoading(true);
      try {
        const url = new URL('/api/admin/get-post', window.location.origin);
        url.searchParams.set('slug', selectedSlug);
        const res = await fetch(url.toString());
        const result = await res.json();
        
        if (!res.ok) {
          console.error("加载失败:", result.error);
          return;
        }

        setTitle(result.data.title || "");
        
        // 移除 title，其余存入 metadata
        const { title: _, ...rest } = result.data;
        setMetadata(rest);

        const blocks = await editor.tryParseMarkdownToBlocks(result.content);
        editor.replaceBlocks(editor.topLevelBlocks, blocks);
      } catch (e) {
        console.error("加载失败", e);
      } finally {
        setLoading(false);
      }
    }

    if (selectedSlug === 'new') {
        setTitle("");
        setMetadata({
          description: "",
          created_at: new Date().toISOString(),
          tags: []
        });
        editor.replaceBlocks(editor.topLevelBlocks, editor.topLevelBlocks);
        setLoading(false);
    } else {
        fetchPost();
    }
  }, [selectedSlug, editor]);

  const handleSave = async () => {
    if (!title) return alert("标题不能为空");
    
    const slugToSave = selectedSlug === 'new' 
      ? title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      : selectedSlug;

    if (!slugToSave) return alert("无法生成有效 Slug");

    setSaving(true);
    const markdown = await editor.blocksToMarkdownLossy(editor.topLevelBlocks);
    
    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slugToSave,
          content: markdown,
          data: {
            ...metadata,
            title
          }
        })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        // 更新本地列表状态
        const updatedPost: Post = {
          id: slugToSave,
          slug: slugToSave,
          data: result.data
        };

        if (selectedSlug === 'new') {
          setPosts(prev => [updatedPost, ...prev]);
          setSelectedSlug(slugToSave);
        } else {
          setPosts(prev => prev.map(p => p.slug === selectedSlug ? updatedPost : p));
        }
        
        // 更新当前 metadata
        const { title: _, ...rest } = result.data;
        setMetadata(rest);
        
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
      }
    } catch (e) {
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const updateMetadata = (key: string, value: any) => {
    setMetadata(prev => ({ ...prev, [key]: value }));
  };

  const deleteMetadata = (key: string) => {
    setMetadata(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const addProperty = () => {
    const key = prompt("输入属性名称:");
    if (key && !metadata[key]) {
      updateMetadata(key, "");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      {/* 左侧列表 - 使用阴影代替纯黑边框 */}
      <div className="w-80 flex flex-col bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
        <div className="p-6 space-y-4 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-xl tracking-tight">管理后台</h1>
            <button 
              type="button"
              onClick={() => setSelectedSlug('new')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="写新文章"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="搜索文章..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-black/5 focus:bg-white outline-none transition-all"
            />
            <svg className="absolute left-3 top-2.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2">
          {filteredPosts.map(post => (
            <button
              type="button"
              key={post.id}
              onClick={() => setSelectedSlug(post.slug)}
              className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors relative group ${selectedSlug === post.slug ? 'bg-gray-50' : ''}`}
            >
              {selectedSlug === post.slug && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-black rounded-r-full" />
              )}
              <div className="font-medium text-sm mb-1 line-clamp-1 group-hover:text-black transition-colors">{post.data.title}</div>
              <div className="text-xs text-gray-400">
                {new Date(post.data.created_at).toLocaleDateString('zh-CN')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 右侧编辑器 */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {!selectedSlug ? (
          <div className="flex-1 flex items-center justify-center text-gray-300 flex-col gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
            <p className="text-sm tracking-widest uppercase">Select a post to edit</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {loading && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                </div>
            )}
            
            <div className="flex justify-between items-center px-12 py-6 shadow-[0_1px_0_0_rgba(0,0,0,0.03)] shrink-0 bg-white z-10">
              <div className="flex-1 flex items-center gap-4">
                <input 
                  className="text-2xl font-bold outline-none flex-1 border-none focus:ring-0 p-0 placeholder:text-gray-200" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="文章标题"
                />
              </div>
              <div className="flex items-center gap-4">
                {showSavedToast && (
                  <span className="text-green-500 text-sm font-medium animate-in fade-in slide-in-from-right-4">
                    已保存
                  </span>
                )}
                <button 
                  type="button"
                  onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
                  className={`p-2 rounded-lg transition-colors ${isPropertiesOpen ? 'bg-gray-100 text-black' : 'text-gray-400 hover:bg-gray-50'}`}
                  title="文章属性"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button 
                  type="button"
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="px-8 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-200 transition-all shadow-lg shadow-black/5"
                >
                  {saving ? "保存中..." : "保存修改"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-16 pb-32 px-12 flex justify-center">
              <div className="w-full max-w-3xl space-y-10">
                {/* 属性区域 */}
                {isPropertiesOpen && (
                  <div className="bg-gray-50/50 rounded-2xl p-8 space-y-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="font-bold text-xs uppercase tracking-widest text-gray-400 mt-0!">文章属性</h2>
                      <button 
                        onClick={addProperty}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        添加属性
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {Object.entries(metadata)
                        .filter(([key]) => !['created_at', 'updated_at'].includes(key))
                        .map(([key, value]) => (
                        <div key={key} className="space-y-2 group">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{key}</label>
                            {!['tags', 'description'].includes(key) && (
                              <button 
                                onClick={() => deleteMetadata(key)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </button>
                            )}
                          </div>
                          {key === 'tags' ? (
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(value) && value.map((tag: string, i: number) => (
                                <span key={i} className="px-2.5 py-1 bg-white text-gray-600 rounded-lg text-xs font-medium border border-gray-100 flex items-center gap-1.5 shadow-sm">
                                  {tag}
                                  <button onClick={() => {
                                    const newTags = value.filter((_, index) => index !== i);
                                    updateMetadata('tags', newTags);
                                  }} className="hover:text-red-500 text-gray-300">×</button>
                                </span>
                              ))}
                              <button 
                                onClick={() => {
                                  const tag = prompt("输入新标签:");
                                  if (tag) updateMetadata('tags', [...(value || []), tag]);
                                }}
                                className="px-2.5 py-1 border border-dashed border-gray-200 text-gray-400 rounded-lg text-xs hover:border-gray-400 hover:text-gray-600 transition-colors bg-white/50"
                              >
                                + 添加
                              </button>
                            </div>
                          ) : key === 'description' ? (
                            <textarea 
                              className="w-full text-sm bg-white border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-black/5 outline-none transition-all resize-none min-h-[100px] shadow-sm placeholder:text-gray-200"
                              value={value || ""}
                              onChange={e => updateMetadata(key, e.target.value)}
                              placeholder={`输入文章描述...`}
                            />
                          ) : (
                            <input 
                              className="w-full text-sm bg-white border border-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-sm placeholder:text-gray-200"
                              value={value || ""}
                              onChange={e => updateMetadata(key, e.target.value)}
                              placeholder={`输入 ${key}...`}
                            />
                          )}
                        </div>
                      ))}
                      
                      {/* 只读属性显示 */}
                      <div className="pt-4 border-t border-gray-100 flex gap-6">
                        {metadata.created_at && (
                          <div className="text-[10px] text-gray-400">
                            <span className="font-bold uppercase tracking-widest mr-2">创建于</span>
                            {new Date(metadata.created_at).toLocaleString('zh-CN')}
                          </div>
                        )}
                        {metadata.updated_at && (
                          <div className="text-[10px] text-gray-400">
                            <span className="font-bold uppercase tracking-widest mr-2">更新于</span>
                            {new Date(metadata.updated_at).toLocaleString('zh-CN')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="editor-wrapper min-h-[600px]">
                  <BlockNoteView editor={editor} theme="light" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

