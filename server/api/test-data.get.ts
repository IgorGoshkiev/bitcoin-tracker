import { TEST_DATA } from '../utils/db';

export default defineEventHandler(() => {
  return {
    success: true,
    data: TEST_DATA.map(item => ({
      date: new Date(Date.now() - item.daysAgo * 86400000),
      price: item.price,
      label: `${item.daysAgo} day${item.daysAgo > 1 ? 's' : ''} ago`
    }))
  };
});