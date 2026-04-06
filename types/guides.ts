export interface Guide {
  id: string;
  title: string;
  category: string;
  description: string;
  provider: string;
  difficulty: string;
  readTime: string;
  publishedAt: string;
}

export interface GuidesData {
  guides: Guide[];
}
