"use client";

import React from "react";
import Link, { LinkProps } from "next/link";
import { useTransitionPage } from "@/context/TransitionContext";
import { useRouter } from "next/navigation";

interface TransitionLinkProps extends React.PropsWithChildren<LinkProps> {
  href: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const TransitionLink = ({
  href,
  children,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}: TransitionLinkProps) => {
  const { transitionTo } = useTransitionPage();
  const router = useRouter();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);

    // Some links might be external or anchor links
    if (href.startsWith("#") || href.startsWith("http")) {
      router.push(href);
      return;
    }

    transitionTo(href);
  };

  return (
    <Link {...props} href={href} className={className} onClick={handleTransition} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </Link>
  );
};

export default TransitionLink;
