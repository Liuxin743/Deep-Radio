import axios from 'axios';

/**
 * 从 Semantic Scholar 获取论文补充信息（引用数、期刊、作者机构）
 * @param {string} arxivId - ArXiv ID（如 '2304.03442'）
 * @returns {Promise<Object>} 补充信息（引用数、期刊、作者机构等）
 */
export async function fetchPaperFromSemantic(arxivId) {
  try {
    // 1. 去除 arXiv ID 的版本号（如 v1、v2）
    const cleanArxivId = arxivId.replace(/v\d+$/, ''); 
    // 2. 关键修复：请求时使用 cleanArxivId（而非原 arxivId）
    const response = await axios.get(`/api/semantic/paper/arXiv:${cleanArxivId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = response.data;
    return {
      citationCount: data.citationCount || 0,
      venue: data.venue || '预印本',
      authors: data.authors.map(author => ({
        name: author.name,
        affiliation: author.affiliation || '未知机构'
      })),
      fieldsOfStudy: data.fieldsOfStudy || ['人工智能'],
      publicationDate: data.publicationDate 
        ? new Date(data.publicationDate).toLocaleDateString('zh-CN')
        : '未知日期'
    };
  } catch (error) {
    // 优化错误提示：区分 404（未收录）和其他错误
    const cleanArxivId = arxivId.replace(/v\d+$/, '');
    if (error.response?.status === 404) {
      console.warn(`Semantic Scholar 暂未收录该论文：arXiv:${cleanArxivId}`);
    } else {
      console.error(`Semantic Scholar API 调用失败（arXiv:${cleanArxivId}）：`, error.message);
    }
    // 失败时返回默认值，不影响页面展示
    return {
      citationCount: 0,
      venue: '预印本',
      authors: [],
      fieldsOfStudy: ['人工智能'],
      publicationDate: '未知日期'
    };
  }
}