/** Joins truthy class names together, dropping falsy/nullish entries. */
export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
