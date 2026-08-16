import { ShiftReport } from "@/lib/types";

interface InspectionHistoryProps {
  reports: ShiftReport[];
}

export function InspectionHistory({
  reports,
}: InspectionHistoryProps) {
  return (
    <section className="w-full">

      {/* =====================================================
          TABLEAU
      ===================================================== */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-sm
          transition-colors
          duration-300
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">

            {/* =================================================
                HEADER DU TABLEAU
            ================================================= */}

            <thead>
              <tr
                className="
                  border-b
                  border-gray-200
                  bg-gray-50
                  text-left
                  text-gray-500
                  transition-colors
                  duration-300
                  dark:border-slate-800
                  dark:bg-slate-800/60
                  dark:text-slate-400
                "
              >
                <th
                  className="
                    px-6
                    py-4
                    text-sm
                    font-semibold
                  "
                >
                  Poste
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-sm
                    font-semibold
                  "
                >
                  PRF
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-sm
                    font-semibold
                  "
                >
                  SN
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-right
                    text-sm
                    font-semibold
                  "
                >
                  Taux de défauts (%)
                </th>
              </tr>
            </thead>

            {/* =================================================
                BODY
            ================================================= */}

            <tbody
              className="
                divide-y
                divide-gray-100
                dark:divide-slate-800
              "
            >
              {reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="
                      px-6
                      py-10
                      text-center
                      text-sm
                      text-gray-500
                      transition-colors
                      duration-300
                      dark:text-slate-400
                    "
                  >
                    Aucune inspection récente
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="
                      bg-white
                      transition-colors
                      duration-200
                      hover:bg-gray-50
                      dark:bg-slate-900
                      dark:hover:bg-slate-800/60
                    "
                  >

                    {/* =========================================
                        POSTE
                    ========================================= */}

                    <td
                      className="
                        px-6
                        py-4
                        text-sm
                        font-medium
                        text-gray-900
                        dark:text-slate-100
                      "
                    >
                      {report.shift}
                    </td>

                    {/* =========================================
                        PRF
                    ========================================= */}

                    <td
                      className="
                        px-6
                        py-4
                        text-sm
                        font-medium
                        text-gray-900
                        dark:text-slate-100
                      "
                    >
                      {report.prf}
                    </td>

                    {/* =========================================
                        SN
                    ========================================= */}

                    <td
                      className="
                        px-6
                        py-4
                        text-sm
                        text-gray-700
                        dark:text-slate-300
                      "
                    >
                      {report.sn}
                    </td>

                    {/* =========================================
                        TAUX DE DÉFAUTS
                    ========================================= */}

                    <td
                      className="
                        px-6
                        py-4
                        text-right
                        text-sm
                        font-semibold
                        text-gray-900
                        dark:text-slate-100
                      "
                    >
                      {report.defectRate}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
