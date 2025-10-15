declare global {
  interface Window {
    cocoSsd: {
      load(): Promise<{
        detect(img: HTMLImageElement): Promise<Array<{
          class: string;
          score: number;
          bbox: [number, number, number, number];
        }>>;
      }>;
    };
    mobilenet: {
      load(): Promise<{
        classify(img: HTMLImageElement): Promise<Array<{
          className: string;
          probability: number;
        }>>;
      }>;
    };
    tf: any;
  }
}

export {};
