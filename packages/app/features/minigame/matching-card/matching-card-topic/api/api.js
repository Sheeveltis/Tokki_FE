import { apiClient } from '../../../../../provider/api/client'
import { ENDPOINTS } from '../../../../../provider/api/endpoints'
import DefaultBunny from '../../../../../../assets/bunny/14.png'

/**
 * Helper normalize ảnh cho cả web + native
 */
export const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  return src
}

/**
 * Lấy danh sách topic cho minigame theo level (dùng /api/Topics/user/get-all)
 * Cách truyền query giống với flashcard: ?level=...
 *
 * @param {string|number} levelId
 * @param {{
 *   pageNumber?: number;
 *   pageSize?: number;
 *   searchTerm?: string;
 * }} [options]
 * @returns {Promise<Array<{
 *   id: string;
 *   titleKo: string;
 *   titleVi: string;
 *   icon: any;
 *   level?: number;
 *   _raw: any;
 * }>>}
 */
export const getMinigameTopics = async (
  levelId,
  { pageNumber = 1, pageSize, searchTerm } = {}
) => {
  try {
    const params = {
      pageNumber,
    }

    // Cho phép pageSize linh hoạt (nếu không truyền thì backend tự quyết định)
    if (typeof pageSize === 'number') {
      params.pageSize = pageSize
    }

    // Backend yêu cầu query "level"
    if (levelId !== undefined && levelId !== null && levelId !== '') {
      params.level = levelId
    }

    if (searchTerm) {
      params.searchTerm = searchTerm
    }

    const res = await apiClient.get(ENDPOINTS.TOPIC.USER_GET_ALL, { params })
    const pagingData = res?.data?.data
    let items = Array.isArray(pagingData?.items) ? pagingData.items : []

    // Nếu backend chưa filter theo level thì filter lại trên FE cho chắc
    if (levelId !== undefined && levelId !== null && levelId !== '') {
      const levelNumber = Number(levelId)
      if (!Number.isNaN(levelNumber)) {
        items = items.filter((x) => Number(x.level) === levelNumber)
      }
    }

    // Map về shape UI dùng cho minigame-topic
    const mappedItems = items.map((item) => ({
      id: item.topicId,
      titleKo: item.topicName,
      titleVi: item.description || '',
      imgUrl: item.imgUrl,
      level: item.level,
      _raw: item,
    }));

    return {
      items: mappedItems,
      totalPages: pagingData.totalPages || 1,
    };
  } catch (error) {
    console.error('Error fetching minigame topics:', error);
    return { items: [], totalPages: 1 };
  }
}


