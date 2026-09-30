// The canonical mark (brand/logo-mark.svg, D-018), inlined so it needs no request. `id` names its clip path: pass
// another when the mark appears a second time on a page (ids must be unique in a document).
export function LogoMark({ className, id = "cs-tile" }: { className?: string; id?: string }) {
  return (
    <svg className={className} viewBox="159.5 105.5 187 187" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id}>
          <path d="M179.5,105.5H326.5A20,20 0 0 1 346.5,125.5V272.5A20,20 0 0 1 326.5,292.5H179.5A20,20 0 0 1 159.5,272.5V125.5A20,20 0 0 1 179.5,105.5Z" />
        </clipPath>
      </defs>
      <path fill="#9BCC3C" d="M179.5,105.5H326.5A20,20 0 0 1 346.5,125.5V272.5A20,20 0 0 1 326.5,292.5H179.5A20,20 0 0 1 159.5,272.5V125.5A20,20 0 0 1 179.5,105.5Z" />
      <g clipPath={`url(#${id})`}>
        <path fill="#FFFFFF" d="M199,149A30,30 0 0 1 259,149V249A30,30 0 0 1 199,249ZM179,169H279A30,30 0 0 1 279,229H179A30,30 0 0 1 179,169Z" />
        <path fill="#6D9620" d="M237,169V149A30,30 0 0 1 297,149V169ZM237,169H217A30,30 0 0 0 217,229H237Z" />
        <path fill="#0F8FCC" d="M297,169H317A30,30 0 0 1 317,229H297ZM237,229V249A30,30 0 0 0 297,249V229Z" />
        <path fill="#FFFFFF" d="M237,169H297V229H237Z" />
      </g>
      <path fill="#6D9620" d="M267,213L252.55,200.25A9,9 0 1 1 267,190.54A9,9 0 1 1 281.45,200.25Z" />
    </svg>
  );
}
