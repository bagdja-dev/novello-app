import type { BookStatus, ChapterStatus } from '@/lib/types';

export const BOOK_STATUS_LABEL: Record<BookStatus, string> = {
  draft: 'Draft',
  ongoing: 'Ongoing',
  completed: 'Selesai',
};

export const BOOK_STATUS_VARIANT: Record<BookStatus, 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  ongoing: 'default',
  completed: 'outline',
};

export const CHAPTER_STATUS_LABEL: Record<ChapterStatus, string> = {
  draft: 'Draft',
  published: 'Published',
};

export const CHAPTER_STATUS_VARIANT: Record<ChapterStatus, 'secondary' | 'default'> = {
  draft: 'secondary',
  published: 'default',
};
