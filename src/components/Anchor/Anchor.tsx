import { ElementProps } from "@/types/element";
import { Link } from "lucide-react";

export interface AnchorProps
  extends ElementProps,
    React.AnchorHTMLAttributes<HTMLAnchorElement> {
  externalIcon?: React.ReactNode;
}

const Anchor = (props: AnchorProps) => {
  const {
    node,
    href,
    children,
    externalIcon = <Link />,
    ...otherProps
  } = props;

  const isExternal = !!href?.match(/([a-zA-Z\d-]+:)?\/\//);

  if (isExternal) {
    return (
      <a {...otherProps} href={href} target="_blank" rel="noreferer">
        {children}
        {externalIcon}
      </a>
    );
  }

  return (
    <a {...otherProps} href={href}>
      {children}
    </a>
  );
};

export default Anchor;
