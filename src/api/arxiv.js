import axios from 'axios';
import { xml2js } from 'xml-js';

/**
 * 从 arXiv API 获取指定 ID 的论文元数据
 * @param {string[]} arxivIds - ArXiv ID 列表（如 ['2304.03442']）
 * @returns {Promise<Array>} 格式化后的论文数据
 */
export async function fetchPapersFromArXiv(arxivIds) {
  try {
    const idList = arxivIds.join(',');
    const response = await axios.get(`/api/arxiv/query`, {
      params: { id_list: idList, max_results: arxivIds.length }
    });

    // XML 转 JSON
    const jsonResult = xml2js(response.data, {
      compact: true,
      ignoreComment: true,
      textKey: 'text'
    });

    // 格式化论文数据（修复语法错误：移除多余的 arxivId 代码，移到 map 里处理）
    const entries = jsonResult.feed.entry 
      ? (Array.isArray(jsonResult.feed.entry) ? jsonResult.feed.entry : [jsonResult.feed.entry])
      : [];

    return entries.map(entry => ({
      // 在这里处理 arxivId（去除版本号）
      arxivId: entry.id.text.split('/').pop().replace(/v\d+$/, ''),
      title: entry.title.text.trim(),
      authors: entry.author 
        ? (Array.isArray(entry.author) 
            ? entry.author.map(auth => auth.name.text) 
            : [entry.author.name.text]
          ).join(', ')
        : '未知作者',
      abstract: entry.summary.text.trim() || '无摘要',
      published: formatDate(entry.published.text),
      updated: formatDate(entry.updated.text),
      pdfUrl: entry.link.find(link => link._attributes.rel === 'alternate')?._attributes.href || '',
      category: entry?.category?._attributes?.term || 'cs.AI'
    }));
  } catch (error) {
    console.error('arXiv API 调用失败：', error);
    return [];
  }
}

/**
 * 搜索 arXiv 中 LLM-Agent 相关论文（按更新时间排序）
 * @param {number} maxResults - 返回数量（默认 20）
 * @returns {Promise<Array>} 论文列表
 */
export async function searchArXivPapers(maxResults = 20) {
  try {
    const response = await axios.get(`/api/arxiv/query`, {
      params: {
        search_query: 'cat:cs.AI OR cat:cs.LG AND (title:"LLM Agent" OR title:"Large Language Model Agent" OR abstract:"Agent" OR abstract:"Intelligent Agent")',
        max_results: maxResults,
        sortBy: 'lastUpdatedDate',
        sortOrder: 'descending'
      }
    });

    const jsonResult = xml2js(response.data, { compact: true, ignoreComment: true, textKey: 'text' });
    const entries = jsonResult.feed.entry 
      ? (Array.isArray(jsonResult.feed.entry) ? jsonResult.feed.entry : [jsonResult.feed.entry])
      : [];

    return entries.map(entry => ({
      // 同样处理 arxivId（去除版本号）
      arxivId: entry.id.text.split('/').pop().replace(/v\d+$/, ''),
      title: entry.title.text.trim(),
      authors: entry.author 
        ? (Array.isArray(entry.author) 
            ? entry.author.map(auth => auth.name.text) 
            : [entry.author.name.text]
          ).join(', ')
        : '未知作者',
      abstract: entry.summary.text.trim() || '无摘要',
      published: formatDate(entry.published.text),
      updated: formatDate(entry.updated.text),
      pdfUrl: entry.link.find(link => link._attributes.rel === 'alternate')?._attributes.href || '',
      category: entry?.category?._attributes?.term || 'cs.AI'
    }));
  } catch (error) {
    console.error('arXiv 论文搜索失败：', error);
    return [];
  }
}

/**
 * ISO 8601 日期格式化（转为 年月日 格式）
 * @param {string} isoDate - ISO 格式日期字符串
 * @returns {string} 格式化后的日期
 */
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}