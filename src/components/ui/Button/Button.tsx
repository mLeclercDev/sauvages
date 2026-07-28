"use client";

import React from "react";
import Link from "next/link";
import TransitionLink from "@/components/ui/TransitionLink/TransitionLink";
import styles from "./Button.module.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  color?: "black" | "white";
  target?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  href,
  onClick,
  className = "",
  variant = "outline",
  color = "black",
  type = "button",
  target,
  ...rest
}) => {
  const buttonClasses = `${styles.button} ${styles[variant]} ${styles[color]} ${className}`;

  const content = (
    <>
      <div className={styles.labelWrapper}>
        <span className={styles.label}>{label}</span>
        <span className={styles.label}>{label}</span>
      </div>
      {icon && <span className={styles.icon}>{icon}</span>}
    </>
  );

  if (href) {
    const isExternal = href.startsWith("http") || href.startsWith("//") || !!target;
    if (isExternal) {
      return (
        <Link href={href} className={buttonClasses} target={target}>
          {content}
        </Link>
      );
    }
    return (
      <TransitionLink href={href} className={buttonClasses}>
        {content}
      </TransitionLink>
    );
  }

  return (
    <button type={type} onClick={onClick} className={buttonClasses} {...rest}>
      {content}
    </button>
  );
};

export default Button;
