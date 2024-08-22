import axios from "axios";

const service = axios.create({
  baseURL: "http://localhost:1337/",
});

export function get<T, R>(url: string, params: T): Promise<R> {
  return service.get(url, { params }).then(({ data }) => data);
}

export default { get };
