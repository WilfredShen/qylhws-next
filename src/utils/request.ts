import axios from "axios";

const service = axios.create({
  baseURL: "http://localhost:1337/",
});

export function get<T = unknown, D = unknown>(
  url: string,
  params: D,
): Promise<T> {
  return service.get(url, { params }).then(({ data }) => data);
}

const request = { get };

export default request;
