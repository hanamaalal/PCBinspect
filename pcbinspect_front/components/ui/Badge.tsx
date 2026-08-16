

type BadgeVariant =
  | "good"
  | "not-good"
  | "ok"
  | "nok"
  | "confirmed"
  | "refused"
  | "pending";

/* =========================================================
   STYLES
========================================================= */

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  /* GOOD */

  good: `
    bg-teal-100
    text-teal-700
    dark:bg-teal-950/60
    dark:text-teal-300
    dark:ring-1
    dark:ring-teal-900
  `,

  /* NOT GOOD */

  "not-good": `
    bg-red-100
    text-red-700
    dark:bg-red-950/60
    dark:text-red-300
    dark:ring-1
    dark:ring-red-900
  `,

  /* OK */

  ok: `
    bg-teal-100
    text-teal-700
    dark:bg-teal-950/60
    dark:text-teal-300
    dark:ring-1
    dark:ring-teal-900
  `,

  /* NOK */

  nok: `
    bg-red-100
    text-red-700
    dark:bg-red-950/60
    dark:text-red-300
    dark:ring-1
    dark:ring-red-900
  `,

  /* CONFIRMÉ */

  confirmed: `
    bg-red-100
    text-red-700
    dark:bg-red-950/60
    dark:text-red-300
    dark:ring-1
    dark:ring-red-900
  `,

  /* REFUSÉ */

  refused: `
    bg-teal-100
    text-teal-700
    dark:bg-teal-950/60
    dark:text-teal-300
    dark:ring-1
    dark:ring-teal-900
  `,

  /* EN ATTENTE */

  pending: `
    bg-yellow-100
    text-yellow-700
    dark:bg-yellow-950/60
    dark:text-yellow-300
    dark:ring-1
    dark:ring-yellow-900
  `,
};

/* =========================================================
   LABELS
========================================================= */

const VARIANT_LABELS: Record<BadgeVariant, string> = {
  good: "GOOD",
  "not-good": "NOT GOOD",
  ok: "OK",
  nok: "NOK",
  confirmed: "Confirmé",
  refused: "Refusé",
  pending: "EN ATTENTE",
};

/* =========================================================
   BADGE
========================================================= */

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
}

export function Badge({
  variant,
  children,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-full
        px-4
        py-1
        text-xs
        font-bold
        tracking-wide
        transition-colors
        duration-200

        ${VARIANT_STYLES[variant]}
      `}
    >
      {children ?? VARIANT_LABELS[variant]}
    </span>
  );
}

/* =========================================================
   STATUS DOT
========================================================= */

interface StatusDotProps {
  status: "ok" | "nok";
  label: string;
  timestamp?: string;
}

export function StatusDot({
  status,
  label,
  timestamp,
}: StatusDotProps) {
  return (
    <div className="flex items-center gap-2">

      {/* DOT */}

      <span
        className={`
          inline-block
          h-2.5
          w-2.5
          flex-shrink-0
          rounded-full

          ${
            status === "ok"
              ? `
                bg-teal-500
                dark:bg-teal-400
              `
              : `
                bg-red-500
                dark:bg-red-400
              `
          }
        `}
      />

      {/* LABEL */}

      <span
        className="
          text-sm
          font-medium
          text-gray-900
          transition-colors
          duration-300
          dark:text-slate-100
        "
      >
        {label}
      </span>

      {/* TIMESTAMP */}

      {timestamp && (
        <span
          className="
            text-xs
            text-gray-500
            transition-colors
            duration-300
            dark:text-slate-400
          "
        >
          {timestamp}
        </span>
      )}
    </div>
  );
}
