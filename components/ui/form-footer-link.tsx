import Link from "next/link"

interface FormFooterLinkProps {
  text: string
  linkText: string
  href: string
}

export function FormFooterLink({ text, linkText, href }: FormFooterLinkProps) {
  return (
    <p className="text-sm text-center text-gray-600">
      {text}{" "}
      <Link
        href={href}
        className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
      >
        {linkText}
      </Link>
    </p>
  )
}
