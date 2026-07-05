import type { paths } from "@/api/api";
import qs from "qs";
import { useQueryParser } from "../useQueryParser";

export type CocktailQueryFilters = paths["/cocktails"]["get"]["parameters"]["query"];

export function useCocktailQueryParams() {
    function parseFilters(routeQuery: string): CocktailQueryFilters {
        try {
            const r = qs.parse(routeQuery, { ignoreQueryPrefix: true });

            return useQueryParser<CocktailQueryFilters>(r);
        } catch {
            return {};
        }
    }

    return {
        parseFilters,
    };
}
