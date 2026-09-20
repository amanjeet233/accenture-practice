declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(location: string, options?: any);
    exec(sql: string): void;
    prepare(sql: string): {
      all(params?: any): any[];
      get(params?: any): any;
      run(params?: any): any;
    };
    close(): void;
  }
}
