export const Link = ({ text, href }: { text: string; href: string }) => (
  <a
    href={href}
    className="text-primary underline underline-offset-2 cursor-pointer break-words"
    target="_blank"
  >
    {text}
  </a>
);
