import type { Plugin } from "unified";
import { matter } from "vfile-matter";

import { kebabObjectToCamelObject } from "@/utils/escape";

const remarkMatter: Plugin<[]> = function () {
  const data = this.data();
  return (tree, file) => {
    matter(file);
    data.matter = kebabObjectToCamelObject(file.data.matter);
  };
};

export default remarkMatter;
