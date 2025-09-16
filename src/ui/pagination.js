
/**
 * Render simple Prev/Next pagination and call `onChange(nextPage)` when clicked.
 * @param {{ containerId?:string, page:number, pageCount:number, onChange:(nextPage:number)=>void }} cfg
 */

export function renderPagination({ containerId = "pagination", page, pageCount, onChange }) {
  const nav = document.getElementById(containerId);
  if (!nav) return;
  nav.innerHTML = "";

  const totalPages = Math.max(1, Number(pageCount) || 1);
  const makeBtn = (label, disabled, nextPage) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.disabled = disabled;
    b.className = `rounded-lg border px-3 py-1 text-sm ${disabled ? "opacity-50" : "hover:bg-gray-100"}`;
    if (!disabled) b.addEventListener("click", () => onChange(nextPage));
    return b;
  };

  nav.appendChild(makeBtn("Prev", page <= 1, page - 1));
  const pageInfo = document.createElement("span");
  pageInfo.className = "px-2 py-1 text-sm text-gray-600";
  pageInfo.textContent = `Page ${page} of ${totalPages}`;
  nav.appendChild(pageInfo);
  nav.appendChild(makeBtn("Next", page >= totalPages, page + 1));
}
