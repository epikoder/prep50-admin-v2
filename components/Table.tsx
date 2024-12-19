import { ReactNode } from "react";
import { ActivityIndicator } from "./Icons";

export { TableColumn, TableProps as TableProp, TableRow };

type TableColumn = {
    key: string;
    display_name?: string;
    /** defaults to 100px */
    width?: number;
    render?: () => ReactNode;
};

type TableRow<T> = {
    value: T;
    render: (v: T, k: string) => ReactNode;
};

type TableProps<T> = {
    loading?: boolean;
    columns: TableColumn[];
    rows: TableRow<T>[];
};

export default function Table<T = any>(
    { columns, rows, loading }: TableProps<T>,
) {
    return (
        <div className="overflow-y-scroll h-[90vh] text-sm">
            <table className="custom-table">
                <thead className="">
                    <tr>
                        {columns.map((c, idx) => (
                            <th
                                key={idx}
                                className={`capitalize whitespace-nowrap px-2 ${
                                    c.width ? "" : ""
                                }`}
                                style={{ width: c.width }}
                            >
                                {c.render
                                    ? c.render()
                                    : (c.display_name ?? c.key)}
                            </th>
                        ))}
                    </tr>
                </thead>
                {!loading && (
                    <tbody>
                        {rows.map((r, ridx) => (
                            <tr key={ridx}>
                                {columns.map((c, cidx) => (
                                    <td
                                        key={`${ridx}-${cidx}`}
                                        className={`${
                                            c.width ? "" : ""
                                        } px-2 py-1`}
                                        style={{ width: c.width }}
                                    >
                                        {r.render(r.value, c.key)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>
            {loading && (
                <div className="w-full p-12 flex flex-col place-items-center">
                    <ActivityIndicator active />
                </div>
            )}
        </div>
    );
}
