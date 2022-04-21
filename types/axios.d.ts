export interface PAxiosRequestOptions {
  // 是否要将请求参数转成 url -- eg. request(a: 1, b: 2) ==> /api?a=1&b=2
  joinParamsToUrl?: boolean;
  // 是否要格式化日期去提交日期参数
  formatDate?: boolean;
  // 是否要用 transform 处理响应
  isTransformResponse?: boolean;
  // 是否返回原生响应
  isReturnNativeResponse?: boolean;
  // 是否要给 url 加上前缀
  joinPrefix?: boolean;
  // 是否携带时间戳
  joinTime?: boolean;
  // 请求是否携带 token
  withToken?: boolean;
  // 接口地址 -- 不填的话会使用默认值
  apiUrl?: string;
  // 给请求的 url 拼接的前缀
  urlPrefix?: string;
}

export interface Result<T = any> {
  code: number;
  type: 'success' | 'error' | 'warning';
  message: string;
  result: T;
}
