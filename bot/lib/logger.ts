export const logger = {
  info: (payload: unknown, message?: string) => console.log(message ?? "", payload ?? ""),
  error: (payload: unknown, message?: string) => console.error(message ?? "", payload ?? ""),
};
