import React from "react";
import Link from "next/link";
import styles from "./Button.module.scss";

interface ButtonProps {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  color?: "black" | "white";
  type?: "button" | "submit" | "reset";
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
    return (
      <Link href={href} className={buttonClasses} target={target}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={buttonClasses}>
      {content}
    </button>
  );
};

export default Button;
