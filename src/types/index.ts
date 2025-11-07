export interface StyleOption {
  name: string;
  imageUrl: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  timestamp: number;
}

export interface GuideStep {
  title: string;
  description: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  active: boolean;
}