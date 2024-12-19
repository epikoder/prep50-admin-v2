// https://vike.dev/pageContext#typescript
declare global {
  namespace Vike {
    interface PageContext {
      config: {
        user?: User;
        collection?: {
          subject_name?: string;
          topic_title?: string;
          objective_title?: string;
        };
      };
    }
  }
}

export {};
