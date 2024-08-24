import type { ImgHTMLAttributes } from "react";

import { Image as AntdImage } from "antd";

import type { ElementProps } from "@/types/element";

import "./Image.scss";

export interface ImageProps
  extends ElementProps,
    ImgHTMLAttributes<HTMLImageElement> {}

const Image = (props: ImageProps) => {
  const { src, alt } = props;

  return <AntdImage wrapperClassName="ws-content-image" src={src} alt={alt} />;
};

export default Image;
